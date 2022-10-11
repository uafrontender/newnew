/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';
import {
  deleteMcOption,
  doFreeVote,
  voteOnPost,
} from '../../../../../api/endpoints/multiple_choice';

import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import LoadingModal from '../../../LoadingModal';
import PaymentModal from '../../../checkout/PaymentModal';
import McOptionConfirmVoteModal from './McOptionConfirmVoteModal';

import { formatNumber } from '../../../../../utils/format';

// Icons
import VoteIconLight from '../../../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../../../public/images/decision/vote-icon-dark.png';
import McOptionCardSelectVotesMenu from './McOptionCardSelectVotesMenu';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import McOptionCardSelectVotesModal from './McOptionCardSelectVotesModal';
import getDisplayname from '../../../../../utils/getDisplayname';
import McConfirmUseFreeVoteModal from './McConfirmUseFreeVoteModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import Headline from '../../../../atoms/Headline';
import assets from '../../../../../constants/assets';
import OptionEllipseMenu from '../../common/OptionEllipseMenu';
import ReportModal, { ReportData } from '../../../chat/ReportModal';
import { reportEventOption } from '../../../../../api/endpoints/report';
import InlineSvg from '../../../../atoms/InlineSVG';
import MoreIcon from '../../../../../public/images/svg/icons/filled/More.svg';
import OptionEllipseModal from '../../common/OptionEllipseModal';
import McConfirmDeleteOptionModal from '../../moderation/multiple_choice/McConfirmDeleteOptionModal';
import { Mixpanel } from '../../../../../utils/mixpanel';
import PostTitleContent from '../../../../atoms/PostTitleContent';
import { getSubscriptionStatus } from '../../../../../api/endpoints/subscription';
import useStripeSetupIntent from '../../../../../utils/hooks/useStripeSetupIntent';
import getCustomerPaymentFee from '../../../../../utils/getCustomerPaymentFee';

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

interface IMcOptionCard {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser;
  postId: string;
  postCreator: string;
  postCreatorUuid: string;
  postText: string;
  index: number;
  minAmount: number;
  votePrice: number;
  noAction: boolean;
  votingAllowed: boolean;
  canVoteForFree: boolean;
  isCreatorsBid: boolean;
  optionBeingSupported?: string;
  handleResetFreeVote: () => void;
  handleSetSupportedBid: (id: string) => void;
  handleSetPaymentSuccessModalOpen: (newValue: boolean) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.MultipleChoice.Option
  ) => void;
  handleRemoveOption?: () => void;
}

