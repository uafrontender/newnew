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
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import {
  fetchAcOptionById,
  fetchCurrentBidsForPost,
} from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import Lottie from '../../atoms/Lottie';
import DecisionTabs from '../../molecules/decision/PostTabs';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';

// Icons
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

import isBrowser from '../../../utils/isBrowser';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import switchPostStatus, {
  TPostStatusStringified,
} from '../../../utils/switchPostStatus';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../api/endpoints/user';

const CommentsTab = dynamic(
  () => import('../../molecules/decision/CommentsTab')
);
const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const ResponseTimer = dynamic(
  () => import('../../molecules/decision/ResponseTimer')
);
const PostTimer = dynamic(() => import('../../molecules/decision/PostTimer'));
const AcWinnerTabModeration = dynamic(
  () =>
    import('../../molecules/decision/auction/moderation/AcWinnerTabModeration')
);
const AcOptionsTabModeration = dynamic(
  () =>
    import('../../molecules/decision/auction/moderation/AcOptionsTabModeration')
);
const HeroPopup = dynamic(() => import('../../molecules/decision/HeroPopup'));

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostModerationAC {
  post: newnewapi.Auction;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}
// TODO: memorize
const PostModerationAC: React.FunctionComponent<IPostModerationAC> = ({
  post,
  postStatus,
  handleUpdatePostStatus,
  handleGoBack,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const showSelectWinnerOption = useMemo(
    () => postStatus === 'waiting_for_decision',
    [postStatus]
  );

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const [winningOptionId, setWinningOptionId] = useState(
    post.winningOptionId ?? undefined
  );

  // Tabs
  const tabs = useMemo(() => {
    // NB! Will a check for winner option here
    if (winningOptionId) {
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
  }, [winningOptionId, post.isCommentsAllowed]);

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
      if (winningOptionId) return 'winner';
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

  // Respone upload
  const [responseFreshlyUploaded, setResponseFreshlyUploaded] =
    useState<newnewapi.IVideoUrls | undefined>(undefined);

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

  const handleUpdateWinningOption = (
    selectedOption: newnewapi.Auction.Option
  ) => {
    setWinningOption(selectedOption);
    setWinningOptionId(selectedOption.id);
    handleChangeTab('winner');
  };

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

      if (res.data.auction?.winningOptionId && !winningOptionId) {
        setWinningOptionId(res.data.auction?.winningOptionId);
        handleChangeTab('winner');
      }

      if (
        !responseFreshlyUploaded &&
        switchPostStatus('ac', res.data.auction!!.status!!) === 'succeeded' &&
        res.data?.auction?.response
      ) {
        setResponseFreshlyUploaded(res.data.auction.response);
      }

      setTotalAmount(res.data.auction!!.totalAmount?.usdCents as number);
      setNumberOfOptions(res.data.auction!!.optionCount as number);
      handleUpdatePostStatus(res.data.auction!!.status!!);
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        console.error(err);
      }
    }

    if (winningOptionId && !winningOption?.id) {
      fetchAndSetWinningOption(winningOptionId as number);
    }
  }, [winningOptionId, winningOption?.id]);

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

        if (!responseFreshlyUploaded && decoded.post?.auction?.response) {
          setResponseFreshlyUploaded(decoded.post.auction.response);
        }
      }
    };

    const socketHandlerPostStatus = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.auction!!);

        if (
          !responseFreshlyUploaded &&
          postStatus === 'processing_response' &&
          switchPostStatus('ac', decoded.auction!!) === 'succeeded'
        ) {
          const fetchPostPayload = new newnewapi.GetPostRequest({
            postUuid: post.postUuid,
          });

          const res = await fetchPostByUUID(fetchPostPayload);

          if (res.data?.auction?.response) {
            setResponseFreshlyUploaded(res.data?.auction?.response);
          }
        }
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
    postStatus,
    user.userData?.userUuid,
    setOptions,
    sortOptions,
  ]);

  useEffect(() => {
    if (loadingOptionsError) {
      toast.error(loadingOptionsError);
    }
  }, [loadingOptionsError]);

  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
        acCurrentStep: user.userTutorialsProgress.remainingAcSteps!![0],
      });
      markTutorialStepAsCompleted(payload);
    }
    dispatch(
      setUserTutorialsProgress({
        remainingAcSteps: [
          ...user.userTutorialsProgress.remainingAcSteps!!,
        ].slice(1),
      })
    );
  };

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  useEffect(() => {
    if (
      options.length > 0 &&
      user!!.userTutorialsProgressSynced &&
      user!!.userTutorialsProgress.remainingAcSteps!![0] ===
        newnewapi.AcTutorialStep.AC_HERO
    ) {
      setIsPopupVisible(true);
    } else {
      setIsPopupVisible(false);
    }
  }, [options, user]);

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
        {postStatus === 'waiting_for_response' ||
        postStatus === 'waiting_for_decision' ? (
          <ResponseTimer
            timestampSeconds={new Date(
              (post.responseUploadDeadline?.seconds as number) * 1000
            ).getTime()}
          />
        ) : (
          <PostTimer
            timestampSeconds={new Date(
              (post.expiresAt?.seconds as number) * 1000
            ).getTime()}
            postType='ac'
            isTutorialVisible={options.length > 0}
          />
        )}
      </SExpiresSection>
      <PostVideoModeration
        postId={post.postUuid}
        announcement={post.announcement!!}
        response={(post.response || responseFreshlyUploaded) ?? undefined}
        thumbnails={{
          startTime: 1,
          endTime: 3,
        }}
        postStatus={postStatus}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
        handleUpdateResponseVideo={(newValue) =>
          setResponseFreshlyUploaded(newValue)
        }
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
      <PostTopInfoModeration
        postType='ac'
        postStatus={postStatus}
        title={post.title}
        postId={post.postUuid}
        amountInBids={totalAmount}
        hasWinner={!!winningOptionId}
        hasResponse={!!post.response}
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
      <SActivitesContainer
        decisionFailed={postStatus === 'failed'}
        showSelectWinnerOption={showSelectWinnerOption}
      >
        <DecisionTabs
          tabs={tabs}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'bids' ? (
          <AcOptionsTabModeration
            postId={post.postUuid}
            postStatus={postStatus}
            options={options}
            optionsLoading={optionsLoading}
            pagingToken={optionsNextPageToken}
            handleLoadBids={fetchBids}
            handleRemoveOption={handleRemoveOption}
            handleUpdatePostStatus={handleUpdatePostStatus}
            handleUpdateWinningOption={handleUpdateWinningOption}
          />
        ) : currentTab === 'comments' && post.isCommentsAllowed ? (
          <CommentsTab
            canDeleteComments={post.creator?.uuid === user.userData?.userUuid}
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => handleChangeTab('bids')}
          />
        ) : winningOption ? (
          <AcWinnerTabModeration
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
      {isPopupVisible && (
        <HeroPopup
          isPopupVisible={isPopupVisible}
          postType='AC'
          closeModal={goToNextStep}
        />
      )}
    </SWrapper>
  );
};

PostModerationAC.defaultProps = {};

export default PostModerationAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;

    display: inline-grid;
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: max-content max-content minmax(0, 1fr);

    grid-column-gap: 16px;

    align-items: flex-start;

    padding-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    grid-template-areas:
      'video expires'
      'video title'
      'video activities';
    grid-template-columns: 410px 1fr;

    padding-bottom: initial;
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
  showSelectWinnerOption: boolean;
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
    ${({ showSelectWinnerOption, decisionFailed }) =>
      showSelectWinnerOption
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
