/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
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
import dynamic from 'next/dynamic';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import {
  fetchCurrentOptionsForMCPost,
  getMcOption,
} from '../../../api/endpoints/multiple_choice';
import isBrowser from '../../../utils/isBrowser';
import switchPostStatus, {
  TPostStatusStringified,
} from '../../../utils/switchPostStatus';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID } from '../../../api/endpoints/post';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { markTutorialStepAsCompleted } from '../../../api/endpoints/user';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import Lottie from '../../atoms/Lottie';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';
import DecisionTabs from '../../molecules/decision/PostTabs';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

const LoadingModal = dynamic(() => import('../../molecules/LoadingModal'));
const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const HeroPopup = dynamic(() => import('../../molecules/decision/HeroPopup'));
const ResponseTimer = dynamic(
  () => import('../../molecules/decision/ResponseTimer')
);
const PostTimer = dynamic(() => import('../../molecules/decision/PostTimer'));
const CommentsTab = dynamic(
  () => import('../../molecules/decision/CommentsTab')
);
const McOptionsTabModeration = dynamic(
  () =>
    import(
      '../../molecules/decision/multiple_choice/moderation/McOptionsTabModeration'
    )
);
const McWinnerTabModeration = dynamic(
  () =>
    import(
      '../../molecules/decision/multiple_choice/moderation/McWinnerTabModeration'
    )
);

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostModerationMC {
  post: newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleGoBack: () => void;
}