const McOptionCard: React.FunctionComponent<IMcOptionCard> = ({
  option,
  creator,
  postId,
  postCreator,
  postCreatorUuid,
  postText,
  index,
  minAmount,
  votePrice,
  noAction,
  votingAllowed,
  canVoteForFree,
  isCreatorsBid,
  optionBeingSupported,
  handleResetFreeVote,
  handleSetSupportedBid,
  handleRemoveOption,
  handleSetPaymentSuccessModalOpen,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { appConstants } = useGetAppConstants();

  const [amISubscribed, setAmISubscribed] = useState(false);

  const isSuggestedByMe = useMemo(
    () =>
      !isCreatorsBid &&
      !!option.creator?.uuid &&
      option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid, isCreatorsBid]
  );

  const isBlue = useMemo(
    () => !!option.isSupportedByMe || isSuggestedByMe,
    [option.isSupportedByMe, isSuggestedByMe]
  );

  const supporterCountSubtracted = useMemo(() => {
    // if (option.supporterCount) return option.supporterCount;
    if (option.supporterCount > 0) {
      return option.supporterCount - 1;
    }
    return option.supporterCount;
  }, [option.supporterCount]);

  // Ellipse menu
  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);
  const [optionMenuX, setOptionMenuXY] = useState({
    x: 0,
    y: 0,
  });

  // Report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      await reportEventOption(option.id, reasons, message);
      setIsReportModalOpen(false);
    },
    [option.id]
  );

  const handleOpenReportForm = useCallback(() => {
    if (!user.loggedIn) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setIsReportModalOpen(true);
  }, [user, router]);

  const handleReportClose = useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  // Remove modal
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const handleRemoveSubmit = useCallback(async () => {
    try {
      const payload = new newnewapi.DeleteMcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteMcOption(payload);

      if (!res.error) {
        setIsRemoveModalOpen(false);
        handleRemoveOption?.();
      }
    } catch (err) {
      console.error(err);
      toast.error('toastErrors.generic');
    }
  }, [handleRemoveOption, option.id]);

  const handleOpenRemoveForm = useCallback(() => {
    setIsRemoveModalOpen(true);
  }, []);

  const handleRemoveClose = useCallback(() => {
    setIsRemoveModalOpen(false);
  }, []);

  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
  const [selectVotesMenuTop, setSelectVotesMenuTop] = useState<
    number | undefined
  >(undefined);

  const [isConfirmVoteModalOpen, setIsConfirmVoteModalOpen] = useState(false);
  const [isAmountPredefined, setIsAmountPredefined] = useState(false);

  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled =
    optionBeingSupported !== '' &&
    optionBeingSupported !== option.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportMenuOpen(true);
    handleSetSupportedBid(option.id.toString());
  };

  const handleCloseSupportForm = () => {
    setIsSupportMenuOpen(false);
    handleSetSupportedBid('');
  };

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [useFreeVoteModalOpen, setUseFreeVoteModalOpen] = useState(false);

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const handleOpenCustomAmountModal = () => {
    setSupportBidAmount('');
    setIsAmountPredefined(false);
    setIsConfirmVoteModalOpen(true);
  };

  const handleSetAmountAndOpenModal = (newAmount: string) => {
    setSupportBidAmount(newAmount);
    setIsAmountPredefined(true);
    setIsConfirmVoteModalOpen(true);
  };

  const handleCloseConfirmVoteModal = () => {
    setIsConfirmVoteModalOpen(false);
    setIsAmountPredefined(false);
  };

  const paymentAmountInCents = useMemo(
    () => (parseInt(supportBidAmount) || 0) * votePrice,
    [votePrice, supportBidAmount]
  );

  const paymentFeeInCents = useMemo(
    () =>
      getCustomerPaymentFee(
        paymentAmountInCents,
        parseFloat(appConstants.customerFee)
      ),
    [paymentAmountInCents, appConstants.customerFee]
  );

  const paymentWithFeeInCents = useMemo(
    () => paymentAmountInCents + paymentFeeInCents,
    [paymentAmountInCents, paymentFeeInCents]
  );

  const voteOnPostRequest = useMemo(
    () =>
      new newnewapi.VoteOnPostRequest({
        postUuid: postId,
        votesCount: parseInt(supportBidAmount),
        customerFee: new newnewapi.MoneyAmount({
          usdCents: paymentFeeInCents,
        }),
        optionId: option.id,
      }),
    [postId, supportBidAmount, option.id, paymentFeeInCents]
  );

  const setupIntent = useStripeSetupIntent({
    purpose: voteOnPostRequest,
    isGuest: !user.loggedIn,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`,
  });

  const handlePayWithCard = useCallback(
    async ({
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      saveCard?: boolean;
    }) => {
      setLoadingModalOpen(true);
      handleCloseConfirmVoteModal();

      if (setupIntent.isGuest) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${setupIntent.setupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('PayWithCard', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'McOptionCard',
      });

      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        const res = await voteOnPost(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        const optionFromResponse = (res.data
          .option as newnewapi.MultipleChoice.Option)!!;
        optionFromResponse.isSupportedByMe = true;

        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        handleSetPaymentSuccessModalOpen(true);
        setPaymentModalOpen(false);
        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportMenuOpen(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [
      handleSetPaymentSuccessModalOpen,
      handleSetSupportedBid,
      handleAddOrUpdateOptionFromResponse,
      postId,
      setupIntent,
      router,
      t,
    ]
  );

  const handleVoteForFree = useCallback(async () => {
    setUseFreeVoteModalOpen(false);
    setLoadingModalOpen(true);
    try {
      const payload = new newnewapi.VoteOnPostRequest({
        votesCount: appConstants.mcFreeVoteCount,
        optionId: option.id,
        postUuid: postId,
      });

      const res = await doFreeVote(payload);

      if (
        !res.data ||
        res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
        res.error
      ) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      const optionFromResponse = res.data
        .option as newnewapi.MultipleChoice.Option;
      optionFromResponse.isSupportedByMe = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);
      setLoadingModalOpen(false);
      handleResetFreeVote();
      handleSetPaymentSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);
      toast.error('toastErrors.generic');
    }
  }, [
    postId,
    option.id,
    appConstants.mcFreeVoteCount,
    handleAddOrUpdateOptionFromResponse,
    handleSetPaymentSuccessModalOpen,
    handleResetFreeVote,
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

  // Check if the user is subscribed
  useEffect(() => {
    async function checkAmISubscribed() {
      try {
        const payload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: postCreatorUuid,
        });

        const res = await getSubscriptionStatus(payload);

        if (
          res.data &&
          (res.data?.status?.activeRenewsAt ||
            res.data?.status?.activeCancelsAt)
        ) {
          setAmISubscribed(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (option.isSupportedByMe) {
      checkAmISubscribed();
    }
  }, [option.isSupportedByMe, postCreatorUuid]);

  return (
    <>
      <motion.div
        key={index}
        layout='position'
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <SContainer
          layout='position'
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          $isDisabled={disabled && votingAllowed}
          $isBlue={isBlue}
          onClick={(e) => {
            if (!isMobile && !disabled && !isEllipseMenuOpen) {
              setIsEllipseMenuOpen(true);

              setOptionMenuXY({
                x: e.clientX,
                y: e.clientY,
              });
            }
          }}
        >
          {isMobile && (
            <SEllipseButtonMobile onClick={() => setIsEllipseMenuOpen(true)}>
              <InlineSvg
                svg={MoreIcon}
                width='16px'
                height='16px'
                fill={isBlue ? '#FFFFFF' : theme.colorsThemed.text.primary}
              />
            </SEllipseButtonMobile>
          )}
          <SBidDetails isBlue={isBlue} noAction={noAction}>
            <SBidAmount>
              <OptionActionIcon
                src={
                  theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src
                }
              />
              <div>
                {option.voteCount && option.voteCount > 0
                  ? `${formatNumber(option?.voteCount, true)} ${
                      option.voteCount === 1
                        ? t('mcPost.optionsTab.optionCard.vote')
                        : t('mcPost.optionsTab.optionCard.votes')
                    }`
                  : t('mcPost.optionsTab.optionCard.noVotes')}
              </div>
            </SBidAmount>
            <SOptionInfo variant={3}>{option.text}</SOptionInfo>
            <SBiddersInfo variant={3}>
              <RenderSupportersInfo
                isCreatorsBid={isCreatorsBid}
                isSuggestedByMe={isSuggestedByMe}
                isSupportedByMe={!!option.isSupportedByMe}
                optionCreator={
                  option.creator ? getDisplayname(option.creator) : undefined
                }
                optionCreatorUsername={
                  option.creator
                    ? (option.creator.username as string)
                    : undefined
                }
                firstVoter={
                  option.firstVoter
                    ? getDisplayname(option.firstVoter)
                    : undefined
                }
                firstVoterUsername={
                  option.firstVoter
                    ? (option.firstVoter.username as string)
                    : undefined
                }
                supporterCount={option.supporterCount}
                supporterCountSubtracted={supporterCountSubtracted}
                amISubscribed={amISubscribed}
              />
            </SBiddersInfo>
          </SBidDetails>
          {noAction ? null : isMobile ? (
            <>
              <SSupportButton
                view='primary'
                disabled={disabled}
                isBlue={isBlue}
                canVoteForFree={canVoteForFree}
                onClickCapture={() => {
                  Mixpanel.track('Vote Click', {
                    _stage: 'Post',
                    _postUuid: postId,
                    _component: 'McOptionCard',
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canVoteForFree) {
                    setUseFreeVoteModalOpen(true);
                  } else {
                    handleOpenSupportForm();
                  }
                }}
              >
                <div>
                  {canVoteForFree
                    ? t('mcPost.optionsTab.optionCard.freeVoteButton')
                    : isBlue
                    ? t('mcPost.optionsTab.optionCard.supportAgainButton')
                    : t('mcPost.optionsTab.optionCard.raiseBidButton')}
                </div>
              </SSupportButton>
              {index === 0 && user?.userTutorialsProgress.remainingMcSteps && (
                <STutorialTooltipHolder>
                  <TutorialTooltip
                    isTooltipVisible={
                      user.userTutorialsProgress.remainingMcSteps[0] ===
                      newnewapi.McTutorialStep.MC_VOTE
                    }
                    closeTooltip={goToNextStep}
                    title={t('tutorials.mc.supportPeopleBids.title')}
                    text={t('tutorials.mc.supportPeopleBids.text')}
                    dotPosition={
                      isMobile
                        ? DotPositionEnum.BottomLeft
                        : DotPositionEnum.TopRight
                    }
                  />
                </STutorialTooltipHolder>
              )}
            </>
          ) : (
            <>
              <SSupportButtonDesktop
                id={`support-button-${isBlue ? 'supported' : index}`}
                active={isSupportMenuOpen}
                canVoteForFree={canVoteForFree}
                view='secondary'
                disabled={disabled}
                isBlue={isBlue}
                onClickCapture={() => {
                  Mixpanel.track('Vote Click', {
                    _stage: 'Post',
                    _postUuid: postId,
                    _component: 'McOptionCard',
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSupportMenuOpen) {
                    if (canVoteForFree) {
                      setUseFreeVoteModalOpen(true);
                      e.stopPropagation();
                    } else {
                      setSelectVotesMenuTop(e.clientY);
                      handleOpenSupportForm();
                    }
                  }
                }}
              >
                {canVoteForFree
                  ? t('mcPost.optionsTab.optionCard.freeVoteButton')
                  : !isBlue
                  ? t('mcPost.optionsTab.optionCard.supportButton')
                  : t('mcPost.optionsTab.optionCard.supportAgainButton')}
              </SSupportButtonDesktop>
              {index === 0 && user.userTutorialsProgress.remainingMcSteps && (
                <STutorialTooltipHolder>
                  <TutorialTooltip
                    isTooltipVisible={
                      user.userTutorialsProgress.remainingMcSteps[0] ===
                      newnewapi.McTutorialStep.MC_VOTE
                    }
                    closeTooltip={goToNextStep}
                    title={t('tutorials.mc.supportPeopleBids.title')}
                    text={t('tutorials.mc.supportPeopleBids.text')}
                    dotPosition={
                      isMobile
                        ? DotPositionEnum.BottomLeft
                        : DotPositionEnum.TopRight
                    }
                  />
                </STutorialTooltipHolder>
              )}
            </>
          )}
        </SContainer>
        {/* Confirm vote modal */}
        {isConfirmVoteModalOpen ? (
          <McOptionConfirmVoteModal
            zIndex={11}
            isOpen={isConfirmVoteModalOpen}
            predefinedAmount={isAmountPredefined}
            supportVotesAmount={supportBidAmount}
            postCreator={
              creator.nickname ? creator.nickname : creator.username ?? ''
            }
            optionText={option.text}
            minAmount={minAmount}
            votePrice={votePrice}
            onClose={() => handleCloseConfirmVoteModal()}
            handleSetSupportVotesAmount={(newValue: string) =>
              setSupportBidAmount(newValue)
            }
            handleOpenPaymentModal={() => handleTogglePaymentModalOpen()}
          />
        ) : null}
        {/* Use Free vote modal */}
        <McConfirmUseFreeVoteModal
          isVisible={useFreeVoteModalOpen}
          handleMakeFreeVote={handleVoteForFree}
          closeModal={() => setUseFreeVoteModalOpen(false)}
        />
        {/* Payment Modal */}
        {paymentModalOpen ? (
          <PaymentModal
            zIndex={12}
            isOpen={paymentModalOpen}
            amount={paymentWithFeeInCents}
            setupIntent={setupIntent}
            onClose={() => setPaymentModalOpen(false)}
            handlePayWithCard={handlePayWithCard}
            redirectUrl={`post/${postId}`}
            bottomCaption={
              (!appConstants.minHoldAmount?.usdCents ||
                paymentWithFeeInCents >
                  appConstants.minHoldAmount?.usdCents) && (
                <SPaymentSign variant='subtitle'>
                  {t('mcPost.paymentModalFooter.body', {
                    creator: postCreator,
                  })}
                  *
                  <Link href='https://terms.newnew.co'>
                    <SPaymentTermsLink
                      href='https://terms.newnew.co'
                      target='_blank'
                    >
                      {t('mcPost.paymentModalFooter.terms')}
                    </SPaymentTermsLink>
                  </Link>{' '}
                  {t('mcPost.paymentModalFooter.apply')}
                </SPaymentSign>
              )
            }
          >
            <SPaymentModalHeader>
              <SPaymentModalHeading>
                <SPaymentModalHeadingPostSymbol>
                  <SPaymentModalHeadingPostSymbolImg
                    src={assets.decision.votes}
                  />
                </SPaymentModalHeadingPostSymbol>
                <SPaymentModalHeadingPostCreator variant={3}>
                  {t('mcPost.paymentModalHeader.title', {
                    creator: postCreator,
                  })}
                </SPaymentModalHeadingPostCreator>
              </SPaymentModalHeading>
              <SPaymentModalPostText variant={2}>
                <PostTitleContent>{postText}</PostTitleContent>
              </SPaymentModalPostText>
              <SPaymentModalTitle variant='subtitle'>
                {t('mcPost.paymentModalHeader.subtitle')}
              </SPaymentModalTitle>
              <SPaymentModalOptionText variant={5}>
                {option.text}
              </SPaymentModalOptionText>
            </SPaymentModalHeader>
          </PaymentModal>
        ) : null}
        {/* Loading Modal */}
        <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      </motion.div>
      {/* Select votes */}
      {/* Mobile */}
      {isMobile && (
        <McOptionCardSelectVotesModal
          isVisible={isSupportMenuOpen}
          isSupportedByMe={!!option.isSupportedByMe}
          availableVotes={appConstants.availableMcVoteAmountOptions}
          handleClose={() => {
            handleCloseSupportForm();
          }}
          handleOpenCustomAmountModal={handleOpenCustomAmountModal}
          handleSetAmountAndOpenModal={handleSetAmountAndOpenModal}
        >
          <SSelectVotesModalCard isBlue={isBlue}>
            <SBidDetails isBlue={isBlue} noAction={noAction}>
              <SBidAmount>
                <OptionActionIcon
                  src={
                    theme.name === 'light'
                      ? VoteIconLight.src
                      : VoteIconDark.src
                  }
                />
                <div>
                  {option.voteCount && option.voteCount > 0
                    ? `${formatNumber(option?.voteCount, true)}`
                    : t('mcPost.optionsTab.optionCard.noVotes')}
                </div>
              </SBidAmount>
              <SOptionInfo variant={3}>{option.text}</SOptionInfo>
              <SBiddersInfo variant={3}>
                <RenderSupportersInfo
                  isCreatorsBid={isCreatorsBid}
                  isSuggestedByMe={isSuggestedByMe}
                  isSupportedByMe={!!option.isSupportedByMe}
                  optionCreator={
                    option.creator ? getDisplayname(option.creator) : undefined
                  }
                  optionCreatorUsername={
                    option.creator
                      ? (option.creator.username as string)
                      : undefined
                  }
                  firstVoter={
                    option.firstVoter
                      ? getDisplayname(option.firstVoter)
                      : undefined
                  }
                  firstVoterUsername={
                    option.firstVoter
                      ? (option.firstVoter.username as string)
                      : undefined
                  }
                  supporterCount={option.supporterCount}
                  supporterCountSubtracted={supporterCountSubtracted}
                  amISubscribed={amISubscribed}
                />
              </SBiddersInfo>
            </SBidDetails>
          </SSelectVotesModalCard>
        </McOptionCardSelectVotesModal>
      )}
      {/* Desktop */}
      {!isMobile && (
        <McOptionCardSelectVotesMenu
          top={selectVotesMenuTop}
          isVisible={isSupportMenuOpen}
          isSupportedByMe={!!option.isSupportedByMe}
          availableVotes={appConstants.availableMcVoteAmountOptions}
          handleClose={() => {
            handleCloseSupportForm();
            setSelectVotesMenuTop(undefined);
          }}
          handleOpenCustomAmountModal={handleOpenCustomAmountModal}
          handleSetAmountAndOpenModal={handleSetAmountAndOpenModal}
        />
      )}
      {/* Ellipse modal */}
      {isMobile && (
        <OptionEllipseModal
          zIndex={12}
          isOpen={isEllipseMenuOpen}
          isMyOption={isSuggestedByMe}
          optionType='mc'
          optionId={option.id as number}
          optionCreatorUuid={option.creator?.uuid ?? ''}
          onClose={() => setIsEllipseMenuOpen(false)}
          handleOpenReportOptionModal={() => handleOpenReportForm()}
          handleOpenRemoveOptionModal={() => handleOpenRemoveForm()}
        />
      )}
      {!isMobile && (
        <OptionEllipseMenu
          xy={optionMenuX}
          isVisible={isEllipseMenuOpen}
          isMyOption={isSuggestedByMe}
          optionType='mc'
          optionId={option.id as number}
          optionCreatorUuid={option.creator?.uuid ?? ''}
          handleClose={() => setIsEllipseMenuOpen(false)}
          handleOpenReportOptionModal={() => handleOpenReportForm()}
          handleOpenRemoveOptionModal={() => handleOpenRemoveForm()}
        />
      )}
      {/* Report modal */}
      {option.creator && (
        <ReportModal
          show={isReportModalOpen}
          reportedDisplayname={getDisplayname(option.creator)}
          onSubmit={handleReportSubmit}
          onClose={handleReportClose}
        />
      )}
      {/* Remove modal */}
      <McConfirmDeleteOptionModal
        isVisible={isRemoveModalOpen}
        closeModal={handleRemoveClose}
        handleConfirmDelete={handleRemoveSubmit}
      />
    </>
  );
};

McOptionCard.defaultProps = {
  optionBeingSupported: undefined,
  handleRemoveOption: undefined,
};

export default McOptionCard;

export const RenderSupportersInfo: React.FunctionComponent<{
  isCreatorsBid: boolean;
  isSuggestedByMe: boolean;
  isSupportedByMe: boolean;
  supporterCount: number;
  supporterCountSubtracted: number;
  optionCreator?: string;
  optionCreatorUsername?: string;
  firstVoter?: string;
  firstVoterUsername?: string;
  amISubscribed?: boolean;
}> = ({
  isCreatorsBid,
  isSupportedByMe,
  isSuggestedByMe,
  supporterCount,
  supporterCountSubtracted,
  optionCreator,
  optionCreatorUsername,
  firstVoter,
  firstVoterUsername,
  amISubscribed,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');

  if (isCreatorsBid && !isSupportedByMe) {
    return (
      <>
        {supporterCount > 0 ? (
          <>
            {firstVoter && (
              <Link href={`/${firstVoterUsername}`}>
                <SSpanBiddersHighlighted
                  onClick={(e) => e.stopPropagation()}
                  className='spanHighlighted'
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  {firstVoter}
                </SSpanBiddersHighlighted>
              </Link>
            )}
            <SSpanBiddersRegular className='spanRegular'>
              {supporterCountSubtracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubtracted > 0 ? (
              <SSpanBiddersHighlighted className='spanHighlighted'>
                {formatNumber(supporterCountSubtracted, true)}{' '}
                {t('mcPost.optionsTab.optionCard.others')}
              </SSpanBiddersHighlighted>
            ) : null}{' '}
            <SSpanBiddersRegular className='spanRegular'>
              {t('mcPost.optionsTab.optionCard.voted')}
            </SSpanBiddersRegular>
          </>
        ) : null}
      </>
    );
  }
  if (isCreatorsBid && isSupportedByMe) {
    return (
      <>
        {supporterCount > 0 ? (
          <>
            <SSpanBiddersHighlighted
              className='spanHighlighted'
              style={{
                ...(isSuggestedByMe || amISubscribed
                  ? {
                      color: theme.colorsThemed.accent.yellow,
                    }
                  : {}),
              }}
            >
              {supporterCount > 1 ? t('me') : t('I')}
            </SSpanBiddersHighlighted>
            <SSpanBiddersRegular className='spanRegular'>
              {supporterCountSubtracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubtracted > 0 ? (
              <SSpanBiddersHighlighted className='spanHighlighted'>
                {formatNumber(supporterCountSubtracted, true)}{' '}
                {t('mcPost.optionsTab.optionCard.others')}
              </SSpanBiddersHighlighted>
            ) : null}{' '}
            <SSpanBiddersRegular className='spanRegular'>
              {t('mcPost.optionsTab.optionCard.voted')}
            </SSpanBiddersRegular>
          </>
        ) : null}
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && !isSupportedByMe) {
    return (
      <>
        <Link href={`/${optionCreatorUsername}`}>
          <SSpanBiddersHighlighted
            className='spanHighlighted'
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              color:
                theme.name === 'dark'
                  ? theme.colorsThemed.accent.yellow
                  : theme.colors.dark,
              cursor: 'pointer',
            }}
          >
            {optionCreator}
          </SSpanBiddersHighlighted>
        </Link>
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted, true)}{' '}
              {t('mcPost.optionsTab.optionCard.others')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}{' '}
        <SSpanBiddersRegular className='spanRegular'>
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && isSupportedByMe) {
    return (
      <>
        <Link href={`/${optionCreatorUsername}`}>
          <SSpanBiddersHighlighted
            className='spanHighlighted'
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              color: theme.colorsThemed.accent.yellow,
              cursor: 'pointer',
            }}
          >
            {optionCreator}
          </SSpanBiddersHighlighted>
        </Link>
        <SSpanBiddersHighlighted className='spanHighlighted'>
          {', '}
          {`${t('me')}`}
        </SSpanBiddersHighlighted>
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted - 1 > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted - 1 > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted - 1, true)}{' '}
              {t('mcPost.optionsTab.optionCard.others')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}{' '}
        <SSpanBiddersRegular className='spanRegular'>
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && isSuggestedByMe) {
    return (
      <>
        <Link href={`/${optionCreatorUsername}`}>
          <SSpanBiddersHighlighted
            className='spanHighlighted'
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              color: theme.colorsThemed.accent.yellow,
              cursor: 'pointer',
            }}
          >
            {supporterCount > 1 ? t('me') : t('I')}
          </SSpanBiddersHighlighted>
        </Link>
        <SSpanBiddersRegular className='spanRegular'>
          {supporterCountSubtracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubtracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className='spanHighlighted'>
              {formatNumber(supporterCountSubtracted, true)}{' '}
              {t('mcPost.optionsTab.optionCard.others')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}{' '}
        <SSpanBiddersRegular className='spanRegular'>
          {t('mcPost.optionsTab.optionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  return null;
};

const SContainer = styled(motion.div)<{
  $isDisabled: boolean;
  $isBlue: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme, $isBlue }) =>
    $isBlue
      ? theme.colorsThemed.accent.blue
      : theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 0px;

    padding: initial;
    background-color: initial;
    border-radius: initial;
  }
`;

const SBidDetails = styled.div<{
  isBlue: boolean;
  noAction: boolean;
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ isBlue }) =>
    isBlue
      ? css`
          div {
            color: #ffffff;
          }

          .spanRegular {
            color: #ffffff;
            opacity: 0.6;
          }
          .spanHighlighted {
            color: #ffffff;
          }
        `
      : null}

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'amount bidders'
      'optionInfo optionInfo';
    grid-template-columns: 5fr 6fr;

    padding: 16px;

    background-color: ${({ theme, isBlue }) =>
      isBlue
        ? theme.colorsThemed.accent.blue
        : theme.colorsThemed.background.tertiary};

    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};

    ${({ noAction }) =>
      noAction
        ? css`
            border-top-right-radius: ${({ theme }) =>
              theme.borderRadius.medium};
            border-bottom-right-radius: ${({ theme }) =>
              theme.borderRadius.medium};
          `
        : null}
  }
