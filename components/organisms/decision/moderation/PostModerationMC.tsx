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
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';
import {
  fetchCurrentOptionsForMCPost,
  getMcOption,
} from '../../../../api/endpoints/multiple_choice';
import switchPostType from '../../../../utils/switchPostType';
import { fetchPostByUUID } from '../../../../api/endpoints/post';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import useSynchronizedHistory from '../../../../utils/hooks/useSynchronizedHistory';

import PostVideoModeration from '../../../molecules/decision/moderation/PostVideoModeration';
import PostTopInfoModeration from '../../../molecules/decision/moderation/PostTopInfoModeration';
import Headline from '../../../atoms/Headline';
import CommentsBottomSection from '../../../molecules/decision/common/CommentsBottomSection';
import PostVotingTab from '../../../molecules/decision/common/PostVotingTab';
import PostTimerEnded from '../../../molecules/decision/common/PostTimerEnded';
import PostResponseTabModeration from '../../../molecules/decision/moderation/PostResponseTabModeration';

import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';
import PostModerationResponsesContextProvider from '../../../../contexts/postModerationResponsesContext';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));
const HeroPopup = dynamic(
  () => import('../../../molecules/decision/common/HeroPopup')
);
const ResponseTimer = dynamic(
  () => import('../../../molecules/decision/common/ResponseTimer')
);
const PostTimer = dynamic(
  () => import('../../../molecules/decision/common/PostTimer')
);
const McOptionsTabModeration = dynamic(
  () =>
    import(
      '../../../molecules/decision/moderation/multiple_choice/McOptionsTabModeration'
    )
);

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostModerationMC {}

