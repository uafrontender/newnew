/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { SocketContext } from '../../../../contexts/socketContext';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';
import {
  fetchCurrentBidsForPost,
  placeBidOnAuction,
} from '../../../../api/endpoints/auction';

import PostVideo from '../../../molecules/decision/common/PostVideo';
import PostTimer from '../../../molecules/decision/common/PostTimer';
import PostTopInfo from '../../../molecules/decision/common/PostTopInfo';
import PostTimerEnded from '../../../molecules/decision/common/PostTimerEnded';

// Utils
import switchPostType from '../../../../utils/switchPostType';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import CommentsBottomSection from '../../../molecules/decision/common/CommentsBottomSection';
import Headline from '../../../atoms/Headline';
import PostVotingTab from '../../../molecules/decision/common/PostVotingTab';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import AcAddNewOption from '../../../molecules/decision/regular/auction/AcAddNewOption';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import { usePushNotifications } from '../../../../contexts/pushNotificationsContext';
import getDisplayname from '../../../../utils/getDisplayname';
import { TAcOptionWithHighestField } from '../../../../utils/hooks/useAcOptions';
// import { SubscriptionToPost } from '../../../molecules/profile/SmsNotificationModal';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));
const AcOptionsTab = dynamic(
  () => import('../../../molecules/decision/regular/auction/AcOptionsTab')
);
const LoadingModal = dynamic(() => import('../../../molecules/LoadingModal'));
const PaymentSuccessModal = dynamic(
  () => import('../../../molecules/decision/common/PaymentSuccessModal')
);
const HeroPopup = dynamic(
  () => import('../../../molecules/decision/common/HeroPopup')
);

const getPayWithCardErrorMessage = (
  status?: newnewapi.PlaceBidResponse.Status
) => {
  switch (status) {
    case newnewapi.PlaceBidResponse.Status.NOT_ENOUGH_MONEY:
      return 'errors.notEnoughMoney';
    case newnewapi.PlaceBidResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.PlaceBidResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.PlaceBidResponse.Status.BIDDING_NOT_STARTED:
      return 'errors.biddingNotStarted';
    case newnewapi.PlaceBidResponse.Status.BIDDING_ENDED:
      return 'errors.biddingIsEnded';
    default:
      return 'errors.requestFailed';
  }
};

interface IPostViewAC {}

