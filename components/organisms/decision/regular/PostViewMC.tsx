/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { SocketContext } from '../../../../contexts/socketContext';
import { useUserData } from '../../../../contexts/userDataContext';
import {
  canCreateCustomOption,
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
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { useBundles } from '../../../../contexts/bundlesContext';
import BuyBundleModal from '../../../molecules/bundles/BuyBundleModal';
import { usePushNotifications } from '../../../../contexts/pushNotificationsContext';
import HighlightedButton from '../../../atoms/bundles/HighlightedButton';
import TicketSet from '../../../atoms/bundles/TicketSet';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import useMcOptions from '../../../../utils/hooks/useMcOptions';
import { useAppState } from '../../../../contexts/appStateContext';
import DisplayName from '../../../atoms/DisplayName';
import { useTutorialProgress } from '../../../../contexts/tutorialProgressContext';
import { useUiState } from '../../../../contexts/uiStateContext';
// import { SubscriptionToPost } from '../../../molecules/profile/SmsNotificationModal';

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

interface IPostViewMC {}

const PostViewMC: React.FunctionComponent<IPostViewMC> = React.memo(() => {
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const { userData } = useUserData();
  const { mutedMode, toggleMutedMode } = useUiState();
  const { resizeMode, userLoggedIn } = useAppState();
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
  const router = useRouter();
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const {
    postParsed,
    postStatus,
    saveCard,
    stripeSetupIntentClientSecret,
    handleGoBackInsidePost,
    resetSetupIntentClientSecret,
    refetchPost,
    handleUpdatePostData,
  } = usePostInnerState();
  const post = useMemo(
    () => postParsed as newnewapi.MultipleChoice,
    [postParsed]
  );

  // Socket
  const { socketConnection } = useContext(SocketContext);

  // Bundle
  const { bundles } = useBundles();
  const creatorsBundle = useMemo(
    () =>
      bundles?.find(
        (bundle) => bundle.creator?.uuid === postParsed?.creator?.uuid
      ),
    [bundles, postParsed?.creator?.uuid]
  );

  const [canAddOptionApiCheck, setCanAddOptionApiCheck] = useState(false);
  const canAddCustomOption = useMemo(() => {
    // Check if there's a bundle for creator
    if (!creatorsBundle) return false;

    return canAddOptionApiCheck;
  }, [creatorsBundle, canAddOptionApiCheck]);

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

  // Vote after stripe redirect
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Total votes
  const totalVotes = useMemo(() => post.totalVotes ?? 0, [post.totalVotes]);

  // Bundle modal
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

  const handleClickBuyBundlesButton = useCallback(() => {
    Mixpanel.track('Click Buy Bundles Button', {
      _stage: 'Post',
      _postUuid: post.postUuid,
      _component: 'PostViewMC',
    });
    setBuyBundleModalOpen(true);
  }, [post.postUuid]);

  const handleToggleMutedMode = useCallback(() => {
    toggleMutedMode();
  }, [toggleMutedMode]);

  const {
    processedOptions: options,
    hasNextPage: hasNextOptionsPage,
    fetchNextPage: fetchNextOptionsPage,
    addOrUpdateMcOptionMutation,
    removeMcOptionMutation,
  } = useMcOptions(
    {
      postUuid: post.postUuid,
      loggedInUser: userLoggedIn,
      userUuid: userData?.userUuid,
    },
    {
      onError: (err) => {
        showErrorToastCustom((err as Error).message);
      },
      refetchOnWindowFocus: userLoggedIn,
    }
  );

  const handleAddOrUpdateOptionFromResponse = useCallback(
    async (newOrUpdatedOption: newnewapi.MultipleChoice.Option) => {
      addOrUpdateMcOptionMutation?.mutate(newOrUpdatedOption);
    },
    [addOrUpdateMcOptionMutation]
  );

  const handleRemoveOption = useCallback(
    async (optionToRemove: newnewapi.MultipleChoice.Option) => {
      removeMcOptionMutation?.mutate(optionToRemove);
    },
    [removeMcOptionMutation]
  );

  const fetchPostLatestData = useCallback(
    async () => {
      try {
        const res = await refetchPost();

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // refetchPost, - reason unknown
    ]
  );

  const handleOnVotingTimeExpired = async () => {
    await refetchPost();
  };

  /* const subscription: SubscriptionToPost = useMemo(
    () => ({
      type: 'post',
      postUuid: post.postUuid,
      postTitle: post.title,
    }),
    [post]
  ); */

  useEffect(() => {
    const controller = new AbortController();

    async function checkCanAddCustomOption() {
      try {
        const payload = new newnewapi.CanCreateCustomMcOptionRequest({
          postUuid: post.postUuid,
        });

        const res = await canCreateCustomOption(payload, controller.signal);

        if (res.data?.canAdd) {
          setCanAddOptionApiCheck(res.data.canAdd);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (userLoggedIn && creatorsBundle) {
      checkCanAddCustomOption();
    }

    return () => {
      controller.abort();
    };
  }, [post.postUuid, userLoggedIn, creatorsBundle]);

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
        const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
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
          socketConnection?.off('McOptionDeleted', socketHandlerOptionDeleted);
          socketConnection?.off('PostUpdated', socketHandlerPostData);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      socketConnection,
      post,
      userData?.userUuid,
      // addOrUpdateAcOptionMutation, - reason unknown
      // fetchPostLatestData, - reason unknown
      // handleUpdatePostData, - reason unknown
      // removeMcOptionMutation, - reason unknown
    ]
  );

  const isVoteMadeAfterRedirect = useRef(false);

  useEffect(
    () => {
      const controller = new AbortController();
      const makeVoteAfterStripeRedirect = async () => {
        if (!stripeSetupIntentClientSecret || loadingModalOpen) {
          return;
        }

        if (!userLoggedIn) {
          router.push(
            `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
          );
          return;
        }

        isVoteMadeAfterRedirect.current = true;

        Mixpanel.track('Make Vote After Stripe Redirect', {
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
            !res?.data ||
            res.error ||
            res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
          ) {
            throw new Error(
              res?.error?.message ??
                t(getPayWithCardErrorMessage(res.data?.status))
            );
          }

          const optionFromResponse = res.data
            .option as newnewapi.MultipleChoice.Option;
          optionFromResponse.isSupportedByMe = true;
          handleAddOrUpdateOptionFromResponse(optionFromResponse);

          fetchPostLatestData();

          setLoadingModalOpen(false);
          setPaymentSuccessModalOpen(true);
        } catch (err: any) {
          console.error(err);
          showErrorToastCustom(err.message);
          setLoadingModalOpen(false);
        } finally {
          router.replace(
            `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/p/${
              post.postShortId ? post.postShortId : post.postUuid
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
    },
    // TODO: refactor into a hook similar to useBuyBundleAfterRedirect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // fetchPostLatestData, - runs once
      // handleAddOrUpdateOptionFromResponse, - runs once
      // loadingModalOpen, - runs once
      // post.postShortId, - runs once
      // post.postUuid, - runs once
      // resetSetupIntentClientSecret, - runs once
      // router, - runs once
      // saveCard, - runs once
      // showErrorToastCustom, - runs once
      // stripeSetupIntentClientSecret, - runs once
      // t, - runs once
      // userLoggedIn, - runs once
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
        remainingMcSteps: [...userTutorialsProgress.remainingMcSteps].slice(1),
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
                  {moment((post.expiresAt?.seconds as number) * 1000)
                    .locale(router.locale || 'en-US')
                    .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
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
            /* subscription={subscription} */
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
                  {moment((post.expiresAt?.seconds as number) * 1000)
                    .locale(router.locale || 'en-US')
                    .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
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
          postUuid={post.postUuid}
          announcement={post.announcement!!}
          response={post.response ?? undefined}
          responseViewed={responseViewed}
          handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          isMuted={mutedMode}
          handleToggleMuted={() => handleToggleMutedMode()}
        />
        {isMobile && (
          <PostTopInfo
            /* subscription={subscription} */
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
                        {moment((post.expiresAt?.seconds as number) * 1000)
                          .locale(router.locale || 'en-US')
                          .format(`MMM DD YYYY[${t('at')}]hh:mm A`)}
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
                  /* subscription={subscription} */
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
            postStatus={postStatus}
            postCreator={post.creator}
            options={options}
            canAddCustomOption={canAddCustomOption}
            bundle={creatorsBundle?.bundle ?? undefined}
            hasNextPage={!!hasNextOptionsPage}
            fetchNextPage={fetchNextOptionsPage}
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
            show={paymentSuccessModalOpen}
            closeModal={() => {
              setPaymentSuccessModalOpen(false);
              promptUserWithPushNotificationsPermissionModal();
            }}
          >
            <Trans
              t={t}
              i18nKey='paymentSuccessModal.mc'
              components={[<SDisplayName user={post.creator} />]}
            />
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
            {creatorsBundle?.bundle ? (
              t('mcPost.optionsTab.actionSection.getMoreBundles')
            ) : (
              <Trans
                t={t}
                i18nKey='mcPost.optionsTab.actionSection.offersBundles'
                components={[<DisplayName user={post.creator} />]}
              />
            )}
          </SBundlesText>
          <SHighlightedButton
            id='buy-bundle-button'
            size='small'
            onClick={handleClickBuyBundlesButton}
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
          modalType='initial'
          creator={post.creator}
          successPath={`/p/${post.postShortId}`}
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
  padding: 24px 40px;
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

const SDisplayName = styled(DisplayName)`
  max-width: 100%;
`;