const PostModerationMC: React.FunctionComponent<IPostModerationMC> = React.memo(
  () => {
    const { t } = useTranslation('modal-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const router = useRouter();

    const {
      postParsed,
      postStatus,
      handleGoBackInsidePost,
      handleUpdatePostStatus,
    } = usePostModalInnerState();
    const post = useMemo(
      () => postParsed as newnewapi.MultipleChoice,
      [postParsed]
    );

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    // Additional responses
    const [
      additionalResponsesFreshlyLoaded,
      setAdditionalResponsesFreshlyLoaded,
    ] = useState(post.additionalResponses);

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    // Announcement
    const [announcement, setAnnouncement] = useState(post.announcement);

    // Comments
    const { ref: commentsSectionRef, inView } = useInView({
      threshold: 0.8,
    });

    const handleCommentFocus = () => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display =
          'none';
      }
    };

    const handleCommentBlur = () => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display = '';
      }
    };

    // Tabs
    const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
      post.response ||
        postStatus === 'waiting_for_response' ||
        postStatus === 'processing_response'
        ? 'response'
        : 'announcement'
    );

    const handleChangeTab = useCallback(
      (newValue: 'announcement' | 'response') => setOpenedTab(newValue),
      []
    );

    // Total votes
    const [totalVotes, setTotalVotes] = useState(post.totalVotes ?? 0);

    // Options
    const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
    const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(
      post.optionCount ?? ''
    );
    const [optionsNextPageToken, setOptionsNextPageToken] = useState<
      string | undefined | null
    >('');
    const [optionsLoading, setOptionsLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingOptionsError, setLoadingOptionsError] = useState('');

    // Winning option
    const [winningOption, setWinningOption] = useState<
      newnewapi.MultipleChoice.Option | undefined
    >();

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
              .sort(
                (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
              )
          : [];

        const optionsSupportedByUser = user.userData?.userUuid
          ? unsortedArr
              .filter((o) => o.isSupportedByMe)
              .sort(
                (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
              )
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
        Mixpanel.track('Removed Option', {
          _stage: 'Post',
          _postUuid: post.postUuid,
          _component: 'PostModerationMC',
        });
        setOptions((curr) => {
          const workingArr = [...curr];
          const workingArrUnsorted = [
            ...workingArr.filter((o) => o.id !== optionToRemove.id),
          ];
          return sortOptions(workingArrUnsorted);
        });
      },
      [setOptions, sortOptions, post.postUuid]
    );

    const fetchPostLatestData = useCallback(async () => {
      try {
        const fetchPostPayload = new newnewapi.GetPostRequest({
          postUuid: post.postUuid,
        });

        const res = await fetchPostByUUID(fetchPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data.multipleChoice) {
          setTotalVotes(res.data.multipleChoice.totalVotes as number);
          setNumberOfOptions(res.data.multipleChoice.optionCount as number);
          if (res.data.multipleChoice.status)
            handleUpdatePostStatus(res.data.multipleChoice.status);

          if (res.data.multipleChoice.additionalResponses) {
            setAdditionalResponsesFreshlyLoaded(
              res.data.multipleChoice.additionalResponses
            );
          }

          setAnnouncement(res.data.multipleChoice?.announcement);
          if (res.data.multipleChoice?.winningOptionId && !winningOption) {
            const winner = options.find(
              (o) => o.id === res!!.data!!.multipleChoice!!.winningOptionId
            );
            if (winner) {
              setWinningOption(winner);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOnResponseTimeExpired = () => {
      handleUpdatePostStatus('FAILED');
    };

    const handleOnVotingTimeExpired = async () => {
      if (options.some((o) => o.supporterCount > 0)) {
        handleUpdatePostStatus('WAITING_FOR_RESPONSE');
        await fetchPostLatestData();
      } else {
        handleUpdatePostStatus('FAILED');
      }
    };

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
            setWinningOption(
              res.data.option as newnewapi.MultipleChoice.Option
            );
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
              workingArr[idx].supporterCount = decoded.option
                ?.supporterCount as number;
              workingArr[idx].firstVoter = decoded.option?.firstVoter;
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
          if (decoded.post?.multipleChoice?.totalVotes)
            setTotalVotes(decoded.post?.multipleChoice?.totalVotes);
          if (decoded.post?.multipleChoice?.optionCount)
            setNumberOfOptions(decoded.post?.multipleChoice?.optionCount);

          // if (
          //   !responseFreshlyUploaded &&
          //   decoded.post?.multipleChoice?.response
          // ) {
          //   setResponseFreshlyUploaded(decoded.post.multipleChoice.response);
          // }
        }
      };

      const socketHandlerPostStatus = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostStatusUpdated.decode(arr);

        if (!decoded) return;
        if (decoded.postUuid === post.postUuid && decoded.multipleChoice) {
          handleUpdatePostStatus(decoded.multipleChoice);
        }
      };

      if (socketConnection) {
        socketConnection?.on(
          'McOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection?.on('McOptionDeleted', socketHandlerOptionDeleted);
        socketConnection?.on('PostUpdated', socketHandlerPostData);
        socketConnection?.on('PostStatusUpdated', socketHandlerPostStatus);
      }

      return () => {
        if (socketConnection && socketConnection?.connected) {
          socketConnection?.off(
            'McOptionCreatedOrUpdated',
            socketHandlerOptionCreatedOrUpdated
          );
          socketConnection?.off('McOptionDeleted', socketHandlerOptionDeleted);
          socketConnection?.off('PostUpdated', socketHandlerPostData);
          socketConnection?.off('PostStatusUpdated', socketHandlerPostStatus);
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
          document.getElementById('comments')?.scrollIntoView();
        }
      };

      handleCommentsInitialHash();
    }, []);

    // Replace hash once scrolled to comments
    useEffect(() => {
      if (inView) {
        syncedHistoryReplaceState(
          {},
          `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/post/${
            post.postUuid
          }#comments`
        );
      } else {
        syncedHistoryReplaceState(
          {},
          `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/post/${
            post.postUuid
          }`
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, post.postUuid, router.locale]);

    return (
      <>
        <SWrapper>
          <PostModerationResponsesContextProvider
            openedTab={openedTab}
            handleChangeTab={handleChangeTab}
            coreResponseInitial={post.response ?? undefined}
            additionalResponsesInitial={additionalResponsesFreshlyLoaded}
          >
            <SExpiresSection>
              {isMobile && (
                <SGoBackButton
                  style={{
                    gridArea: 'closeBtnMobile',
                  }}
                  onClick={handleGoBackInsidePost}
                />
              )}
              {postStatus === 'waiting_for_response' ? (
                <ResponseTimer
                  timestampSeconds={new Date(
                    (post.responseUploadDeadline?.seconds as number) * 1000
                  ).getTime()}
                  onTimeExpired={handleOnResponseTimeExpired}
                />
              ) : Date.now() > (post.expiresAt?.seconds as number) * 1000 ? (
                <PostTimerEnded
                  timestampSeconds={new Date(
                    (post.expiresAt?.seconds as number) * 1000
                  ).getTime()}
                  postType='mc'
                />
              ) : (
                <PostTimer
                  timestampSeconds={new Date(
                    (post.expiresAt?.seconds as number) * 1000
                  ).getTime()}
                  postType='mc'
                  onTimeExpired={handleOnVotingTimeExpired}
                />
              )}
            </SExpiresSection>
            <PostVideoModeration
              key={`key_${announcement?.coverImageUrl}`}
              postId={post.postUuid}
              announcement={announcement!!}
              thumbnails={{
                startTime: 1,
                endTime: 3,
              }}
              isMuted={mutedMode}
              handleToggleMuted={() => handleToggleMutedMode()}
            />
            <PostTopInfoModeration
              totalVotes={totalVotes}
              hasWinner={false}
              hidden={openedTab === 'response'}
            />
            <SActivitesContainer decisionFailed={postStatus === 'failed'}>
              {openedTab === 'announcement' ? (
                <>
                  <PostVotingTab>
                    {`${t('tabs.options')} ${
                      !!numberOfOptions && numberOfOptions > 0
                        ? numberOfOptions
                        : ''
                    }`}
                  </PostVotingTab>
                  <McOptionsTabModeration
                    post={post}
                    options={options}
                    optionsLoading={optionsLoading}
                    pagingToken={optionsNextPageToken}
                    winningOptionId={(winningOption?.id as number) ?? undefined}
                    handleLoadOptions={fetchOptions}
                    handleRemoveOption={handleRemoveOption}
                  />
                </>
              ) : (
                <PostResponseTabModeration
                  postId={post.postUuid}
                  postType='mc'
                  postStatus={postStatus}
                  postTitle={post.title}
                  winningOptionMc={winningOption}
                />
              )}
            </SActivitesContainer>
            {isPopupVisible && (
              <HeroPopup
                isPopupVisible={isPopupVisible}
                postType='MC'
                closeModal={goToNextStep}
              />
            )}
          </PostModerationResponsesContextProvider>
        </SWrapper>
        {post.isCommentsAllowed && (
          <SCommentsSection id='comments' ref={commentsSectionRef}>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              commentsRoomId={post.commentsRoomId as number}
              onFormBlur={handleCommentBlur}
              onFormFocus={handleCommentFocus}
            />
          </SCommentsSection>
        )}
      </>
    );
  }
);

PostModerationMC.defaultProps = {};

export default PostModerationMC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
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
    grid-column-gap: 32px;
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
    ${({ decisionFailed }) =>
      !decisionFailed
        ? css`
            max-height: 500px;
          `
        : css`
            max-height: 500px;
          `}
  }

  ${({ theme }) => theme.media.laptop} {
    ${({ decisionFailed }) =>
      !decisionFailed
        ? css`
            max-height: unset;
          `
        : css`
            max-height: calc(580px - 120px);
          `}
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
