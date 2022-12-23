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
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { SocketContext } from '../../../../contexts/socketContext';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../../api/endpoints/post';
import {
  fetchCurrentOptionsForMCPost,
  voteOnPost,
} from '../../../../api/endpoints/multiple_choice';

import PostVideo from '../../../molecules/decision/common/PostVideo';
import PostTimer from '../../../molecules/decision/common/PostTimer';
import PostTopInfo from '../../../molecules/decision/common/PostTopInfo';
import Headline from '../../../atoms/Headline';
import CommentsBottomSection from '../../../molecules/decision/common/CommentsBottomSection';
import PostVotingTab from '../../../molecules/decision/common/PostVotingTab';
import PostTimerEnded from '../../../molecules/decision/common/PostTimerEnded';

// Utils
import switchPostType from '../../../../utils/switchPostType';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { useBundles } from '../../../../contexts/bundlesContext';
import BuyBundleModal from '../../../molecules/bundles/BuyBundleModal';
import HighlightedButton from '../../../atoms/bundles/HighlightedButton';
import TicketSet from '../../../atoms/bundles/TicketSet';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import getDisplayname from '../../../../utils/getDisplayname';
import { SubscriptionToPost } from '../../../molecules/profile/SmsNotificationModal';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));
const LoadingModal = dynamic(() => import('../../../molecules/LoadingModal'));
const McOptionsTab = dynamic(
  () =>
    import('../../../molecules/decision/regular/multiple_choice/McOptionsTab')
);
const HeroPopup = dynamic(
  () => import('../../../molecules/decision/common/HeroPopup')
);
const PaymentSuccessModal = dynamic(
  () => import('../../../molecules/decision/common/PaymentSuccessModal')
);

const getPayWithCardErrorMessage = (
  status?: newnewapi.VoteOnPostResponse.Status
) => {
  switch (status) {
    case newnewapi.VoteOnPostResponse.Status.NOT_ENOUGH_FUNDS:
      return 'errors.notEnoughMoney';
    case newnewapi.VoteOnPostResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.VoteOnPostResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.VoteOnPostResponse.Status.MC_CANCELLED:
      return 'errors.mcCancelled';
    case newnewapi.VoteOnPostResponse.Status.MC_FINISHED:
      return 'errors.mcFinished';
    case newnewapi.VoteOnPostResponse.Status.MC_NOT_STARTED:
      return 'errors.mcNotStarted';
    case newnewapi.VoteOnPostResponse.Status.ALREADY_VOTED:
      return 'errors.alreadyVoted';
    case newnewapi.VoteOnPostResponse.Status.MC_VOTE_COUNT_TOO_SMALL:
      return 'errors.mcVoteCountTooSmall';
    case newnewapi.VoteOnPostResponse.Status.NOT_ALLOWED_TO_CREATE_NEW_OPTION:
      return 'errors.notAllowedToCreateNewOption';
    default:
      return 'errors.requestFailed';
  }
};

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostViewMC {}

