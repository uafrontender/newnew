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
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import moment from 'moment';
import { useRouter } from 'next/dist/client/router';

import { SocketContext } from '../../../../contexts/socketContext';
import { fetchAcOptionById } from '../../../../api/endpoints/auction';
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
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import PostModerationResponsesContextProvider from '../../../../contexts/postModerationResponsesContext';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import useAcOptions from '../../../../utils/hooks/useAcOptions';
import { useAppState } from '../../../../contexts/appStateContext';

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

interface IPostModerationAC {}

const PostModerationAC: React.FunctionComponent<IPostModerationAC> = React.memo(
  () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation('page-Post');
    const { locale } = useRouter();
    const { showErrorToastCustom } = useErrorToasts();
    const { user } = useAppSelector((state) => state);
    const { mutedMode } = useAppSelector((state) => state.ui);
    const { resizeMode } = useAppState();
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
    const post = useMemo(() => postParsed as newnewapi.Auction, [postParsed]);

    // Additional responses
    const additionalResponsesFreshlyLoaded = useMemo(
      () => post.additionalResponses,
      [post.additionalResponses]
    );

    // Socket
    const { socketConnection } = useContext(SocketContext);

    const winningOptionId = useMemo(
      () => post.winningOptionId ?? undefined,
      [post.winningOptionId]
    );

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

    const handleChangeTab = useCallback(
      (newValue: 'announcement' | 'response') => setOpenedTab(newValue),
      []
    );

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

    // Winning option
    const [winningOption, setWinningOption] = useState<
      newnewapi.Auction.Option | undefined
    >();

    const handleUpdateWinningOption = async (
      selectedOption: newnewapi.Auction.Option
    ) => {
      await refetchPost();
      setWinningOption(selectedOption);
    };

    const handleToggleMutedMode = useCallback(() => {
      dispatch(toggleMutedMode(''));
    }, [dispatch]);

    const {
      processedOptions: options,
      hasNextPage: hasNextOptionsPage,
      fetchNextPage: fetchNextOptionsPage,
      isLoading: isOptionsLoading,
      addOrUpdateAcOptionMutation,
      removeAcOptionMutation,
    } = useAcOptions(
      {
        postUuid: post.postUuid,
        userUuid: user.userData?.userUuid,
        loggedInUser: user.loggedIn,
      },
      {
        onError: (err) => {
          showErrorToastCustom((err as Error).message);
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fetchPostLatestData = useCallback(async () => {
      try {
        const res = await refetchPost();

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }
      } catch (err) {
        console.error(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveOption = useCallback(
      async (optionToRemove: newnewapi.Auction.Option) => {
        Mixpanel.track('Removed Option', {
          _stage: 'Post',
          _postUuid: post.postUuid,
          _component: 'PostModerationAC',
        });
        removeAcOptionMutation?.mutate(optionToRemove);
      },
      [post.postUuid, removeAcOptionMutation]
    );

    const handleOnResponseTimeExpired = async () => {
      await refetchPost();
    };

    const handleOnVotingTimeExpired = async () => {
      await refetchPost();
    };

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
      const socketHandlerOptionCreatedOrUpdated = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.AcOptionCreatedOrUpdated.decode(arr);
        if (decoded.option && decoded.postUuid === post.postUuid) {
          addOrUpdateAcOptionMutation?.mutate(decoded.option);
        }
      };

      const socketHandlerOptionDeleted = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.AcOptionDeleted.decode(arr);

        if (decoded.optionId) {
          removeAcOptionMutation?.mutate({
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
        const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
        if (decoded.post && decodedParsed.postUuid === post.postUuid) {
          handleUpdatePostData(decoded.post);
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
    }, [socketConnection, post, postStatus, user.userData?.userUuid]);

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
                  postType='ac'
                />
              ) : (
                <>
                  <PostTimer
                    timestampSeconds={new Date(
                      (post.expiresAt?.seconds as number) * 1000
                    ).getTime()}
                    postType='ac'
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
              amountInBids={totalAmount}
              hasWinner={!!winningOptionId}
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
                    postType='ac'
                  />
                ) : (
                  <>
                    <PostTimer
                      timestampSeconds={new Date(
                        (post.expiresAt?.seconds as number) * 1000
                      ).getTime()}
                      postType='ac'
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
                amountInBids={totalAmount}
                hasWinner={!!winningOptionId}
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
                              postType='ac'
                            />
                          ) : (
                            <>
                              <PostTimer
                                timestampSeconds={new Date(
                                  (post.expiresAt?.seconds as number) * 1000
                                ).getTime()}
                                postType='ac'
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
                          amountInBids={totalAmount}
                          hasWinner={!!winningOptionId}
                        />
                      </>
                    )}
                    <PostVotingTab>
                      {`${
                        !!numberOfOptions && numberOfOptions > 0
                          ? numberOfOptions
                          : ''
                      } ${
                        numberOfOptions === 1
                          ? t('tabs.bids_singular')
                          : t('tabs.bids')
                      }`}
                    </PostVotingTab>
                  </div>
                  <AcOptionsTabModeration
                    postUuid={post.postUuid}
                    options={options}
                    winningOptionId={(winningOption?.id as number) ?? undefined}
                    optionsLoading={isOptionsLoading}
                    hasNextPage={!!hasNextOptionsPage}
                    fetchNextPage={fetchNextOptionsPage}
                    handleRemoveOption={handleRemoveOption}
                    handleUpdateWinningOption={handleUpdateWinningOption}
                  />
                </>
              ) : (
                <>
                  {!isMobileOrTablet && (
                    <PostTopInfoModeration
                      amountInBids={totalAmount}
                      hasWinner={!!winningOptionId}
                      hidden={openedTab === 'response'}
                    />
                  )}
                  <PostResponseTabModeration
                    postUuid={post.postUuid}
                    postShortId={post.postShortId}
                    postType='ac'
                    postStatus={postStatus}
                    postTitle={post.title}
                    winningOptionAc={winningOption}
                  />
                </>
              )}
            </SActivitiesContainer>
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
          <SCommentsSection id='comments'>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              postShortId={post.postShortId ?? ''}
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