// TODO: memorize
const PostModerationMC: React.FunctionComponent<IPostModerationMC> = ({
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

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Tabs
  const tabs = useMemo(() => {
    if (post.winningOptionId) {
      return [
        {
          label: 'winner',
          value: 'winner',
        },
        {
          label: 'options',
          value: 'options',
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
        label: 'options',
        value: 'options',
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

  const [currentTab, setCurrentTab] = useState<
    'options' | 'comments' | 'winner'
  >(() => {
    if (!isBrowser()) {
      return 'options';
    }
    const { hash } = window.location;
    if (
      hash &&
      (hash === '#options' || hash === '#comments' || hash === '#winner')
    ) {
      return hash.substring(1) as 'options' | 'comments';
    }
    if (post.winningOptionId) return 'winner';
    return 'options';
  });

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
        setCurrentTab('options');
        return;
      }
      const parsedHash = hash.substring(1);
      if (
        parsedHash === 'options' ||
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

  // Respone upload
  const [responseFreshlyUploaded, setResponseFreshlyUploaded] =
    useState<newnewapi.IVideoUrls | undefined>(undefined);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Total votes
  const [totalVotes, setTotalVotes] = useState(post.totalVotes ?? 0);

  // Options
  const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
  const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(
    post.optionCount ?? ''
  );
  const [optionsNextPageToken, setOptionsNextPageToken] =
    useState<string | undefined | null>('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  // Winning option
  const [winningOption, setWinningOption] =
    useState<newnewapi.MultipleChoice.Option | undefined>();

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

      // const optionsByVipUsers = [];

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
        // ...optionsByVipUsers,
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
      if (optionsLoading) return;
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
    [optionsLoading, setOptions, sortOptions, post]
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
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      if (
        !responseFreshlyUploaded &&
        switchPostStatus('ac', res.data.multipleChoice!!.status!!) ===
          'succeeded' &&
        res.data?.multipleChoice?.response
      ) {
        setResponseFreshlyUploaded(res.data.multipleChoice.response);
      }

      setTotalVotes(res.data.multipleChoice!!.totalVotes as number);
      setNumberOfOptions(res.data.multipleChoice!!.optionCount as number);
      handleUpdatePostStatus(res.data.multipleChoice!!.status!!);
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    fetchOptions();
    fetchPostLatestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    async function fetchAndSetWinningOption(id: number) {
      try {
        const payload = new newnewapi.GetMcOptionRequest({
          optionId: id,
        });

        const res = await getMcOption(payload);

        if (res.data?.option) {
          setWinningOption(res.data.option as newnewapi.MultipleChoice.Option);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (post.winningOptionId) {
      fetchAndSetWinningOption(post.winningOptionId as number);
    }
  }, [post.winningOptionId]);

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
            workingArr[idx].voteCount = decoded.option?.voteCount as number;
            workingArrUnsorted = workingArr;
          }

          return sortOptions(workingArrUnsorted);
        });
      }
    };

    const socketHandlerOptionDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.McOptionDeleted.decode(arr);

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
        setTotalVotes(decoded.post?.multipleChoice?.totalVotes!!);
        setNumberOfOptions(decoded.post?.multipleChoice?.optionCount!!);

        if (
          !responseFreshlyUploaded &&
          decoded.post?.multipleChoice?.response
        ) {
          setResponseFreshlyUploaded(decoded.post.multipleChoice.response);
        }
      }
    };

    const socketHandlerPostStatus = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.multipleChoice!!);

        if (
          !responseFreshlyUploaded &&
          postStatus === 'processing_response' &&
          switchPostStatus('mc', decoded.multipleChoice!!) === 'succeeded'
        ) {
          const fetchPostPayload = new newnewapi.GetPostRequest({
            postUuid: post.postUuid,
          });

          const res = await fetchPostByUUID(fetchPostPayload);

          if (res.data?.multipleChoice?.response) {
            setResponseFreshlyUploaded(res.data?.multipleChoice?.response);
          }
        }
      }
    };

    if (socketConnection) {
      socketConnection.on(
        'McOptionCreatedOrUpdated',
        socketHandlerOptionCreatedOrUpdated
      );
      socketConnection.on('McOptionDeleted', socketHandlerOptionDeleted);
      socketConnection.on('PostUpdated', socketHandlerPostData);
      socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off(
          'McOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection.off('McOptionDeleted', socketHandlerOptionDeleted);
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

  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
        mcCurrentStep: user.userTutorialsProgress.remainingMcSteps!![0],
      });
      markTutorialStepAsCompleted(payload);
    }
    dispatch(
      setUserTutorialsProgress({
        remainingMcSteps: [
          ...user.userTutorialsProgress.remainingMcSteps!!,
        ].slice(1),
      })
    );
  };

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  useEffect(() => {
    if (
      user!!.userTutorialsProgressSynced &&
      user!!.userTutorialsProgress.remainingMcSteps!![0] ===
        newnewapi.McTutorialStep.MC_HERO
    ) {
      setIsPopupVisible(true);
    } else {
      setIsPopupVisible(false);
    }
  }, [user]);

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
        {postStatus === 'waiting_for_response' ? (
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
            postType='mc'
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
        postType='mc'
        postStatus={postStatus}
        title={post.title}
        postId={post.postUuid}
        totalVotes={totalVotes}
        hasWinner={false}
        hasResponse={!!post.response}
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
      <SActivitesContainer decisionFailed={postStatus === 'failed'}>
        <DecisionTabs
          tabs={tabs}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'options' ? (
          <McOptionsTabModeration
            post={post}
            options={options}
            optionsLoading={optionsLoading}
            pagingToken={optionsNextPageToken}
            handleLoadOptions={fetchOptions}
            handleRemoveOption={handleRemoveOption}
          />
        ) : currentTab === 'comments' && post.isCommentsAllowed ? (
          <CommentsTab
            canDeleteComments={post.creator?.uuid === user.userData?.userUuid}
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => handleChangeTab('options')}
          />
        ) : winningOption ? (
          <McWinnerTabModeration
            postId={post.postUuid}
            postCreator={post.creator as newnewapi.User}
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
      {loadingModalOpen && (
        <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      )}

      {isPopupVisible && (
        <HeroPopup
          isPopupVisible={isPopupVisible}
          postType='MC'
          closeModal={goToNextStep}
        />
      )}
    </SWrapper>
  );
};

PostModerationMC.defaultProps = {};

export default PostModerationMC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;

    display: grid;
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
    ${({ decisionFailed }) =>
      !decisionFailed
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
