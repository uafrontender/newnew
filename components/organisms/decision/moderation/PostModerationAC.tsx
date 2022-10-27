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
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';

import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import {
  fetchAcOptionById,
  fetchCurrentBidsForPost,
} from '../../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';

import Headline from '../../../atoms/Headline';
import PostVotingTab from '../../../molecules/decision/common/PostVotingTab';
import PostTopInfoModeration from '../../../molecules/decision/moderation/PostTopInfoModeration';
import PostVideoModeration from '../../../molecules/decision/moderation/PostVideoModeration';
import CommentsBottomSection from '../../../molecules/decision/common/CommentsBottomSection';
import PostTimerEnded from '../../../molecules/decision/common/PostTimerEnded';
import PostResponseTabModeration from '../../../molecules/decision/moderation/PostResponseTabModeration';

import switchPostType from '../../../../utils/switchPostType';
import { fetchPostByUUID } from '../../../../api/endpoints/post';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import useSynchronizedHistory from '../../../../utils/hooks/useSynchronizedHistory';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';
import PostModerationResponsesContextProvider from '../../../../contexts/postModerationResponsesContext';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));
const ResponseTimer = dynamic(
  () => import('../../../molecules/decision/common/ResponseTimer')
);
const PostTimer = dynamic(
  () => import('../../../molecules/decision/common/PostTimer')
);
const AcOptionsTabModeration = dynamic(
  () =>
    import(
      '../../../molecules/decision/moderation/auction/AcOptionsTabModeration'
    )
);
const HeroPopup = dynamic(
  () => import('../../../molecules/decision/common/HeroPopup')
);

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostModerationAC {}

