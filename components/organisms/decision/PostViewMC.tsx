/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/router';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import {
  fetchCurrentOptionsForMCPost,
  voteOnPost,
} from '../../../api/endpoints/multiple_choice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import Headline from '../../atoms/Headline';
import CommentsBottomSection from '../../molecules/decision/success/CommentsBottomSection';
import PostVotingTab from '../../molecules/decision/PostVotingTab';

// Utils
import switchPostType from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../api/endpoints/user';
import { getSubscriptionStatus } from '../../../api/endpoints/subscription';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import { Mixpanel } from '../../../utils/mixpanel';

const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const LoadingModal = dynamic(() => import('../../molecules/LoadingModal'));
const McOptionsTab = dynamic(
  () => import('../../molecules/decision/multiple_choice/McOptionsTab')
);
const HeroPopup = dynamic(() => import('../../molecules/decision/HeroPopup'));
const PaymentSuccessModal = dynamic(
  () => import('../../molecules/decision/PaymentSuccessModal')
);

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostViewMC {
  post: newnewapi.MultipleChoice;
  sessionId?: string;
  resetSessionId: () => void;
  postStatus: TPostStatusStringified;
  isFollowingDecision: boolean;
  hasRecommendations: boolean;
  handleSetIsFollowingDecision: (newValue: boolean) => void;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleReportOpen: () => void;
  handleRemovePostFromState: () => void;
  handleAddPostToState: () => void;
}