`;

const SBidAmount = styled.div`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  font-weight: 700;
  font-size: 16px;
  line-height: 24px;

  margin-bottom: 8px;
`;

const OptionActionIcon = styled.img`
  height: 24px;
  width: 24px;
`;

const SOptionInfo = styled(Text)`
  grid-area: optionInfo;

  margin-bottom: 8px;

  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;

  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
    padding-top: 4px;

    text-align: right;
  }
`;

const SSpanBiddersHighlighted = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpanBiddersRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SSupportButton = styled(Button)<{
  isBlue: boolean;
  canVoteForFree: boolean;
}>`
  width: 100%;

  border-radius: 12px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  color: #ffffff;

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    color: ${({ theme }) => theme.colors.dark};
    background: #ffffff;
  }

  ${({ isBlue }) =>
    isBlue
      ? css`
          color: ${({ theme }) => theme.colors.dark};
          background: #ffffff;
        `
      : null}

  ${({ canVoteForFree }) =>
    canVoteForFree
      ? css`
          color: ${({ theme }) => theme.colors.dark};
          background: ${({ theme }) => theme.colorsThemed.accent.yellow};
        `
      : null}
`;

const SSupportButtonDesktop = styled(Button)<{
  isBlue: boolean;
  active: boolean;
  canVoteForFree: boolean;
}>`
  height: 100%;
  width: 60px;

  color: #ffffff;
  background: ${({ theme }) => theme.colorsThemed.accent.blue};

  padding: initial;

  border-radius: initial;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};

  span {
    width: 100%;

    text-align: center;
    white-space: pre;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
  }

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    color: ${({ theme }) => theme.colors.dark};
    background: #ffffff;
  }

  ${({ isBlue }) =>
    isBlue
      ? css`
          border-left: #ffffff 1px solid;
        `
      : null}

  ${({ active }) =>
    active
      ? css`
          color: ${({ theme }) => theme.colors.dark};
          background: #ffffff;
        `
      : null}

  ${({ canVoteForFree }) =>
    canVoteForFree
      ? css`
          color: ${({ theme }) => theme.colors.dark};
          background: ${({ theme }) => theme.colorsThemed.accent.yellow};
        `
      : null}
