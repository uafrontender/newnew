/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import moment from 'moment';
import { useRouter } from 'next/dist/client/router';

import { getMcOption } from '../../../../api/endpoints/multiple_choice';
import switchPostType from '../../../../utils/switchPostType';
import { SocketContext } from '../../../../contexts/socketContext';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';

import PostVideoModeration from '../../../molecules/decision/moderation/PostVideoModeration';
import PostTopInfoModeration from '../../../molecules/decision/moderation/PostTopInfoModeration';
import Headline from '../../../atoms/Headline';
import CommentsBottomSection from '../../../molecules/decision/common/CommentsBottomSection';
import PostVotingTab from '../../../molecules/decision/common/PostVotingTab';
import PostTimerEnded from '../../../molecules/decision/common/PostTimerEnded';
import PostResponseTabModeration from '../../../molecules/decision/moderation/PostResponseTabModeration';

import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import PostModerationResponsesContextProvider from '../../../../contexts/postModerationResponsesContext';
import useMcOptions from '../../../../utils/hooks/useMcOptions';
import { useAppState } from '../../../../contexts/appStateContext';
import { useTutorialProgress } from '../../../../contexts/tutorialProgressContext';
import { useUiState } from '../../../../contexts/uiStateContext';

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
    const { t } = useTranslation('page-Post');
    const { locale } = useRouter();
    const { mutedMode, toggleMutedMode } = useUiState();
    const { resizeMode, userUuid, userLoggedIn } = useAppState();
    const {
      userTutorialsProgress,
      userTutorialsProgressSynced,
      setUserTutorialsProgress,
    } = useTutorialProgress();
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

    const {
      postParsed,
      postStatus,
      handleGoBackInsidePost,
      refetchPost,
      handleUpdatePostData,
    } = usePostInnerState();
    const post = useMemo(
      () => postParsed as newnewapi.MultipleChoice,
      [postParsed]
    );

    // Additional responses
    const additionalResponsesFreshlyLoaded = useMemo(
      () => post.additionalResponses,
      [post.additionalResponses]
    );

    // Socket
    const { socketConnection } = useContext(SocketContext);

    // Announcement
    const announcement = useMemo(() => post.announcement, [post.announcement]);

    const handleCommentFocus = useCallback(() => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display =
          'none';
      }
    }, [isMobile]);

    const handleCommentBlur = useCallback(() => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display = '';
      }
    }, [isMobile]);

    // Tabs
    const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
      post.response ||
        postStatus === 'waiting_for_response' ||
        postStatus === 'processing_response'
        ? 'response'
        : 'announcement'
    );

    useEffect(() => {
      if (
        postStatus === 'waiting_for_response' ||
        postStatus === 'processing_response'
      ) {
        setOpenedTab('response');
      }
    }, [postStatus]);

    const handleChangeTab = useCallback(
      (newValue: 'announcement' | 'response') => setOpenedTab(newValue),
      []
    );

    // Total votes
    const totalVotes = useMemo(() => post.totalVotes ?? 0, [post.totalVotes]);

    // Winning option
    const [winningOption, setWinningOption] = useState<
      newnewapi.MultipleChoice.Option | undefined
    >();

    const handleToggleMutedMode = useCallback(() => {
      toggleMutedMode();
    }, [toggleMutedMode]);

    const {
      processedOptions: options,
      hasNextPage: hasNextOptionsPage,
      fetchNextPage: fetchNextOptionsPage,
      addOrUpdateMcOptionMutation,
      removeMcOptionMutation,
    } = useMcOptions({
      postUuid: post.postUuid,
      userUuid,
      loggedInUser: userLoggedIn,
    });

    const handleRemoveOption = useCallback(
      (optionToRemove: newnewapi.MultipleChoice.Option) => {
        Mixpanel.track('Removed Option', {
          _stage: 'Post',
          _postUuid: post.postUuid,
          _component: 'PostModerationMC',
        });
        removeMcOptionMutation?.mutate(optionToRemove);
      },
      [post.postUuid, removeMcOptionMutation]
    );

    const fetchPostLatestData = useCallback(
      async () => {
        try {
          const res = await refetchPost();

          if (!res?.data || res.error) {
            throw new Error(res?.error?.message ?? 'Request failed');
          }

          if (res.data.multipleChoice) {
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
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        options,
        winningOption,
        post.postUuid, // - added to depend on postId
        // refetchPost, - disabled to not to depend on refetch from react query
      ]
    );

    useEffect(() => {
      if (postStatus === 'waiting_for_response') {
        fetchPostLatestData();
      }
    }, [postStatus, fetchPostLatestData]);

    const handleOnResponseTimeExpired = async () => {
      await refetchPost();
    };

    const handleOnVotingTimeExpired = async () => {
      await refetchPost();
    };

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

    useEffect(
      () => {
        const socketHandlerOptionCreatedOrUpdated = async (data: any) => {
          const arr = new Uint8Array(data);
          const decoded = newnewapi.McOptionCreatedOrUpdated.decode(arr);
          if (decoded.option && decoded.postUuid === post.postUuid) {
            addOrUpdateMcOptionMutation?.mutate(decoded.option);
          }
        };

        const socketHandlerOptionDeleted = async (data: any) => {
          const arr = new Uint8Array(data);
          const decoded = newnewapi.McOptionDeleted.decode(arr);

          if (decoded.optionId) {
            removeMcOptionMutation?.mutate({
              id: decoded.optionId,
            });
            await fetchPostLatestData();
          }
        };

        const socketHandlerPostData = async (data: any) => {
          const arr = new Uint8Array(data);
          const decoded = newnewapi.PostUpdated.decode(arr);

          if (!decoded) {
            return;
          }
          const [decodedParsed] = switchPostType(
            decoded.post as newnewapi.IPost
          );
          if (decoded.post && decodedParsed.postUuid === post.postUuid) {
            handleUpdatePostData(decoded.post);
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
            socketConnection?.off(
              'McOptionDeleted',
              socketHandlerOptionDeleted
            );
            socketConnection?.off('PostUpdated', socketHandlerPostData);
          }
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        socketConnection,
        post,
        userUuid,
        // addOrUpdateMcOptionMutation, - reason unknown
        // fetchPostLatestData, - reason unknown
        // handleUpdatePostData, - reason unknown
        // removeMcOptionMutation, - reason unknown
      ]
    );

    const goToNextStep = () => {
      if (
        userTutorialsProgress?.remainingMcSteps &&
        userTutorialsProgress.remainingMcSteps[0]
      ) {
        if (userLoggedIn) {
          const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            mcCurrentStep: userTutorialsProgress.remainingMcSteps[0],
          });
          markTutorialStepAsCompleted(payload);
        }
        setUserTutorialsProgress({
          remainingMcSteps: [...userTutorialsProgress.remainingMcSteps].slice(
            1
          ),
        });
      }
    };

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    useEffect(() => {
      if (
        userTutorialsProgressSynced &&
        userTutorialsProgress?.remainingMcSteps &&
        userTutorialsProgress.remainingMcSteps[0] ===
          newnewapi.McTutorialStep.MC_HERO
      ) {
        setIsPopupVisible(true);
      } else {
        setIsPopupVisible(false);
      }
    }, [userTutorialsProgressSynced, userTutorialsProgress?.remainingMcSteps]);

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
                  postType='mc'
                />
              ) : (
                <>
                  <PostTimer
                    timestampSeconds={new Date(
                      (post.expiresAt?.seconds as number) * 1000
                    ).getTime()}
                    postType='mc'
                    isTutorialVisible={options.length > 0}
                    onTimeExpired={handleOnVotingTimeExpired}
                  />
                  <SEndDate>
                    {t('expires.end_date')}{' '}
                    {moment((post.expiresAt?.seconds as number) * 1000)
                      .locale(locale || 'en-US')
                      .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
                  </SEndDate>
                </>
              )}
            </SExpiresSection>
            <PostTopInfoModeration
              totalVotes={totalVotes}
              hasWinner={false}
              hidden={openedTab === 'response'}
            />
          </>
        )}
        <SWrapper>
          <PostModerationResponsesContextProvider
            openedTab={openedTab}
            handleChangeTab={handleChangeTab}
            coreResponseInitial={post.response ?? undefined}
            additionalResponsesInitial={additionalResponsesFreshlyLoaded}
          >
            {isMobile && (
              <SExpiresSection>
                <SGoBackButton onClick={handleGoBackInsidePost} />
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
                    postType='mc'
                  />
                ) : (
                  <>
                    <PostTimer
                      timestampSeconds={new Date(
                        (post.expiresAt?.seconds as number) * 1000
                      ).getTime()}
                      postType='mc'
                      isTutorialVisible={options.length > 0}
                      onTimeExpired={handleOnVotingTimeExpired}
                    />
                    <SEndDate>
                      {t('expires.end_date')}{' '}
                      {moment((post.expiresAt?.seconds as number) * 1000)
                        .locale(locale || 'en-US')
                        .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
                    </SEndDate>
                  </>
                )}
              </SExpiresSection>
            )}
            <PostVideoModeration
              key={`key_${announcement?.coverImageUrl}`}
              postUuid={post.postUuid}
              announcement={announcement!!}
              thumbnails={{
                startTime: 1,
                endTime: 3,
              }}
              isMuted={mutedMode}
              handleToggleMuted={() => handleToggleMutedMode()}
            />
            {isMobile && (
              <PostTopInfoModeration
                totalVotes={totalVotes}
                hasWinner={false}
                hidden={openedTab === 'response'}
              />
            )}
            <SActivitiesContainer>
              {openedTab === 'announcement' ? (
                <>
                  <div
                    style={{
                      flex: '0 0 auto',
                      width: '100%',
                    }}
                  >
                    {!isMobileOrTablet && (
                      <>
                        <SExpiresSection>
                          {postStatus === 'waiting_for_response' ||
                          postStatus === 'waiting_for_decision' ? (
                            <ResponseTimer
                              timestampSeconds={new Date(
                                (post.responseUploadDeadline
                                  ?.seconds as number) * 1000
                              ).getTime()}
                              onTimeExpired={handleOnResponseTimeExpired}
                            />
                          ) : Date.now() >
                            (post.expiresAt?.seconds as number) * 1000 ? (
                            <PostTimerEnded
                              timestampSeconds={new Date(
                                (post.expiresAt?.seconds as number) * 1000
                              ).getTime()}
                              postType='mc'
                            />
                          ) : (
                            <>
                              <PostTimer
                                timestampSeconds={new Date(
                                  (post.expiresAt?.seconds as number) * 1000
                                ).getTime()}
                                postType='mc'
                                isTutorialVisible={options.length > 0}
                                onTimeExpired={handleOnVotingTimeExpired}
                              />
                              <SEndDate>
                                {t('expires.end_date')}{' '}
                                {moment(
                                  (post.expiresAt?.seconds as number) * 1000
                                )
                                  .locale(locale || 'en-US')
                                  .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
                              </SEndDate>
                            </>
                          )}
                        </SExpiresSection>
                        <PostTopInfoModeration
                          totalVotes={totalVotes}
                          hasWinner={false}
                        />
                      </>
                    )}
                    <PostVotingTab>{`${t('tabs.options')}`}</PostVotingTab>
                  </div>
                  <McOptionsTabModeration
                    post={post}
                    options={options}
                    hasNextPage={!!hasNextOptionsPage}
                    fetchNextPage={fetchNextOptionsPage}
                    winningOptionId={(winningOption?.id as number) ?? undefined}
                    handleRemoveOption={handleRemoveOption}
                  />
                </>
              ) : (
                <>
                  {!isMobileOrTablet && (
                    <PostTopInfoModeration
                      totalVotes={totalVotes}
                      hasWinner={false}
                      hidden={openedTab === 'response'}
                    />
                  )}
                  <PostResponseTabModeration
                    postUuid={post.postUuid}
                    postShortId={post.postShortId}
                    postType='mc'
                    postStatus={postStatus}
                    postTitle={post.title}
                    winningOptionMc={winningOption}
                    options={options}
                  />
                </>
              )}
            </SActivitiesContainer>
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
          <SCommentsSection id='comments'>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              postShortId={post.postShortId ?? ''}
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

    position: relative;
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
