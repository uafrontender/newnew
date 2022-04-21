/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import moment from 'moment';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import {
  fetchAcOptionById,
  fetchCurrentBidsForPost,
  placeBidOnAuction,
} from '../../../api/endpoints/auction';

import Lottie from '../../atoms/Lottie';
import GoBackButton from '../../molecules/GoBackButton';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import AcWinnerTab from '../../molecules/decision/auction/AcWinnerTab';
import AcOptionsTab from '../../molecules/decision/auction/AcOptionsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import LoadingModal from '../../molecules/LoadingModal';

// Assets
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import PaymentSuccessModal from '../../molecules/decision/PaymentSuccessModal';
import HeroPopup from '../../molecules/decision/HeroPopup';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { setTutorialStatus } from '../../../api/endpoints/user';

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostViewAC {
  post: newnewapi.Auction;
  postStatus: TPostStatusStringified;
  optionFromUrl?: newnewapi.Auction.Option;
  sessionId?: string;
  resetSessionId: () => void;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
  optionFromUrl,
  sessionId,
  resetSessionId,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const showSelectingWinnerOption = useMemo(
    () => postStatus === 'wating_for_decision',
    [postStatus]
  );

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Response viewed
  const [responseViewed, setResponseViewed] = useState(
    post.isResponseViewedByMe ?? false
  );

  // Tabs
  const tabs = useMemo(() => {
    if (post.winningOptionId) {
      return [
        {
          label: 'winner',
          value: 'winner',
        },
        {
          label: 'bids',
          value: 'bids',
        },
        ...(post.isCommentsAllowed
          ? [
              {
                label: 'comments',
                value: 'comments',
              },
            ]
          : []),
      ];
    }
    return [
      {
        label: 'bids',
        value: 'bids',
      },
      ...(post.isCommentsAllowed
        ? [
            {
              label: 'comments',
              value: 'comments',
            },
          ]
        : []),
    ];
  }, [post.isCommentsAllowed, post.winningOptionId]);

  const [currentTab, setCurrentTab] = useState<'bids' | 'comments' | 'winner'>(
    () => {
      if (!isBrowser()) {
        return 'bids';
      }
      const { hash } = window.location;
      if (
        hash &&
        (hash === '#bids' || hash === '#comments' || hash === '#winner')
      ) {
        return hash.substring(1) as 'bids' | 'comments' | 'winner';
      }
      if (post.winningOptionId) return 'winner';
      return 'bids';
    }
  );

  const handleChangeTab = (tab: string) => {
    if (tab === 'comments' && isMobile) {
      window.history.pushState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}#${tab}`
      );
    } else {
      window.history.replaceState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}#${tab}`
      );
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (!hash) {
        setCurrentTab('bids');
        return;
      }
      const parsedHash = hash.substring(1);
      if (
        parsedHash === 'bids' ||
        parsedHash === 'comments' ||
        parsedHash === 'winner'
      ) {
        setCurrentTab(parsedHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  // Vote from sessionId
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccesModalOpen, setPaymentSuccesModalOpen] = useState(false);

  // Total amount
  const [totalAmount, setTotalAmount] = useState(
    post.totalAmount?.usdCents ?? 0
  );

  // Options
  const [options, setOptions] = useState<TAcOptionWithHighestField[]>([]);
  const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(
    post.optionCount ?? ''
  );
  const [optionsNextPageToken, setOptionsNextPageToken] =
    useState<string | undefined | null>('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  // Winning option
  const [winningOption, setWinningOption] =
    useState<newnewapi.Auction.Option | undefined>();

  // Animating options
  const [optionToAnimate, setOptionToAnimate] = useState('');

  // const currLocation = `/post/${post.postUuid}`;

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
      if (optionsLoading) return;
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
      }
    },
    [post, setOptions, sortOptions, optionsLoading]
  );

  const fetchPostLatestData = useCallback(async () => {
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setTotalAmount(res.data.auction!!.totalAmount?.usdCents as number);
      setNumberOfOptions(res.data.auction!!.optionCount as number);
      handleUpdatePostStatus(res.data.auction!!.status!!);
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
          workingArrUnsorted = workingArr;
        }

        return sortOptions(workingArrUnsorted);
      });
      setOptionToAnimate(newOption.id.toString());

      setTimeout(() => {
        setOptionToAnimate('');
      }, 3000);
    },
    [setOptions, sortOptions]
  );
  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(post.postUuid, {
      postUpdates: {
        postUuid: post.postUuid,
      },
    });

    return () => {
      removeChannel(post.postUuid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    markAsViewed();
  }, [post, user.loggedIn, user.userData?.userUuid]);

  useEffect(() => {
    setOptions([]);
    setOptionsNextPageToken('');
    fetchBids();
    fetchPostLatestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    async function fetchAndSetWinningOption(id: number) {
      try {
        const payload = new newnewapi.GetAcOptionRequest({
          optionId: id,
        });

        const res = await fetchAcOptionById(payload);

        if (res.data?.option) {
          setWinningOption(res.data.option as newnewapi.Auction.Option);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (post.winningOptionId) {
      fetchAndSetWinningOption(post.winningOptionId as number);
    }
  }, [post.winningOptionId]);

  useEffect(() => {
    const makeBidFromSessionId = async () => {
      if (!sessionId) return;
      try {
        setLoadingModalOpen(true);
        const payload = new newnewapi.FulfillPaymentPurposeRequest({
          paymentSuccessUrl: `session_id=${sessionId}`,
        });

        const res = await placeBidOnAuction(payload);

        if (
          !res.data ||
          res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS ||
          res.error
        )
          throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data
          .option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        setLoadingModalOpen(false);
        setPaymentSuccesModalOpen(true);
      } catch (err) {
        console.error(err);
        setLoadingModalOpen(false);
      }
      resetSessionId();
    };

    makeBidFromSessionId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const socketHandlerOptionDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.AcOptionDeleted.decode(arr);

      if (decoded.optionId) {
        setOptions((curr) => {
          const workingArr = [...curr];
          return workingArr.filter((o) => o.id !== decoded.optionId);
        });
      }
    };

    const socketHandlerPostData = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostUpdated.decode(arr);

      if (!decoded) return;
      const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === post.postUuid) {
        setTotalAmount(decoded.post?.auction?.totalAmount?.usdCents!!);
        setNumberOfOptions(decoded.post?.auction?.optionCount!!);
      }
    };

    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.auction!!);
      }
    };

    if (socketConnection) {
      socketConnection.on(
        'AcOptionCreatedOrUpdated',
        socketHandlerOptionCreatedOrUpdated
      );
      socketConnection.on('AcOptionDeleted', socketHandlerOptionDeleted);
      socketConnection.on('PostUpdated', socketHandlerPostData);
      socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off(
          'AcOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection.off('AcOptionDeleted', socketHandlerOptionDeleted);
        socketConnection.off('PostUpdated', socketHandlerPostData);
        socketConnection.off('PostStatusUpdated', socketHandlerPostStatus);
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

  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.SetTutorialStatusRequest({
        acCurrentStep: user.userTutorialsProgress.remainingAcSteps!![1],
      });
      setTutorialStatus(payload);
    }
    dispatch(
      setUserTutorialsProgress({
        remainingAcSteps: [
          ...user.userTutorialsProgress.remainingAcSteps!!,
        ].slice(1),
      })
    );
  };

  useEffect(() => {
    if (loadingOptionsError) {
      toast.error(loadingOptionsError);
    }
  }, [loadingOptionsError]);

  return (
    <SWrapper>
      <SExpiresSection>
        {isMobile && (
          <SGoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        <PostTimer
          timestampSeconds={new Date(
            (post.expiresAt?.seconds as number) * 1000
          ).getTime()}
          postType="ac"
        />
      </SExpiresSection>
      <PostVideo
        postId={post.postUuid}
        announcement={post.announcement!!}
        response={post.response ?? undefined}
        responseViewed={responseViewed}
        handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTopInfo
        postType="ac"
        postId={post.postUuid}
        postStatus={postStatus}
        title={post.title}
        amountInBids={totalAmount}
        creator={post.creator!!}
        startsAtSeconds={post.startsAt?.seconds as number}
        isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
      />
      <SActivitesContainer
        decisionFailed={postStatus === 'failed'}
        showSelectingWinnerOption={showSelectingWinnerOption}
      >
        <DecisionTabs
          tabs={tabs}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'bids' ? (
          <AcOptionsTab
            postId={post.postUuid}
            postStatus={postStatus}
            postCreator={
              (post.creator?.nickname as string) ?? post.creator?.username
            }
            postDeadline={moment(
              (post.responseUploadDeadline?.seconds as number) * 1000
            )
              .subtract(3, 'days')
              .calendar()}
            options={options}
            // optionToAnimate={optionToAnimate}
            optionsLoading={optionsLoading}
            pagingToken={optionsNextPageToken}
            minAmount={
              post.minimalBid?.usdCents
                ? parseInt((post.minimalBid?.usdCents / 100).toFixed(0))
                : 5
            }
            handleLoadBids={fetchBids}
            handleAddOrUpdateOptionFromResponse={
              handleAddOrUpdateOptionFromResponse
            }
          />
        ) : currentTab === 'comments' && post.isCommentsAllowed ? (
          <CommentsTab
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => handleChangeTab('bids')}
          />
        ) : winningOption ? (
          <AcWinnerTab
            postId={post.postUuid}
            option={winningOption}
            postStatus={postStatus}
          />
        ) : currentTab === 'comments' && post.isCommentsAllowed ? (
          <CommentsTab
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => handleChangeTab('bids')}
          />
        ) : winningOption ? (
          <AcWinnerTab
            postId={post.postUuid}
            option={winningOption}
            postStatus={postStatus}
          />
        ) : (
          <SAnimationContainer>
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          </SAnimationContainer>
        )}
      </SActivitesContainer>

      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        isVisible={paymentSuccesModalOpen}
        closeModal={() => setPaymentSuccesModalOpen(false)}
      >
        {t('PaymentSuccessModal.ac', {
          postCreator:
            (post.creator?.nickname as string) ?? post.creator?.username,
          postDeadline: moment(
            (post.responseUploadDeadline?.seconds as number) * 1000
          )
            .subtract(3, 'days')
            .calendar(),
        })}
      </PaymentSuccessModal>
      <HeroPopup
        isPopupVisible={
          user!!.userTutorialsProgress.remainingAcSteps!![0] ===
          newnewapi.AcTutorialStep.AC_HERO
        }
        postType="AC"
        closeModal={goToNextStep}
      />
    </SWrapper>
  );
};

PostViewAC.defaultProps = {
  optionFromUrl: undefined,
  sessionId: undefined,
};

export default PostViewAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;
    min-height: 0;

    display: inline-grid;
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: max-content max-content minmax(0, 1fr);

    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    grid-template-areas:
      'video expires'
      'video title'
      'video activities';
    grid-template-columns: 410px 1fr;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  position: relative;

  display: flex;
  justify-content: center;

  width: 100%;
  margin-bottom: 6px;

  padding-left: 24px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: initial;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  position: absolute;
  left: 0;
  top: 4px;
`;

const SActivitesContainer = styled.div<{
  showSelectingWinnerOption: boolean;
  decisionFailed: boolean;
}>`
  grid-area: activities;

  display: flex;
  flex-direction: column;

  align-self: bottom;

  height: 100%;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    max-height: calc(500px);
  }

  ${({ theme }) => theme.media.laptop} {
    ${({ showSelectingWinnerOption, decisionFailed }) =>
      showSelectingWinnerOption
        ? css`
            max-height: calc(580px - 130px);
          `
        : !decisionFailed
        ? css`
            max-height: 580px;
          `
        : css`
            max-height: calc(580px - 120px);
          `}
  }
`;

const SAnimationContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