`;

// Select votes mobile card
const SSelectVotesModalCard = styled.div<{
  isBlue: boolean;
}>`
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  margin-bottom: 24px;
  padding: 16px;

  ${({ isBlue }) =>
    isBlue
      ? css`
          background: ${({ theme }) => theme.colorsThemed.accent.blue};

          div {
            color: #ffffff;
          }

          .spanRegular {
            color: #ffffff;
            opacity: 0.6;
          }
          .spanHighlighted {
            color: #ffffff;
          }
        `
      : null}
`;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 16px;

  padding-right: 64px;
  margin-bottom: 24px;
`;

const SPaymentModalHeadingPostSymbol = styled.div`
  background: ${({ theme }) => theme.colorsThemed.background.quaternary};

  display: flex;
  justify-content: center;
  align-items: center;

  width: 42px;
  height: 42px;
  border-radius: 50%;
`;

const SPaymentModalHeadingPostSymbolImg = styled.img`
  width: 24px;
`;

const SPaymentModalHeadingPostCreator = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

const SPaymentModalPostText = styled(Text)`
  display: flex;
  align-items: center;
  white-space: pre-wrap;
  word-break: break-word;
  gap: 8px;

  margin-bottom: 24px;
`;

const SPaymentModalTitle = styled(Text)`
  margin-bottom: 8px;
`;

const SPaymentModalOptionText = styled(Headline)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;

  text-align: left;
  div {
    width: 190px;
  }
  right: 35px;
  top: -20px;
  ${({ theme }) => theme.media.tablet} {
    right: 30px;
    top: 65px;
  }
`;

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SEllipseButtonMobile = styled(Button)`
  position: absolute;
  right: 16px;

  background: transparent;
  padding: 0;
  z-index: 1;

  &:hover:enabled,
  &:focus:enabled {
    background: transparent;
  }
`;
