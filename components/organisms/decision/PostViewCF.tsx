/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable consistent-return */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import {
  doPledgeCrowdfunding,
  fetchPledges,
} from '../../../api/endpoints/crowdfunding';

import Button from '../../atoms/Button';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import PostTimerEnded from '../../molecules/decision/PostTimerEnded';
import Headline from '../../atoms/Headline';
import PostVotingTab from '../../molecules/decision/PostVotingTab';
import CommentsBottomSection from '../../molecules/decision/success/CommentsBottomSection';
import CfBackersStatsSectionFailed from '../../molecules/decision/crowdfunding/CfBackersStatsSectionFailed';

// Utils
import switchPostType from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { DotPositionEnum } from '../../atoms/decision/TutorialTooltip';
import { markTutorialStepAsCompleted } from '../../../api/endpoints/user';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import { Mixpanel } from '../../../utils/mixpanel';

const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const LoadingModal = dynamic(() => import('../../molecules/LoadingModal'));
const PaymentSuccessModal = dynamic(
  () => import('../../molecules/decision/PaymentSuccessModal')
);
const HeroPopup = dynamic(() => import('../../molecules/decision/HeroPopup'));
const TutorialTooltip = dynamic(
  () => import('../../atoms/decision/TutorialTooltip')
);
const PostSuccessBox = dynamic(
  () => import('../../molecules/decision/PostSuccessBox')
);
const PostWaitingForResponseBox = dynamic(
  () => import('../../molecules/decision/PostWaitingForResponseBox')
);
const CfPledgeLevelsModal = dynamic(
  () => import('../../molecules/decision/crowdfunding/CfPledgeLevelsModal')
);
const CfPledgeLevelsSection = dynamic(
  () => import('../../molecules/decision/crowdfunding/CfPledgeLevelsSection')
);
const CfBackersStatsSection = dynamic(
  () => import('../../molecules/decision/crowdfunding/CfBackersStatsSection')
);
const CfCrowdfundingSuccess = dynamic(
  () => import('../../molecules/decision/crowdfunding/CfCrowdfundingSuccess')
);

export type TCfPledgeWithHighestField = newnewapi.Crowdfunding.Pledge & {
  isHighest: boolean;
};

interface IPostViewCF {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  stripeSetupIntentClientSecret?: string;
  saveCard?: boolean;
  isFollowingDecision: boolean;
  hasRecommendations: boolean;
  handleSetIsFollowingDecision: (newValue: boolean) => void;
  resetSetupIntentClientSecret: () => void;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleReportOpen: () => void;
  handleRemoveFromStateUnfavorited: () => void;
  handleAddPostToStateFavorited: () => void;
}