const PostModerationAC: React.FunctionComponent<IPostModerationAC> = React.memo(
  () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation('modal-Post');
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
    const post = useMemo(() => postParsed as newnewapi.Auction, [postParsed]);

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    const showSelectWinnerOption = useMemo(
      () => postStatus === 'waiting_for_decision',
      [postStatus]
    );

    // Additional responses
    const [
      additionalResponsesFreshlyLoaded,
      setAdditionalResponsesFreshlyLoaded,
    ] = useState(post.additionalResponses);

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    const [winningOptionId, setWinningOptionId] = useState(
      post.winningOptionId ?? undefined
    );

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

    // Total amount
    const [totalAmount, setTotalAmount] = useState(
      post.totalAmount?.usdCents ?? 0
    );

    // Options
    const [options, setOptions] = useState<TAcOptionWithHighestField[]>([]);
    const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(
      post.optionCount ?? ''
    );
    const [optionsNextPageToken, setOptionsNextPageToken] = useState<
      string | undefined | null
    >('');
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [loadingOptionsError, setLoadingOptionsError] = useState('');

    // Winning option
    const [winningOption, setWinningOption] = useState<
      newnewapi.Auction.Option | undefined
    >();

    const handleUpdateWinningOption = (
      selectedOption: newnewapi.Auction.Option
    ) => {
      setWinningOption(selectedOption);
      setWinningOptionId(selectedOption.id);
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
        }
        if (res.data.auction) {
          setTotalAmount(res.data.auction.totalAmount?.usdCents as number);
          setNumberOfOptions(res.data.auction.optionCount as number);
          if (res.data.auction.status)
            handleUpdatePostStatus(res.data.auction.status);
          setAnnouncement(res.data.auction?.announcement);

          if (res.data.auction.additionalResponses) {
            setAdditionalResponsesFreshlyLoaded(
              res.data.auction.additionalResponses
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveOption = useCallback(
      (optionToRemove: newnewapi.Auction.Option) => {
        Mixpanel.track('Removed Option', {
          _stage: 'Post',
          _postUuid: post.postUuid,
          _component: 'PostModerationAC',
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

    const handleOnResponseTimeExpired = () => {
      handleUpdatePostStatus('FAILED');
    };

    const handleOnVotingTimeExpired = () => {
      if (options && options.some((o) => o.supporterCount > 0)) {
        handleUpdatePostStatus('WAITING_FOR_DECISION');
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
          setTotalAmount(decoded.post?.auction?.totalAmount?.usdCents ?? 0);
          setNumberOfOptions(decoded.post?.auction?.optionCount ?? 0);
        }
      };

      const socketHandlerPostStatus = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostStatusUpdated.decode(arr);

        if (!decoded) return;
        if (decoded.postUuid === post.postUuid && decoded.auction) {
          handleUpdatePostStatus(decoded.auction);
        }
      };

      if (socketConnection) {
        socketConnection?.on(
          'AcOptionCreatedOrUpdated',
          socketHandlerOptionCreatedOrUpdated
        );
        socketConnection?.on('AcOptionDeleted', socketHandlerOptionDeleted);
        socketConnection?.on('PostUpdated', socketHandlerPostData);
        socketConnection?.on('PostStatusUpdated', socketHandlerPostStatus);
      }

      return () => {
        if (socketConnection && socketConnection?.connected) {
          socketConnection?.off(
            'AcOptionCreatedOrUpdated',
            socketHandlerOptionCreatedOrUpdated
          );
          socketConnection?.off('AcOptionDeleted', socketHandlerOptionDeleted);
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

    useEffect(() => {
      if (loadingOptionsError) {
        toast.error(loadingOptionsError);
      }
    }, [loadingOptionsError]);

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

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    useEffect(() => {
      if (
        options.length > 0 &&
        user.userTutorialsProgressSynced &&
        user.userTutorialsProgress.remainingAcSteps &&
        user.userTutorialsProgress.remainingAcSteps[0] ===
          newnewapi.AcTutorialStep.AC_HERO
      ) {
        setIsPopupVisible(true);
      } else {
        setIsPopupVisible(false);
      }
    }, [options, user]);

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
              {postStatus === 'waiting_for_response' ||
              postStatus === 'waiting_for_decision' ? (
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
                  postType='ac'
                />
              ) : (
                <PostTimer
                  timestampSeconds={new Date(
                    (post.expiresAt?.seconds as number) * 1000
                  ).getTime()}
                  postType='ac'
                  isTutorialVisible={options.length > 0}
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
              amountInBids={totalAmount}
              hasWinner={!!winningOptionId}
              hidden={openedTab === 'response'}
            />
            <SActivitesContainer
              decisionFailed={postStatus === 'failed'}
              showSelectWinnerOption={showSelectWinnerOption}
            >
              {openedTab === 'announcement' ? (
                <>
                  <PostVotingTab>
                    {`${
                      !!numberOfOptions && numberOfOptions > 0
                        ? numberOfOptions
                        : ''
                    } ${t('tabs.bids')}`}
                  </PostVotingTab>
                  <AcOptionsTabModeration
                    postId={post.postUuid}
                    postStatus={postStatus}
                    options={options}
                    optionsLoading={optionsLoading}
                    pagingToken={optionsNextPageToken}
                    winningOptionId={(winningOption?.id as number) ?? undefined}
                    handleLoadBids={fetchBids}
                    handleRemoveOption={handleRemoveOption}
                    handleUpdatePostStatus={handleUpdatePostStatus}
                    handleUpdateWinningOption={handleUpdateWinningOption}
                  />
                </>
              ) : (
                <PostResponseTabModeration
                  postId={post.postUuid}
                  postType='ac'
                  postStatus={postStatus}
                  postTitle={post.title}
                  winningOptionAc={winningOption}
                />
              )}
            </SActivitesContainer>
            {isPopupVisible && (
              <HeroPopup
                isPopupVisible={isPopupVisible}
                postType='AC'
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
              canDeleteComments
              onFormBlur={handleCommentBlur}
              onFormFocus={handleCommentFocus}
            />
          </SCommentsSection>
        )}
      </>
    );
  }
);

PostModerationAC.defaultProps = {};

export default PostModerationAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
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
    ${({ showSelectWinnerOption, decisionFailed }) =>
      showSelectWinnerOption
        ? css`
            max-height: 500px;
          `
        : !decisionFailed
        ? css`
            max-height: 500px;
          `
        : css`
            max-height: 500px;
          `}
  }

  ${({ theme }) => theme.media.laptop} {
    ${({ showSelectWinnerOption, decisionFailed }) =>
      showSelectWinnerOption
        ? css`
            max-height: calc(580px - 130px);
          `
        : !decisionFailed
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