const PostViewMC: React.FunctionComponent<IPostViewMC> = React.memo(
  ({
    post,
    postStatus,
    sessionId,
    isFollowingDecision,
    hasRecommendations,
    handleSetIsFollowingDecision,
    resetSessionId,
    handleGoBack,
    handleUpdatePostStatus,
    handleReportOpen,
    handleRemovePostFromState,
    handleAddPostToState,
  }) => {
    const { t } = useTranslation('modal-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const router = useRouter();

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    const { appConstants } = useGetAppConstants();
    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    // Response viewed
    const [responseViewed, setResponseViewed] = useState(
      post.isResponseViewedByMe ?? false
    );

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

    // Post loading state
    const [postLoading, setPostLoading] = useState(false);

    // Vote from sessionId
    const [loadingModalOpen, setLoadingModalOpen] = useState(false);
    const [paymentSuccesModalOpen, setPaymentSuccesModalOpen] = useState(false);

    // Total votes
    const [totalVotes, setTotalVotes] = useState(post.totalVotes ?? 0);

    // Free votes
    const [hasFreeVote, setHasFreeVote] = useState(
      post.canVoteForFree ?? false
    );
    const handleResetFreeVote = () => setHasFreeVote(false);

    const [canSubscribe, setCanSubscribe] = useState(
      post.creator?.options?.isOfferingSubscription
    );

    // Options
    const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
    const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(
      post.optionCount ?? ''
    );
    const [optionsNextPageToken, setOptionsNextPageToken] =
      useState<string | undefined | null>('');
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

        setHasFreeVote(res.data.multipleChoice?.canVoteForFree ?? false);
        setTotalVotes(res.data.multipleChoice?.totalVotes as number);
        setNumberOfOptions(res.data.multipleChoice?.optionCount as number);
        if (res.data.multipleChoice?.status)
          handleUpdatePostStatus(res.data.multipleChoice?.status);

        if (user.loggedIn && post.creator?.options?.isOfferingSubscription) {
          const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
            creatorUuid: post.creator?.uuid,
          });

          const responseSubStatus = await getSubscriptionStatus(
            getStatusPayload
          );

          if (
            responseSubStatus.data?.status?.activeRenewsAt ||
            responseSubStatus.data?.status?.activeCancelsAt
          ) {
            setCanSubscribe(false);
          }
        }

        setPostLoading(false);
      } catch (err) {
        console.error(err);
        setPostLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Increment channel subs after mounting
    // Decrement when unmounting
    useEffect(() => {
      if (socketConnection?.connected) {
        addChannel(post.postUuid, {
          postUpdates: {
            postUuid: post.postUuid,
          },
        });
      }

      return () => {
        removeChannel(post.postUuid);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection?.connected]);

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
        }
      };

      const socketHandlerPostStatus = (data: any) => {
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
      user.userData?.userUuid,
      setOptions,
      sortOptions,
    ]);

    useEffect(() => {
      const makeVoteFromSessionId = async () => {
        if (!sessionId) return;
        try {
          setLoadingModalOpen(true);
          const payload = new newnewapi.FulfillPaymentPurposeRequest({
            paymentSuccessUrl: `session_id=${sessionId}`,
          });

          const res = await voteOnPost(payload);

          if (
            !res.data ||
            res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
            res.error
          )
            throw new Error(res.error?.message ?? 'Request failed');

          const optionFromResponse = res.data
            .option as newnewapi.MultipleChoice.Option;
          optionFromResponse.isSupportedByMe = true;
          handleAddOrUpdateOptionFromResponse(optionFromResponse);

          await fetchPostLatestData();

          setLoadingModalOpen(false);
          handleResetFreeVote();
          setPaymentSuccesModalOpen(true);
        } catch (err) {
          console.error(err);
          setLoadingModalOpen(false);
        }
        resetSessionId();
      };

      if (socketConnection?.connected && !loadingModalOpen) {
        makeVoteFromSessionId();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection?.connected, sessionId, loadingModalOpen]);

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
        toast.error(loadingOptionsError);
      }
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
              postType='mc'
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
            postType='mc'
            postId={post.postUuid}
            postStatus={postStatus}
            title={post.title}
            totalVotes={totalVotes}
            hasWinner={false}
            creator={post.creator!!}
            isFollowingDecision={isFollowingDecision}
            hasRecommendations={hasRecommendations}
            handleSetIsFollowingDecision={handleSetIsFollowingDecision}
            handleReportOpen={handleReportOpen}
            handleRemovePostFromState={handleRemovePostFromState}
            handleAddPostToState={handleAddPostToState}
          />
          <SActivitesContainer decisionFailed={postStatus === 'failed'}>
            <PostVotingTab>
              {`${t('tabs.options')} ${
                !!numberOfOptions && numberOfOptions > 0 ? numberOfOptions : ''
              }`}
            </PostVotingTab>
            <McOptionsTab
              post={post}
              postLoading={postLoading}
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
              optionsLoading={optionsLoading}
              pagingToken={optionsNextPageToken}
              minAmount={appConstants?.minMcVotes ?? 2}
              votePrice={
                appConstants?.mcVotePrice
                  ? Math.floor(appConstants?.mcVotePrice / 100)
                  : 1
              }
              canSubscribe={!!canSubscribe}
              canVoteForFree={hasFreeVote}
              handleLoadOptions={fetchOptions}
              handleResetFreeVote={handleResetFreeVote}
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
              handleRemoveOption={handleRemoveOption}
            />
          </SActivitesContainer>
          {/* Loading Modal */}
          {loadingModalOpen && (
            <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
          )}
          {/* Payment success Modal */}
          {paymentSuccesModalOpen && (
            <PaymentSuccessModal
              postType='mc'
              isVisible={paymentSuccesModalOpen}
              closeModal={() => {
                Mixpanel.track('Close Payment Success Modal', {
                  _stage: 'Post',
                  _post: post.postUuid,
                });
                setPaymentSuccesModalOpen(false);
              }}
            >
              {t('paymentSuccessModal.mc', {
                postCreator:
                  (post.creator?.nickname as string) ?? post.creator?.username,
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

PostViewMC.defaultProps = {
  sessionId: undefined,
};

export default PostViewMC;

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

// Comments
const SCommentsHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SCommentsSection = styled.div``;