const PostViewAC: React.FunctionComponent<IPostViewAC> = React.memo(() => {
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const router = useRouter();
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const {
    postParsed,
    postStatus,
    saveCard,
    stripeSetupIntentClientSecret,
    handleGoBackInsidePost,
    handleUpdatePostStatus,
    resetSetupIntentClientSecret,
    refetchPost,
  } = usePostInnerState();
  const post = useMemo(() => postParsed as newnewapi.Auction, [postParsed]);

  // Socket
  const socketConnection = useContext(SocketContext);

  // Response viewed
  const [responseViewed, setResponseViewed] = useState(
    post.isResponseViewedByMe ?? false
  );

  const handleCommentFocus = () => {
    if (isMobile && !!document.getElementById('action-button-mobile')) {
      document.getElementById('action-button-mobile')!!.style.display = 'none';
    }
  };
  const handleCommentBlur = () => {
    if (isMobile && !!document.getElementById('action-button-mobile')) {
      document.getElementById('action-button-mobile')!!.style.display = '';
    }
  };

  // Vote after stripe redirect
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Total amount
  const totalAmount = useMemo(
    () => post.totalAmount?.usdCents ?? 0,
    [post.totalAmount?.usdCents]
  );

  // Options
  const numberOfOptions = useMemo(
    () => post.optionCount ?? '',
    [post.optionCount]
  );
  const [options, setOptions] = useState<TAcOptionWithHighestField[]>([]);
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');
  const [triedLoading, setTriedLoading] = useState(false);

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const sortOptions = useCallback(
    (unsortedArr: TAcOptionWithHighestField[]) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < unsortedArr.length; i++) {
        // eslint-disable-next-line no-param-reassign
        unsortedArr[i].isHighest = false;
      }

      const highestOption = unsortedArr.sort(
        (a, b) =>
          (b?.totalAmount?.usdCents as number) -
          (a?.totalAmount?.usdCents as number)
      )[0];

      unsortedArr.forEach((option, i) => {
        if (i > 0) {
          // eslint-disable-next-line no-param-reassign
          option.isHighest = false;
        }
      });

      const optionsByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.creator?.uuid === user.userData?.userUuid)
            .sort((a, b) => {
              return (b.id as number) - (a.id as number);
            })
        : [];

      const optionsSupportedByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.isSupportedByMe)
            .sort((a, b) => {
              return (b.id as number) - (a.id as number);
            })
        : [];

      const optionsByVipUsers = unsortedArr
        .filter((o) => o.isCreatedBySubscriber)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        });

      const workingArrSorted = unsortedArr.sort((a, b) => {
        // Sort the rest by newest first
        return (b.id as number) - (a.id as number);
      });

      const joinedArr = [
        ...(highestOption &&
        (highestOption.creator?.uuid === user.userData?.userUuid ||
          highestOption.isSupportedByMe)
          ? [highestOption]
          : []),
        ...optionsByUser,
        ...optionsSupportedByUser,
        ...optionsByVipUsers,
        ...(highestOption &&
        highestOption.creator?.uuid !== user.userData?.userUuid
          ? [highestOption]
          : []),
        ...workingArrSorted,
      ];

      const workingSortedUnique =
        joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

      const highestOptionIdx = (
        workingSortedUnique as TAcOptionWithHighestField[]
      ).findIndex((o) => o.id === highestOption.id);

      if (workingSortedUnique[highestOptionIdx]) {
        (
          workingSortedUnique[highestOptionIdx] as TAcOptionWithHighestField
        ).isHighest = true;
      }

      return workingSortedUnique;
    },
    [user.userData?.userUuid]
  );

  const fetchBids = useCallback(
    async (pageToken?: string) => {
      if (optionsLoading || loadingModalOpen) return;
      try {
        setOptionsLoading(true);
        setLoadingOptionsError('');

        const getCurrentBidsPayload = new newnewapi.GetAcOptionsRequest({
          postUuid: post.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchCurrentBidsForPost(getCurrentBidsPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.options) {
          setOptions((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.options as TAcOptionWithHighestField[]),
            ];

            return sortOptions(workingArr);
          });
          setOptionsNextPageToken(res.data.paging?.nextPageToken);
        }

        setOptionsLoading(false);
      } catch (err) {
        setOptionsLoading(false);
        setLoadingOptionsError((err as Error).message);
        console.error(err);
      } finally {
        setTriedLoading(true);
      }
    },
    [optionsLoading, loadingModalOpen, post.postUuid, sortOptions]
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: newnewapi.Auction.Option) => {
      setOptions((curr) => {
        const workingArr = [...curr];
        const workingArrUnsorted = [
          ...workingArr.filter((o) => o.id !== optionToRemove.id),
        ];
        return sortOptions(workingArrUnsorted);
      });
    },
    [setOptions, sortOptions]
  );

  const fetchPostLatestData = useCallback(async () => {
    try {
      const res = await refetchPost();

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      if (res.data.auction) {
        if (res.data.auction.status)
          handleUpdatePostStatus(res.data.auction.status);
      }
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddOrUpdateOptionFromResponse = useCallback(
    (newOption: newnewapi.Auction.Option) => {
      setOptions((curr) => {
        const workingArr = [...curr];
        let workingArrUnsorted;
        const idx = workingArr.findIndex((op) => op.id === newOption?.id);
        if (idx === -1) {
          workingArrUnsorted = [
            ...workingArr,
            newOption as TAcOptionWithHighestField,
          ];
        } else {
          workingArr[idx].supporterCount = newOption?.supporterCount as number;
          workingArr[idx].totalAmount =
            newOption?.totalAmount as newnewapi.IMoneyAmount;
          workingArr[idx].isSupportedByMe = newOption?.isSupportedByMe;
          workingArrUnsorted = workingArr;
        }

        return sortOptions(workingArrUnsorted);
      });
    },
    [setOptions, sortOptions]
  );

  const handleOnVotingTimeExpired = () => {
    if (options && options.some((o) => o.supporterCount > 0)) {
      handleUpdatePostStatus('WAITING_FOR_DECISION');
    } else {
      handleUpdatePostStatus('FAILED');
    }
  };

  /* const subscription: SubscriptionToPost = useMemo(
    () => ({
      type: 'post',
      postUuid: post.postUuid,
      postTitle: post.title,
    }),
    [post]
  ); */

  useEffect(() => {
    // setTimeout used to fix the React memory leak warning
    const timer = setTimeout(() => {
      setOptions([]);
      setOptionsNextPageToken('');
      fetchBids();
    });
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    const socketHandlerOptionCreatedOrUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.AcOptionCreatedOrUpdated.decode(arr);
      if (decoded.option && decoded.postUuid === post.postUuid) {
        setOptions((curr) => {
          const workingArr = [...curr];
          let workingArrUnsorted;
          const idx = workingArr.findIndex(
            (op) => op.id === decoded.option?.id
          );
          if (idx === -1) {
            workingArrUnsorted = [
              ...workingArr,
              decoded.option as TAcOptionWithHighestField,
            ];
          } else {
            workingArr[idx].supporterCount = decoded.option
              ?.supporterCount as number;
            workingArr[idx].totalAmount = decoded.option
              ?.totalAmount as newnewapi.IMoneyAmount;
            workingArrUnsorted = workingArr;
          }

          return sortOptions(workingArrUnsorted);
        });
      }
    };

    const socketHandlerOptionDeleted = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.AcOptionDeleted.decode(arr);

      if (decoded.optionId) {
        setOptions((curr) => {
          const workingArr = [...curr];
          return workingArr.filter((o) => o.id !== decoded.optionId);
        });

        await fetchPostLatestData();
      }
    };

    const socketHandlerPostData = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostUpdated.decode(arr);

      if (!decoded) return;
      const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === post.postUuid) {
        await fetchPostLatestData();
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'AcOptionCreatedOrUpdated',
        socketHandlerOptionCreatedOrUpdated
      );
      socketConnection?.on('AcOptionDeleted', socketHandlerOptionDeleted);
      socketConnection?.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'AcOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection?.off('AcOptionDeleted', socketHandlerOptionDeleted);
        socketConnection?.off('PostUpdated', socketHandlerPostData);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socketConnection,
    post,
    user.userData?.userUuid,
    setOptions,
    sortOptions,
  ]);

  const isBidMadeAfterRedirect = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const makeBidAfterStripeRedirect = async () => {
      if (!stripeSetupIntentClientSecret || loadingModalOpen) return;

      if (!user._persist?.rehydrated) {
        return;
      }

      if (!user.loggedIn) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('MakeBidAfterStripeRedirect', {
        _stage: 'Post',
        _postUuid: post.postUuid,
        _component: 'PostViewAC',
      });

      isBidMadeAfterRedirect.current = true;

      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            stripeSetupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        resetSetupIntentClientSecret();

        const res = await placeBidOnAuction(
          stripeContributionRequest,
          controller.signal
        );

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        const optionFromResponse = res.data.option as newnewapi.Auction.Option;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        await fetchPostLatestData();

        setLoadingModalOpen(false);
        setPaymentSuccessModalOpen(true);
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);

        setLoadingModalOpen(false);
      } finally {
        router.replace(
          `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/p/${
            post.postShortId ? post.postShortId : post.postUuid
          }`,
          undefined,
          { shallow: true }
        );
      }
    };

    if (stripeSetupIntentClientSecret && !isBidMadeAfterRedirect.current) {
      makeBidAfterStripeRedirect();
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._persist?.rehydrated]);

  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingAcSteps &&
      user.userTutorialsProgress.remainingAcSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          acCurrentStep: user.userTutorialsProgress.remainingAcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingAcSteps: [
            ...user.userTutorialsProgress.remainingAcSteps,
          ].slice(1),
        })
      );
    }
  };

  useEffect(() => {
    if (loadingOptionsError) {
      showErrorToastCustom(loadingOptionsError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingOptionsError]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  useEffect(() => {
    if (
      user.userTutorialsProgressSynced &&
      user.userTutorialsProgress.remainingAcSteps &&
      user.userTutorialsProgress.remainingAcSteps[0] ===
        newnewapi.AcTutorialStep.AC_HERO
    ) {
      setIsPopupVisible(true);
    } else {
      setIsPopupVisible(false);
    }
  }, [user]);

  // Scroll to comments if hash is present
  useEffect(() => {
    const handleCommentsInitialHash = () => {
      const { hash } = window.location;
      if (!hash) {
        return;
      }

      const parsedHash = hash.substring(1);

      if (parsedHash === 'comments') {
        setTimeout(() => {
          document.getElementById('comments')?.scrollIntoView();
        }, 100);
      }
    };

    handleCommentsInitialHash();
  }, []);

  return (
    <>
      {isTablet && (
        <>
          <SExpiresSection>
            {postStatus === 'voting' ? (
              <>
                <PostTimer
                  timestampSeconds={new Date(
                    (post.expiresAt?.seconds as number) * 1000
                  ).getTime()}
                  postType='ac'
                  onTimeExpired={handleOnVotingTimeExpired}
                />
                <SEndDate>
                  {t('expires.end_date')}{' '}
                  {moment((post.expiresAt?.seconds as number) * 1000).format(
                    'DD MMM YYYY [at] hh:mm A'
                  )}
                </SEndDate>
              </>
            ) : (
              <PostTimerEnded
                timestampSeconds={new Date(
                  (post.expiresAt?.seconds as number) * 1000
                ).getTime()}
                postType='ac'
              />
            )}
          </SExpiresSection>
          <PostTopInfo
            /* subscription={subscription} */
            amountInBids={totalAmount}
            hasWinner={!!post.winningOptionId}
          />
        </>
      )}
      <SWrapper>
        {isMobile && (
          <SExpiresSection>
            <SGoBackButton onClick={handleGoBackInsidePost} />
            {postStatus === 'voting' ? (
              <>
                <PostTimer
                  timestampSeconds={new Date(
                    (post.expiresAt?.seconds as number) * 1000
                  ).getTime()}
                  postType='ac'
                  onTimeExpired={handleOnVotingTimeExpired}
                />
                <SEndDate>
                  {t('expires.end_date')}{' '}
                  {moment((post.expiresAt?.seconds as number) * 1000).format(
                    'DD MMM YYYY [at] hh:mm A'
                  )}
                </SEndDate>
              </>
            ) : (
              <PostTimerEnded
                timestampSeconds={new Date(
                  (post.expiresAt?.seconds as number) * 1000
                ).getTime()}
                postType='ac'
              />
            )}
          </SExpiresSection>
        )}
        <PostVideo
          postUuid={post.postUuid}
          announcement={post.announcement!!}
          response={post.response ?? undefined}
          responseViewed={responseViewed}
          handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          isMuted={mutedMode}
          handleToggleMuted={() => handleToggleMutedMode()}
        />
        {isMobile && (
          <PostTopInfo
            /* subscription={subscription} */
            amountInBids={totalAmount}
            hasWinner={!!post.winningOptionId}
          />
        )}
        <SActivitiesContainer>
          <div
            style={{
              flex: '0 0 auto',
              width: '100%',
            }}
          >
            {!isMobileOrTablet && (
              <>
                <SExpiresSection>
                  {postStatus === 'voting' ? (
                    <>
                      <PostTimer
                        timestampSeconds={new Date(
                          (post.expiresAt?.seconds as number) * 1000
                        ).getTime()}
                        postType='ac'
                        onTimeExpired={handleOnVotingTimeExpired}
                      />
                      <SEndDate>
                        {t('expires.end_date')}{' '}
                        {moment(
                          (post.expiresAt?.seconds as number) * 1000
                        ).format('DD MMM YYYY [at] hh:mm A')}
                      </SEndDate>
                    </>
                  ) : (
                    <PostTimerEnded
                      timestampSeconds={new Date(
                        (post.expiresAt?.seconds as number) * 1000
                      ).getTime()}
                      postType='ac'
                    />
                  )}
                </SExpiresSection>
                <PostTopInfo
                  /* subscription={subscription} */
                  amountInBids={totalAmount}
                  hasWinner={!!post.winningOptionId}
                />
              </>
            )}
            <PostVotingTab>
              {`${
                !!numberOfOptions && numberOfOptions > 0 ? numberOfOptions : ''
              } ${
                numberOfOptions === 1 ? t('tabs.bids_singular') : t('tabs.bids')
              }`}
            </PostVotingTab>
          </div>
          <AcOptionsTab
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            postStatus={postStatus}
            postText={post.title}
            postCreatorName={getDisplayname(post.creator)}
            postDeadline={moment(
              (post.responseUploadDeadline?.seconds as number) * 1000
            )
              .subtract(3, 'days')
              .calendar()}
            options={options}
            optionsLoading={optionsLoading}
            pagingToken={optionsNextPageToken}
            triedLoading={triedLoading}
            handleLoadBids={fetchBids}
            handleAddOrUpdateOptionFromResponse={
              handleAddOrUpdateOptionFromResponse
            }
            handleRemoveOption={handleRemoveOption}
          />
          {postStatus === 'voting' && (
            <AcAddNewOption
              postUuid={post.postUuid}
              postShortId={post.postShortId ?? ''}
              postStatus={postStatus}
              postText={post.title}
              postCreator={getDisplayname(post.creator)}
              postDeadline={moment(
                (post.responseUploadDeadline?.seconds as number) * 1000
              )
                .subtract(3, 'days')
                .calendar()}
              options={options}
              minAmount={
                post.minimalBid?.usdCents
                  ? parseInt((post.minimalBid?.usdCents / 100).toFixed(0))
                  : 5
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
            />
          )}
        </SActivitiesContainer>
        {/* Loading Modal */}
        {loadingModalOpen && (
          <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
        )}
        {/* Payment success Modal */}
        {paymentSuccessModalOpen && (
          <PaymentSuccessModal
            postType='ac'
            isVisible={paymentSuccessModalOpen}
            closeModal={() => {
              Mixpanel.track('Close Payment Success Modal', {
                _stage: 'Post',
                _postUuid: post.postUuid,
              });
              setPaymentSuccessModalOpen(false);
              promptUserWithPushNotificationsPermissionModal();
            }}
          >
            {t('paymentSuccessModal.ac', {
              postCreator: getDisplayname(post.creator),
              postDeadline: moment(
                (post.responseUploadDeadline?.seconds as number) * 1000
              )
                .subtract(3, 'days')
                .calendar(),
            })}
          </PaymentSuccessModal>
        )}
        {isPopupVisible && (
          <HeroPopup
            isPopupVisible={isPopupVisible}
            postType='AC'
            closeModal={goToNextStep}
          />
        )}
      </SWrapper>
      {post.isCommentsAllowed && (
        <SCommentsSection id='comments'>
          <SCommentsHeadline variant={4}>
            {t('successCommon.comments.heading')}
          </SCommentsHeadline>
          <CommentsBottomSection
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            commentsRoomId={post.commentsRoomId as number}
            onFormBlur={handleCommentBlur}
            onFormFocus={handleCommentFocus}
          />
        </SCommentsSection>
      )}
    </>
  );
});

PostViewAC.defaultProps = {
  stripeSetupIntentClientSecret: undefined,
};

export default PostViewAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;
    min-height: 0;
    align-items: flex-start;

    display: flex;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    display: flex;
    gap: 32px;
  }
`;

const SExpiresSection = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: 28px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas:
    'back timer'
    'endsOn endsOn';
  justify-content: center;
  flex-wrap: wrap;

  width: 100%;
  margin-bottom: 6px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const SEndDate = styled.div`
  grid-area: endsOn;
  width: 100%;
  text-align: center;
  padding: 8px 0px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.quaternary};
`;

const SGoBackButton = styled(GoBackButton)`
  grid-area: back;
  position: relative;
  top: -4px;
  left: -8px;
`;

const SActivitiesContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;

    display: flex;
    flex-direction: column;
    gap: 16px;

    height: 506px;
    max-height: 506px;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
  }
`;

// Comments
const SCommentsHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SCommentsSection = styled.div``;