const PostViewMC: React.FunctionComponent<IPostViewMC> = React.memo(() => {
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

  const {
    postParsed,
    postStatus,
    saveCard,
    stripeSetupIntentClientSecret,
    handleGoBackInsidePost,
    handleUpdatePostStatus,
    resetSetupIntentClientSecret,
  } = usePostInnerState();
  const post = useMemo(
    () => postParsed as newnewapi.MultipleChoice,
    [postParsed]
  );

  // Socket
  const socketConnection = useContext(SocketContext);

  // Bundle
  const { bundles } = useBundles();
  const creatorsBundle = useMemo(
    () =>
      bundles?.find(
        (bundle) => bundle.creator?.uuid === postParsed?.creator?.uuid
      ),
    [bundles, postParsed?.creator?.uuid]
  );

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

  // Post loading state
  const [postLoading, setPostLoading] = useState(false);

  // Vote after stripe redirect
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Total votes
  const [totalVotes, setTotalVotes] = useState(post.totalVotes ?? 0);

  // Bundle modal
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

  // Options
  const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const sortOptions = useCallback(
    (unsortedArr: TMcOptionWithHighestField[]) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < unsortedArr.length; i++) {
        // eslint-disable-next-line no-param-reassign
        unsortedArr[i].isHighest = false;
      }

      const highestOption = unsortedArr.sort(
        (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
      )[0];

      const optionsByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.creator?.uuid === user.userData?.userUuid)
            .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
        : [];

      const optionsSupportedByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.isSupportedByMe)
            .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
        : [];

      const optionsByVipUsers = unsortedArr
        .filter((o) => o.isCreatedBySubscriber)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        });

      const workingArrSorted = unsortedArr.sort(
        (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
      );

      const joinedArr = [
        ...(highestOption &&
        highestOption.creator?.uuid === user.userData?.userUuid
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
        workingSortedUnique as TMcOptionWithHighestField[]
      ).findIndex((o) => o.id === highestOption.id);

      if (workingSortedUnique[highestOptionIdx]) {
        workingSortedUnique[highestOptionIdx].isHighest = true;
      }

      return workingSortedUnique;
    },
    [user.userData?.userUuid]
  );

  const fetchOptions = useCallback(
    async (pageToken?: string) => {
      if (optionsLoading || loadingModalOpen) return;
      try {
        setOptionsLoading(true);
        setLoadingOptionsError('');

        const getCurrentOptionsPayload = new newnewapi.GetMcOptionsRequest({
          postUuid: post.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchCurrentOptionsForMCPost(
          getCurrentOptionsPayload
        );

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.options) {
          setOptions((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.options as TMcOptionWithHighestField[]),
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
      }
    },
    [optionsLoading, loadingModalOpen, post.postUuid, sortOptions]
  );

  const handleAddOrUpdateOptionFromResponse = useCallback(
    (newOrUpdatedption: newnewapi.MultipleChoice.Option) => {
      setOptions((curr) => {
        const workingArr = [...curr];
        let workingArrUnsorted;
        const idx = workingArr.findIndex(
          (op) => op.id === newOrUpdatedption.id
        );
        if (idx === -1) {
          workingArrUnsorted = [
            ...workingArr,
            newOrUpdatedption as TMcOptionWithHighestField,
          ];
        } else {
          workingArr[idx].voteCount = newOrUpdatedption.voteCount as number;
          workingArr[idx].supporterCount =
            newOrUpdatedption.supporterCount as number;
          workingArr[idx].isSupportedByMe = true;
          workingArrUnsorted = workingArr;
        }

        return sortOptions(workingArrUnsorted);
      });
    },
    [setOptions, sortOptions]
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: newnewapi.MultipleChoice.Option) => {
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
    setPostLoading(true);
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }
      setTotalVotes(res.data.multipleChoice?.totalVotes as number);
      if (res.data.multipleChoice?.status)
        handleUpdatePostStatus(res.data.multipleChoice?.status);

      setPostLoading(false);
    } catch (err) {
      console.error(err);
      setPostLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnVotingTimeExpired = () => {
    if (options.some((o) => o.supporterCount > 0)) {
      handleUpdatePostStatus('WAITING_FOR_RESPONSE');
    } else {
      handleUpdatePostStatus('FAILED');
    }
  };

  const subscription: SubscriptionToPost = useMemo(
    () => ({
      type: 'post',
      postId: post.postUuid,
      postTitle: post.title,
    }),
    [post]
  );

  // Mark post as viewed if logged in
  useEffect(() => {
    async function markAsViewed() {
      if (!user.loggedIn || user.userData?.userUuid === post.creator?.uuid)
        return;
      try {
        const markAsViewedPayload = new newnewapi.MarkPostRequest({
          markAs: newnewapi.MarkPostRequest.Kind.VIEWED,
          postUuid: post.postUuid,
        });

        const res = await markPost(markAsViewedPayload);

        if (res.error) throw new Error('Failed to mark post as viewed');
      } catch (err) {
        console.error(err);
      }
    }

    // setTimeout used to fix the React memory leak warning
    const timer = setTimeout(() => {
      markAsViewed();
    });
    return () => {
      clearTimeout(timer);
    };
  }, [post, user.loggedIn, user.userData?.userUuid]);

  useEffect(() => {
    // setTimeout used to fix the React memory leak warning
    const timer = setTimeout(() => {
      setOptions([]);
      setOptionsNextPageToken('');
      fetchOptions();
      fetchPostLatestData();
    });
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    const socketHandlerOptionCreatedOrUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.McOptionCreatedOrUpdated.decode(arr);
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
              decoded.option as TMcOptionWithHighestField,
            ];
          } else {
            // workingArr[idx] = decoded.option as TMcOptionWithHighestField;
            workingArr[idx].voteCount = decoded.option?.voteCount as number;
            workingArr[idx].supporterCount = decoded.option
              ?.supporterCount as number;
            workingArr[idx].firstVoter = decoded.option?.firstVoter;
            workingArrUnsorted = workingArr;
          }

          return sortOptions(workingArrUnsorted);
        });
      }
    };

    const socketHandlerOptionDeleted = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.McOptionDeleted.decode(arr);

      if (decoded.optionId) {
        setOptions((curr) => {
          const workingArr = [...curr];
          return workingArr.filter((o) => o.id !== decoded.optionId);
        });

        await fetchPostLatestData();
      }
    };

    const socketHandlerPostData = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostUpdated.decode(arr);

      if (!decoded) return;
      const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === post.postUuid) {
        if (decoded.post?.multipleChoice?.totalVotes)
          setTotalVotes(decoded.post?.multipleChoice?.totalVotes);
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'McOptionCreatedOrUpdated',
        socketHandlerOptionCreatedOrUpdated
      );
      socketConnection?.on('McOptionDeleted', socketHandlerOptionDeleted);
      socketConnection?.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'McOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection?.off('McOptionDeleted', socketHandlerOptionDeleted);
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

  const isVoteMadeAfterRedirect = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const makeVoteAfterStripeRedirect = async () => {
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

      isVoteMadeAfterRedirect.current = true;

      Mixpanel.track('MakeVoteAfterStripeRedirect', {
        _stage: 'Post',
        _postUuid: post.postUuid,
        _component: 'PostViewMC',
      });

      try {
        setLoadingModalOpen(true);

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

        const res = await voteOnPost(
          stripeContributionRequest,
          controller.signal
        );

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        const optionFromResponse = res.data
          .option as newnewapi.MultipleChoice.Option;
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
            post.postUuid
          }`,
          undefined,
          { shallow: true }
        );
      }
    };

    if (stripeSetupIntentClientSecret && !isVoteMadeAfterRedirect.current) {
      makeVoteAfterStripeRedirect();
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._persist?.rehydrated]);

  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingMcSteps &&
      user.userTutorialsProgress.remainingMcSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          mcCurrentStep: user.userTutorialsProgress.remainingMcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingMcSteps: [
            ...user.userTutorialsProgress.remainingMcSteps,
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
      user.userTutorialsProgress.remainingMcSteps &&
      user.userTutorialsProgress.remainingMcSteps[0] ===
        newnewapi.McTutorialStep.MC_HERO
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
                  postType='mc'
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
                postType='mc'
              />
            )}
          </SExpiresSection>
          <PostTopInfo
            subscription={subscription}
            totalVotes={totalVotes}
            hasWinner={false}
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
                  postType='mc'
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
                postType='mc'
              />
            )}
          </SExpiresSection>
        )}
        <PostVideo
          postId={post.postUuid}
          announcement={post.announcement!!}
          response={post.response ?? undefined}
          responseViewed={responseViewed}
          handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          isMuted={mutedMode}
          handleToggleMuted={() => handleToggleMutedMode()}
        />
        {isMobile && (
          <PostTopInfo
            subscription={subscription}
            totalVotes={totalVotes}
            hasWinner={false}
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
                        postType='mc'
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
                      postType='mc'
                    />
                  )}
                </SExpiresSection>
                <PostTopInfo
                  subscription={subscription}
                  totalVotes={totalVotes}
                  hasWinner={false}
                />
              </>
            )}
            <PostVotingTab
              bundleVotes={creatorsBundle?.bundle?.votesLeft ?? undefined}
            >{`${t('tabs.options')}`}</PostVotingTab>
          </div>
          <McOptionsTab
            post={post}
            postLoading={postLoading}
            postStatus={postStatus}
            postCreatorName={getDisplayname(post.creator)}
            postDeadline={moment(
              (post.responseUploadDeadline?.seconds as number) * 1000
            )
              .subtract(3, 'days')
              .calendar()}
            options={options}
            optionsLoading={optionsLoading}
            pagingToken={optionsNextPageToken}
            bundle={creatorsBundle?.bundle ?? undefined}
            handleLoadOptions={fetchOptions}
            handleAddOrUpdateOptionFromResponse={
              handleAddOrUpdateOptionFromResponse
            }
            handleRemoveOption={handleRemoveOption}
          />
        </SActivitiesContainer>
        {/* Loading Modal */}
        {loadingModalOpen && (
          <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
        )}
        {/* Payment success Modal */}
        {paymentSuccessModalOpen && (
          <PaymentSuccessModal
            postType='mc'
            isVisible={paymentSuccessModalOpen}
            closeModal={() => {
              Mixpanel.track('Close Payment Success Modal', {
                _stage: 'Post',
                _post: post.postUuid,
              });
              setPaymentSuccessModalOpen(false);
            }}
          >
            {t('paymentSuccessModal.mc', {
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
            postType='MC'
            closeModal={goToNextStep}
          />
        )}
      </SWrapper>
      {post.creator?.options?.isOfferingBundles && (
        <SBundlesContainer
          highlighted={creatorsBundle?.bundle?.votesLeft === 0}
        >
          {creatorsBundle?.bundle && (
            <STicketSet numberOFTickets={3} size={36} shift={11} />
          )}
          <SBundlesText>
            {creatorsBundle?.bundle
              ? t('mcPost.optionsTab.actionSection.getMoreBundles')
              : t('mcPost.optionsTab.actionSection.offersBundles', {
                  creator: getDisplayname(post.creator),
                })}
          </SBundlesText>
          <SHighlightedButton
            id='buy-bundle-button'
            size='small'
            onClick={() => {
              setBuyBundleModalOpen(true);
            }}
          >
            {creatorsBundle?.bundle
              ? t('mcPost.optionsTab.actionSection.getBundles')
              : t('mcPost.optionsTab.actionSection.viewBundles')}
          </SHighlightedButton>
        </SBundlesContainer>
      )}
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
      {/* Buy bundles */}
      {buyBundleModalOpen && post.creator && (
        <BuyBundleModal
          show
          creator={post.creator}
          onClose={() => {
            setBuyBundleModalOpen(false);
          }}
        />
      )}
    </>
  );
});

PostViewMC.defaultProps = {
  stripeSetupIntentClientSecret: undefined,
};

export default PostViewMC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 506px;
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

  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  width: 100%;
  margin-bottom: 6px;
`;

const SEndDate = styled.div`
  width: 100%;
  text-align: center;
  padding: 8px 0px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.quaternary};
`;

const SGoBackButton = styled(GoBackButton)`
  position: absolute;
  left: 0;
  top: 4px;
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

// Offering bundles
const SBundlesContainer = styled.div<{ highlighted: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, highlighted }) =>
    highlighted
      ? theme.colorsThemed.accent.yellow
      : // TODO: standardize color
      theme.name === 'light'
      ? '#E5E9F1'
      : '#2C2C33'};
  margin-top: 32px;

  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    margin-bottom: 48px;
  }
`;

const STicketSet = styled(TicketSet)`
  margin-right: 8px;
`;

const SBundlesText = styled.p`
  flex-grow: 1;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  text-align: center;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 16px;
  margin-right: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0px;
    text-align: start;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const SHighlightedButton = styled(HighlightedButton)`
  width: auto;
`;

const SCommentsSection = styled.div``;