const PostViewCF: React.FunctionComponent<IPostViewCF> = React.memo(
  ({
    post,
    postStatus,
    stripeSetupIntentClientSecret,
    saveCard,
    isFollowingDecision,
    hasRecommendations,
    handleSetIsFollowingDecision,
    resetSetupIntentClientSecret,
    handleGoBack,
    handleUpdatePostStatus,
    handleReportOpen,
    handleRemoveFromStateUnfavorited,
    handleAddPostToStateFavorited,
  }) => {
    const router = useRouter();
    const { t } = useTranslation('modal-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

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

    const goToNextStep = () => {
      if (
        user.userTutorialsProgress.remainingCfSteps &&
        user.userTutorialsProgress.remainingCfSteps[0]
      ) {
        if (user.loggedIn) {
          const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            cfCurrentStep: user.userTutorialsProgress.remainingCfSteps[0],
          });
          markTutorialStepAsCompleted(payload);
        }
        dispatch(
          setUserTutorialsProgress({
            remainingCfSteps: [
              ...user.userTutorialsProgress.remainingCfSteps,
            ].slice(1),
          })
        );
      }
    };

    // Do pledge after stripe redirect
    const [loadingModalOpen, setLoadingModalOpen] = useState(false);
    const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] =
      useState(false);

    // Current backers
    const [currentBackers, setCurrentBackers] = useState(
      post.currentBackerCount ?? 0
    );

    // Pledge levels
    const { standardPledgeAmounts } = useGetAppConstants().appConstants;
    const [pledgeLevels, setPledgeLevels] = useState<newnewapi.IMoneyAmount[]>(
      standardPledgeAmounts ?? []
    );

    // Pledges
    const [pledges, setPledges] = useState<TCfPledgeWithHighestField[]>([]);
    const [myPledgeAmount, setMyPledgeAmount] = useState<
      newnewapi.MoneyAmount | undefined
    >(undefined);
    const [pledgesNextPageToken, setPledgesNextPageToken] = useState<
      string | undefined | null
    >('');
    const [pledgesLoading, setPledgesLoading] = useState(false);
    const [loadingPledgesError, setLoadingPledgesError] = useState('');

    // Mobile choose pledge modal
    const [choosePledgeModalOpen, setChoosePledgeModalOpen] = useState(false);

    const handleToggleMutedMode = useCallback(() => {
      dispatch(toggleMutedMode(''));
    }, [dispatch]);

    const sortPleges = useCallback(
      (unsortedArr: TCfPledgeWithHighestField[]) => {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < unsortedArr.length; i++) {
          // eslint-disable-next-line no-param-reassign
          unsortedArr[i].isHighest = false;
        }

        const highestPledge = unsortedArr.sort(
          (a, b) =>
            (b?.amount?.usdCents as number) - (a?.amount?.usdCents as number)
        )[0];

        const pledgesByUser = user.userData?.userUuid
          ? unsortedArr
              .filter((o) => o.creator?.uuid === user.userData?.userUuid)
              .sort((a, b) => {
                // Sort by newest first
                return (b.id as number) - (a.id as number);
              })
          : [];

        // const pledgesByVipUsers = [];

        const workingArrSorted = unsortedArr.sort((a, b) => {
          // Sort the rest by newest first
          return (b.id as number) - (a.id as number);
        });

        const joinedArr = [
          ...(highestPledge &&
          highestPledge.creator?.uuid === user.userData?.userUuid
            ? [highestPledge]
            : []),
          ...pledgesByUser,
          // ...pledgesByVipUsers,
          ...(highestPledge &&
          highestPledge.creator?.uuid !== user.userData?.userUuid
            ? [highestPledge]
            : []),
          ...workingArrSorted,
        ];

        const workingSortedUnique =
          joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

        const highestPledgeIdx = (
          workingSortedUnique as TCfPledgeWithHighestField[]
        ).findIndex((o) => o.id === highestPledge.id);

        if (workingSortedUnique[highestPledgeIdx]) {
          workingSortedUnique[highestPledgeIdx].isHighest = true;
        }

        return workingSortedUnique;
      },
      [user.userData?.userUuid]
    );

    const fetchPledgesForPost = useCallback(
      async (pageToken?: string) => {
        if (pledgesLoading || loadingModalOpen) return;
        try {
          setPledgesLoading(true);
          setLoadingPledgesError('');

          const getCurrentPledgesPayload = new newnewapi.GetPledgesRequest({
            postUuid: post.postUuid,
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
          });

          const res = await fetchPledges(getCurrentPledgesPayload);

          if (!res.data || res.error)
            throw new Error(res.error?.message ?? 'Request failed');

          if (res.data && res.data.pledges) {
            setPledges((curr) => {
              const workingArr = [
                ...curr,
                ...(res.data?.pledges as TCfPledgeWithHighestField[]),
              ];
              const workingArrUnsorted = [...workingArr];

              return sortPleges(workingArrUnsorted);
            });
            setPledgesNextPageToken(res.data.paging?.nextPageToken);
          }

          setPledgesLoading(false);
        } catch (err) {
          setPledgesLoading(false);
          setLoadingPledgesError((err as Error).message);
          console.error(err);
        }
      },
      [pledgesLoading, loadingModalOpen, post.postUuid, sortPleges]
    );

    const handleAddPledgeFromResponse = useCallback(
      (newPledge: newnewapi.Crowdfunding.Pledge) => {
        setPledges((curr) => {
          const workingArrUnsorted = [
            ...curr,
            newPledge as TCfPledgeWithHighestField,
          ];
          return sortPleges(workingArrUnsorted);
        });
      },
      [setPledges, sortPleges]
    );

    const fetchPostLatestData = useCallback(async () => {
      try {
        const fetchPostPayload = new newnewapi.GetPostRequest({
          postUuid: post.postUuid,
        });

        const res = await fetchPostByUUID(fetchPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data.crowdfunding) {
          setCurrentBackers(res.data.crowdfunding.currentBackerCount as number);
          if (res.data.crowdfunding.status)
            handleUpdatePostStatus(res.data.crowdfunding.status);
        }
      } catch (err) {
        console.error(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFollowDecision = useCallback(async () => {
      try {
        if (!user.loggedIn) {
          window?.history.replaceState(
            {
              fromPost: true,
            },
            '',
            ''
          );
          router.push(
            `/sign-up?reason=follow-decision&redirect=${window.location.href}`
          );
          return;
        }
        const markAsFavoritePayload = new newnewapi.MarkPostRequest({
          markAs: !isFollowingDecision
            ? newnewapi.MarkPostRequest.Kind.FAVORITE
            : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
          postUuid: post.postUuid,
        });

        const res = await markPost(markAsFavoritePayload);

        if (res.error) throw new Error('Failed to mark post as favorite');
      } catch (err) {
        console.error(err);
      }
    }, [post.postUuid, isFollowingDecision, router, user.loggedIn]);

    // Render functions
    const renderBackersSection = useCallback(() => {
      switch (postStatus) {
        case 'voting': {
          return (
            <SBackersHolder>
              <CfBackersStatsSection
                targetBackerCount={post.targetBackerCount}
                currentNumBackers={currentBackers}
                myPledgeAmount={myPledgeAmount}
              />
              {!isMobile ? (
                <CfPledgeLevelsSection
                  post={post}
                  pledgeLevels={pledgeLevels}
                  handleAddPledgeFromResponse={handleAddPledgeFromResponse}
                  handleSetPaymentSuccessModalOpen={(newValue: boolean) =>
                    setPaymentSuccessModalOpen(newValue)
                  }
                />
              ) : null}
              {user.userTutorialsProgress.remainingCfSteps &&
                user.userTutorialsProgress.remainingCfSteps[0] ===
                  newnewapi.CfTutorialStep.CF_GOAL_PROGRESS && (
                  <STutorialTooltipHolder>
                    <TutorialTooltip
                      isTooltipVisible={
                        user.userTutorialsProgress.remainingCfSteps[0] ===
                        newnewapi.CfTutorialStep.CF_GOAL_PROGRESS
                      }
                      closeTooltip={goToNextStep}
                      title={t('tutorials.cf.peopleBids.title')}
                      text={t('tutorials.cf.peopleBids.text')}
                      dotPosition={DotPositionEnum.BottomRight}
                    />
                  </STutorialTooltipHolder>
                )}
            </SBackersHolder>
          );
        }
        case 'waiting_for_response': {
          return (
            <>
              <CfCrowdfundingSuccess
                post={post}
                currentNumBackers={currentBackers}
              />
              <PostWaitingForResponseBox
                title={t('postWaitingForResponse.title')}
                body={t('postWaitingForResponse.body')}
                buttonCaption={t('postWaitingForResponse.buttonText')}
                style={{
                  marginTop: '24px',
                }}
                handleButtonClick={() => {
                  Mixpanel.track('Favorite Post in PostWaitingForResponseBox', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                  });
                  handleFollowDecision();
                }}
              />
            </>
          );
        }
        case 'succeeded': {
          return (
            <>
              <CfCrowdfundingSuccess
                post={post}
                currentNumBackers={currentBackers}
              />
              <PostSuccessBox
                title={t('postSuccess.title', { postType: t(`postType.cf`) })}
                body={t('postSuccess.body')}
                buttonCaption={t('postSuccess.buttonText')}
                style={{
                  marginTop: '24px',
                }}
                handleButtonClick={() => {
                  Mixpanel.track('handleButtonClick in PostSuccessBox', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                  });
                  document.getElementById('post-modal-container')?.scrollTo({
                    top: document.getElementById(
                      'recommendations-section-heading'
                    )?.offsetTop,
                    behavior: 'smooth',
                  });
                }}
              />
            </>
          );
        }
        case 'failed': {
          return (
            <>
              <CfBackersStatsSectionFailed
                targetBackerCount={post.targetBackerCount}
                currentNumBackers={currentBackers}
                myPledgeAmount={myPledgeAmount}
              />
            </>
          );
        }
        default: {
          return (
            <>
              <CfBackersStatsSection
                targetBackerCount={post.targetBackerCount}
                currentNumBackers={currentBackers}
                myPledgeAmount={myPledgeAmount}
              />
            </>
          );
        }
      }

      return null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      t,
      post,
      isMobile,
      postStatus,
      pledgeLevels,
      currentBackers,
      myPledgeAmount,
      handleFollowDecision,
      handleAddPledgeFromResponse,
      user,
    ]);

    const handleOnVotingTimeExpired = () => {
      if (currentBackers >= post.targetBackerCount) {
        handleUpdatePostStatus('WAITING_FOR_RESPONSE');
      } else {
        handleUpdatePostStatus('FAILED');
      }
    };

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
        setPledges([]);
        setPledgesNextPageToken('');
        fetchPledgesForPost();
        fetchPostLatestData();
      });
      return () => {
        clearTimeout(timer);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post.postUuid]);

    useEffect(() => {
      if (standardPledgeAmounts) {
        const timer = setTimeout(() => {
          setPledgeLevels(standardPledgeAmounts);
        });
        return () => {
          clearTimeout(timer);
        };
      }
    }, [standardPledgeAmounts]);

    useEffect(() => {
      const socketHandlerPledgeCreated = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.CfPledgeCreated.decode(arr);
        if (decoded.pledge && decoded.postUuid === post.postUuid) {
          if (decoded.pledge.creator?.uuid === user.userData?.userUuid) return;
          setPledges((curr) => {
            const workingArr = [...curr];
            let workingArrUnsorted;
            const idx = workingArr.findIndex(
              (op) => op.id === decoded.pledge?.id
            );
            if (idx === -1) {
              workingArrUnsorted = [
                ...workingArr,
                decoded.pledge as TCfPledgeWithHighestField,
              ];
            } else {
              workingArr[idx].amount!!.usdCents = decoded.pledge?.amount
                ?.usdCents as number;
              workingArrUnsorted = workingArr;
            }

            return sortPleges(workingArrUnsorted);
          });
        }
      };

      const socketHandlerPostData = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostUpdated.decode(arr);

        if (!decoded) return;
        const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
        if (
          decodedParsed.postUuid === post.postUuid &&
          decoded.post?.crowdfunding?.currentBackerCount
        ) {
          setCurrentBackers(decoded.post?.crowdfunding?.currentBackerCount);
        }
      };

      const socketHandlerPostStatus = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostStatusUpdated.decode(arr);

        if (!decoded) return;
        if (decoded.postUuid === post.postUuid && decoded.crowdfunding) {
          handleUpdatePostStatus(decoded.crowdfunding);
        }
      };

      if (socketConnection) {
        socketConnection?.on('CfPledgeCreated', socketHandlerPledgeCreated);
        socketConnection?.on('PostUpdated', socketHandlerPostData);
        socketConnection?.on('PostStatusUpdated', socketHandlerPostStatus);
      }

      return () => {
        if (socketConnection && socketConnection?.connected) {
          socketConnection?.off('CfPledgeCreated', socketHandlerPledgeCreated);
          socketConnection?.off('PostUpdated', socketHandlerPostData);
          socketConnection?.off('PostStatusUpdated', socketHandlerPostStatus);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection, post, setPledges, sortPleges]);

    useEffect(() => {
      const makePledgeAfterStripeRedirect = async () => {
        if (!stripeSetupIntentClientSecret) return;
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

          const res = await doPledgeCrowdfunding(stripeContributionRequest);

          if (
            !res.data ||
            res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS ||
            res.error
          )
            throw new Error(res.error?.message ?? 'Request failed');

          handleAddPledgeFromResponse(
            res.data.pledge as newnewapi.Crowdfunding.Pledge
          );

          await fetchPostLatestData();

          setLoadingModalOpen(false);
          setPaymentSuccessModalOpen(true);
        } catch (err) {
          console.error(err);
          setLoadingModalOpen(false);
        }
        resetSetupIntentClientSecret();
      };

      if (stripeSetupIntentClientSecret && !loadingModalOpen) {
        makePledgeAfterStripeRedirect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const workingAmount = pledges
        .filter((pledge) => pledge.creator?.uuid === user.userData?.userUuid)
        .reduce(
          (acc, myPledge) =>
            myPledge.amount?.usdCents ? myPledge.amount?.usdCents + acc : acc,
          0
        );

      if (workingAmount !== 0 && workingAmount !== undefined) {
        setMyPledgeAmount(
          new newnewapi.MoneyAmount({
            usdCents: workingAmount,
          })
        );
      }
    }, [pledges, user.userData?.userUuid]);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    useEffect(() => {
      if (
        user.userTutorialsProgressSynced &&
        user.userTutorialsProgress.remainingCfSteps &&
        user.userTutorialsProgress.remainingCfSteps[0] ===
          newnewapi.CfTutorialStep.CF_HERO
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
            {postStatus === 'voting' ? (
              <PostTimer
                timestampSeconds={new Date(
                  (post.expiresAt?.seconds as number) * 1000
                ).getTime()}
                postType='cf'
                onTimeExpired={handleOnVotingTimeExpired}
              />
            ) : (
              <PostTimerEnded
                timestampSeconds={new Date(
                  (post.expiresAt?.seconds as number) * 1000
                ).getTime()}
                postType='cf'
              />
            )}
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
            postType='cf'
            postId={post.postUuid}
            postStatus={postStatus}
            title={post.title}
            creator={post.creator!!}
            hasWinner={false}
            totalPledges={currentBackers}
            targetPledges={post.targetBackerCount}
            isFollowingDecision={isFollowingDecision}
            hasRecommendations={hasRecommendations}
            handleSetIsFollowingDecision={handleSetIsFollowingDecision}
            handleReportOpen={handleReportOpen}
            handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited}
            handleAddPostToStateFavorited={handleAddPostToStateFavorited}
          />
          <SActivitesContainer>
            <PostVotingTab>{t('tabs.backers')}</PostVotingTab>
            {renderBackersSection()}
          </SActivitesContainer>
          {/* Loading Modal */}
          {loadingModalOpen && (
            <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
          )}
          {/* Payment success Modal */}
          <PaymentSuccessModal
            postType='cf'
            isVisible={paymentSuccessModalOpen}
            closeModal={() => setPaymentSuccessModalOpen(false)}
          >
            {t('paymentSuccessModal.cf', {
              postCreator:
                (post.creator?.nickname as string) ?? post.creator?.username,
              postDeadline: moment(
                (post.responseUploadDeadline?.seconds as number) * 1000
              )
                .subtract(3, 'days')
                .calendar(),
            })}
          </PaymentSuccessModal>
          {/* Choose pledge mobile modal */}
          {isMobile ? (
            <CfPledgeLevelsModal
              zIndex={11}
              post={post}
              pledgeLevels={pledgeLevels}
              isOpen={choosePledgeModalOpen}
              onClose={() => setChoosePledgeModalOpen(false)}
              handleAddPledgeFromResponse={handleAddPledgeFromResponse}
              handleSetPaymentSuccessModalOpen={(newValue: boolean) =>
                setPaymentSuccessModalOpen(newValue)
              }
            />
          ) : null}
          {/* Mobile floating button */}
          {isMobile && !choosePledgeModalOpen && postStatus === 'voting' ? (
            <>
              <SActionButton
                view='primaryGrad'
                onClick={() => setChoosePledgeModalOpen(true)}
              >
                {t('cfPost.floatingActionButton.choosePledgeButton')}
              </SActionButton>
              {user.userTutorialsProgress.remainingCfSteps &&
                user.userTutorialsProgress.remainingCfSteps[0] ===
                  newnewapi.CfTutorialStep.CF_BACK_GOAL && (
                  <STutorialTooltipHolderMobile>
                    <TutorialTooltip
                      isTooltipVisible={
                        user.userTutorialsProgress.remainingCfSteps[0] ===
                        newnewapi.CfTutorialStep.CF_BACK_GOAL
                      }
                      closeTooltip={goToNextStep}
                      title={t('tutorials.cf.createYourBid.title')}
                      text={t('tutorials.cf.createYourBid.text')}
                      dotPosition={DotPositionEnum.BottomRight}
                    />
                  </STutorialTooltipHolderMobile>
                )}
            </>
          ) : null}
          {isPopupVisible && (
            <HeroPopup
              isPopupVisible={isPopupVisible}
              postType='CF'
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

PostViewCF.defaultProps = {
  stripeSetupIntentClientSecret: undefined,
};

export default PostViewCF;

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

const SActionButton = styled(Button)`
  position: fixed;
  z-index: 2;

  width: calc(100% - 32px);
  bottom: 16px;
  left: 16px;
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  height: 100%;
  width: 100%;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 20px;
  bottom: 70%;
  text-align: left;
  z-index: 10;
  div {
    width: 190px;
  }

  ${({ theme }) => theme.media.tablet} {
    left: 0;
    bottom: 90%;
  }
`;

const SBackersHolder = styled.div`
  position: relative;
`;

const STutorialTooltipHolderMobile = styled.div`
  position: fixed;
  left: 20%;
  bottom: 82px;
  text-align: left;
  z-index: 999;
  div {
    width: 190px;
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
