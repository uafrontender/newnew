/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import {
  doFreeVote,
  voteOnPostWithWallet,
} from '../../../../api/endpoints/multiple_choice';
import {
  createPaymentSession,
  getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';

import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import McOptionConfirmVoteModal from './McOptionConfirmVoteModal';

import { formatNumber } from '../../../../utils/format';

// Icons
import McSymbolIcon from '../../../../public/images/decision/mc-option.png';
import McOptionCardSelectVotesMenu from './McOptionCardSelectVotesMenu';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import McOptionCardSelectVotesModal from './McOptionCardSelectVotesModal';
import getDisplayname from '../../../../utils/getDisplayname';
import McConfirmUseFreeVoteModal from './McConfirmUseFreeVoteModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { WalletContext } from '../../../../contexts/walletContext';

interface IMcOptionCard {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser;
  postId: string;
  index: number;
  minAmount: number;
  votePrice: number;
  noAction: boolean;
  votingAllowed: boolean;
  canVoteForFree: boolean;
  optionBeingSupported?: string;
  handleResetFreeVote: () => void;
  handleSetSupportedBid: (id: string) => void;
  handleSetPaymentSuccesModalOpen: (newValue: boolean) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.MultipleChoice.Option
  ) => void;
}

const McOptionCard: React.FunctionComponent<IMcOptionCard> = ({
  option,
  creator,
  postId,
  index,
  minAmount,
  votePrice,
  noAction,
  votingAllowed,
  canVoteForFree,
  optionBeingSupported,
  handleResetFreeVote,
  handleSetSupportedBid,
  handleSetPaymentSuccesModalOpen,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const router = useRouter();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { appConstants } = useGetAppConstants();
  const { walletBalance } = useContext(WalletContext);

  const isBlue = useMemo(
    () => !!option.isSupportedByMe,
    [option.isSupportedByMe]
  );

  const isCreatorsBid = useMemo(() => {
    if (!option.creator) return true;
    return false;
  }, [option.creator]);

  const isSuggestedByMe = useMemo(
    () => !isCreatorsBid && option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid, isCreatorsBid]
  );

  const supporterCountSubstracted = useMemo(() => {
    // if (option.supporterCount) return option.supporterCount;
    if (option.supporterCount > 0) {
      return option.supporterCount - 1;
    }
    return option.supporterCount;
  }, [option.supporterCount]);

  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
  const [selectVotesMenuTop, setSelectVotesMenuTop] =
    useState<number | undefined>(undefined);

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

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => {
    window?.history.replaceState(
      {
        fromPost: true,
      },
      '',
      ''
    );
    router.push(`/${creator?.username}`);
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

  const handlePayWithWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    handleCloseConfirmVoteModal();
    try {
      // Check if user is logged in
      if (!user.loggedIn) {
        const getTopUpWalletWithPaymentPurposeUrlPayload =
          new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
              router.locale !== 'en-US' ? `${router.locale}/` : ''
            }post/${postId}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
              router.locale !== 'en-US' ? `${router.locale}/` : ''
            }post/${postId}`,
            ...(!user.loggedIn
              ? {
                  nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
                }
              : {}),
            mcVoteRequest: {
              votesCount: parseInt(supportBidAmount),
              optionId: option.id,
              postUuid: postId,
            },
          });

        const res = await getTopUpWalletWithPaymentPurposeUrl(
          getTopUpWalletWithPaymentPurposeUrlPayload
        );

        if (!res.data || !res.data.sessionUrl || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        window.location.href = res.data.sessionUrl;
      } else {
        const makeBidPayload = new newnewapi.VoteOnPostRequest({
          votesCount: parseInt(supportBidAmount),
          optionId: option.id,
          postUuid: postId,
        });

        const res = await voteOnPostWithWallet(makeBidPayload);

        if (
          res.data &&
          res.data.status ===
            newnewapi.VoteOnPostResponse.Status.INSUFFICIENT_WALLET_BALANCE
        ) {
          const getTopUpWalletWithPaymentPurposeUrlPayload =
            new newnewapi.TopUpWalletWithPurposeRequest({
              successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
                router.locale !== 'en-US' ? `${router.locale}/` : ''
              }post/${postId}`,
              cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
                router.locale !== 'en-US' ? `${router.locale}/` : ''
              }post/${postId}`,
              mcVoteRequest: {
                votesCount: parseInt(supportBidAmount),
                optionId: option.id,
                postUuid: postId,
              },
            });

          const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(
            getTopUpWalletWithPaymentPurposeUrlPayload
          );

          if (
            !resStripeRedirect.data ||
            !resStripeRedirect.data.sessionUrl ||
            resStripeRedirect.error
          )
            throw new Error(
              resStripeRedirect.error?.message ?? 'Request failed'
            );

          window.location.href = resStripeRedirect.data.sessionUrl;
          return;
        }

        if (
          !res.data ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
          res.error
        )
          throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data
          .option as newnewapi.MultipleChoice.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportMenuOpen(false);
        setPaymentModalOpen(false);
        setLoadingModalOpen(false);
        handleSetPaymentSuccesModalOpen(true);
      }
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [
    setPaymentModalOpen,
    setLoadingModalOpen,
    setIsSupportMenuOpen,
    setSupportBidAmount,
    handleSetSupportedBid,
    handleSetPaymentSuccesModalOpen,
    handleAddOrUpdateOptionFromResponse,
    supportBidAmount,
    option.id,
    postId,
    user.loggedIn,
    router.locale,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    handleCloseConfirmVoteModal();
    try {
      const createPaymentSessionPayload =
        new newnewapi.CreatePaymentSessionRequest({
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          ...(!user.loggedIn
            ? {
                nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
              }
            : {}),
          mcVoteRequest: {
            votesCount: parseInt(supportBidAmount),
            optionId: option.id,
            postUuid: postId,
          },
        });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data || !res.data.sessionUrl || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [option.id, postId, supportBidAmount, user.loggedIn, router.locale]);

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

      const optionFromResponse = (res.data
        .option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);
      setLoadingModalOpen(false);
      handleResetFreeVote();
      handleSetPaymentSuccesModalOpen(true);
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);
    }
  }, [
    postId,
    option.id,
    appConstants.mcFreeVoteCount,
    handleAddOrUpdateOptionFromResponse,
    handleSetPaymentSuccesModalOpen,
    handleResetFreeVote,
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

  return (
    <>
      <motion.div
        key={index}
        layout="position"
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
          layout="position"
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          $isDisabled={disabled && votingAllowed}
          $isBlue={isBlue}
          onClick={() => {
            if (!isMobile && !disabled && !noAction && !isSupportMenuOpen) {
              handleOpenSupportForm();
            }
          }}
        >
          <SBidDetails isBlue={isBlue} noAction={noAction}>
            <SBidAmount>
              <SOptionSymbolImg src={McSymbolIcon.src} />
              <div>
                {option.voteCount && option.voteCount > 0
                  ? `${formatNumber(option?.voteCount, true)} ${t(
                      'McPost.OptionsTab.OptionCard.votes'
                    )}`
                  : t('McPost.OptionsTab.OptionCard.noVotes')}
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
                firstVoter={
                  option.firstVoter
                    ? getDisplayname(option.firstVoter)
                    : undefined
                }
                supporterCount={option.supporterCount}
                supporterCountSubstracted={supporterCountSubstracted}
                handleRedirectToOptionCreator={handleRedirectToOptionCreator}
              />
            </SBiddersInfo>
          </SBidDetails>
          {noAction ? null : isMobile ? (
            <>
              <SSupportButton
                view="quaternary"
                disabled={disabled}
                isBlue={isBlue}
                canVoteForFree={canVoteForFree}
                onClick={() => {
                  if (canVoteForFree) {
                    setUseFreeVoteModalOpen(true);
                  } else {
                    handleOpenSupportForm();
                  }
                }}
              >
                <div>
                  {canVoteForFree
                    ? t('McPost.OptionsTab.OptionCard.freeVoteBtn')
                    : isBlue
                    ? t('McPost.OptionsTab.OptionCard.supportAgainBtn')
                    : t('McPost.OptionsTab.OptionCard.raiseBidBtn')}
                </div>
              </SSupportButton>
              {index === 0 && (
                <STutorialTooltipHolder>
                  <TutorialTooltip
                    isTooltipVisible={
                      user!!.userTutorialsProgress.remainingMcSteps!![0] ===
                      newnewapi.McTutorialStep.MC_VOTE
                    }
                    closeTooltip={goToNextStep}
                    title={t('tutorials.mc.supportPeopleBids.title')}
                    text={t('tutorials.mc.supportPeopleBids.text')}
                    dotPosition={DotPositionEnum.TopRight}
                  />
                </STutorialTooltipHolder>
              )}
            </>
          ) : (
            <>
              <SSupportButtonDesktop
                active={isSupportMenuOpen}
                canVoteForFree={canVoteForFree}
                view="secondary"
                disabled={disabled}
                isBlue={isBlue}
                onClick={(e) => {
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
                  ? t('McPost.OptionsTab.OptionCard.freeVoteBtn')
                  : !isBlue
                  ? t('McPost.OptionsTab.OptionCard.supportBtn')
                  : t('McPost.OptionsTab.OptionCard.supportAgainBtn')}
              </SSupportButtonDesktop>
              {index === 0 && (
                <STutorialTooltipHolder>
                  <TutorialTooltip
                    isTooltipVisible={
                      user!!.userTutorialsProgress.remainingMcSteps!![0] ===
                      newnewapi.McTutorialStep.MC_VOTE
                    }
                    closeTooltip={goToNextStep}
                    title={t('tutorials.mc.supportPeopleBids.title')}
                    text={t('tutorials.mc.supportPeopleBids.text')}
                    dotPosition={DotPositionEnum.TopRight}
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
            postCreator={creator.nickname!!}
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
            showTocApply={!user?.loggedIn}
            isOpen={paymentModalOpen}
            amount={`$${parseInt(supportBidAmount) * votePrice}`}
            {...(walletBalance?.usdCents &&
            walletBalance.usdCents >=
              parseInt(supportBidAmount) * votePrice * 100
              ? {}
              : {
                  predefinedOption: 'card',
                })}
            onClose={() => setPaymentModalOpen(false)}
            handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
            handlePayWithWallet={handlePayWithWallet}
          >
            <SPaymentModalHeader>
              <SPaymentModalTitle variant={3}>
                {t('McPost.paymenModalHeader.subtitle')}
              </SPaymentModalTitle>
              <SPaymentModalOptionText>{option.text}</SPaymentModalOptionText>
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
                <SOptionSymbolImg src={McSymbolIcon.src} />
                <div>
                  {option.voteCount && option.voteCount > 0
                    ? `${formatNumber(option?.voteCount, true)}`
                    : t('McPost.OptionsTab.OptionCard.noVotes')}
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
                  firstVoter={
                    option.firstVoter
                      ? getDisplayname(option.firstVoter)
                      : undefined
                  }
                  supporterCount={option.supporterCount}
                  supporterCountSubstracted={supporterCountSubstracted}
                  handleRedirectToOptionCreator={handleRedirectToOptionCreator}
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
    </>
  );
};

McOptionCard.defaultProps = {
  optionBeingSupported: undefined,
};

export default McOptionCard;

const RenderSupportersInfo: React.FunctionComponent<{
  isCreatorsBid: boolean;
  isSuggestedByMe: boolean;
  isSupportedByMe: boolean;
  supporterCount: number;
  supporterCountSubstracted: number;
  optionCreator?: string;
  firstVoter?: string;
  handleRedirectToOptionCreator: () => void;
}> = ({
  isCreatorsBid,
  isSupportedByMe,
  isSuggestedByMe,
  supporterCount,
  supporterCountSubstracted,
  optionCreator,
  firstVoter,
  handleRedirectToOptionCreator,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');

  if (isCreatorsBid && !isSupportedByMe) {
    return (
      <>
        {supporterCount > 0 ? (
          <>
            {firstVoter && (
              <SSpanBiddersHighlighted className="spanHighlighted">
                {firstVoter}
              </SSpanBiddersHighlighted>
            )}
            <SSpanBiddersRegular className="spanRegular">
              {supporterCountSubstracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubstracted > 0 ? (
              <SSpanBiddersHighlighted className="spanHighlighted">
                {formatNumber(supporterCountSubstracted, true)}{' '}
                {t('McPost.OptionsTab.OptionCard.others')}
              </SSpanBiddersHighlighted>
            ) : null}{' '}
            <SSpanBiddersRegular className="spanRegular">
              {t('McPost.OptionsTab.OptionCard.voted')}
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
            <SSpanBiddersHighlighted className="spanHighlighted">
              {t('me')}
            </SSpanBiddersHighlighted>
            <SSpanBiddersRegular className="spanRegular">
              {supporterCountSubstracted > 0 ? ` & ` : ''}
            </SSpanBiddersRegular>
            {supporterCountSubstracted > 0 ? (
              <SSpanBiddersHighlighted className="spanHighlighted">
                {formatNumber(supporterCountSubstracted, true)}{' '}
                {t('McPost.OptionsTab.OptionCard.others')}
              </SSpanBiddersHighlighted>
            ) : null}{' '}
            <SSpanBiddersRegular className="spanRegular">
              {t('McPost.OptionsTab.OptionCard.voted')}
            </SSpanBiddersRegular>
          </>
        ) : null}
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && !isSupportedByMe) {
    return (
      <>
        <SSpanBiddersHighlighted
          className="spanHighlighted"
          onClick={(e) => {
            e.stopPropagation();
            handleRedirectToOptionCreator();
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
        <SSpanBiddersRegular className="spanRegular">
          {supporterCountSubstracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubstracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className="spanHighlighted">
              {formatNumber(supporterCountSubstracted, true)}{' '}
              {t('McPost.OptionsTab.OptionCard.others')}
            </SSpanBiddersHighlighted>{' '}
          </>
        ) : null}
        <SSpanBiddersRegular className="spanRegular">
          {t('McPost.OptionsTab.OptionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && !isSuggestedByMe && isSupportedByMe) {
    return (
      <>
        <SSpanBiddersHighlighted
          className="spanHighlighted"
          onClick={(e) => {
            e.stopPropagation();
            handleRedirectToOptionCreator();
          }}
          style={{
            color: theme.colorsThemed.accent.yellow,
            cursor: 'pointer',
          }}
        >
          {optionCreator}
        </SSpanBiddersHighlighted>
        <SSpanBiddersHighlighted className="spanHighlighted">
          {', '}
          {`${t('me')}`}
        </SSpanBiddersHighlighted>
        <SSpanBiddersRegular className="spanRegular">
          {supporterCountSubstracted - 1 > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubstracted - 1 > 0 ? (
          <>
            <SSpanBiddersHighlighted className="spanHighlighted">
              {formatNumber(supporterCountSubstracted - 1, true)}{' '}
              {t('McPost.OptionsTab.OptionCard.others')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}{' '}
        <SSpanBiddersRegular className="spanRegular">
          {t('McPost.OptionsTab.OptionCard.voted')}
        </SSpanBiddersRegular>
      </>
    );
  }

  if (!isCreatorsBid && isSuggestedByMe) {
    return (
      <>
        <SSpanBiddersHighlighted
          className="spanHighlighted"
          onClick={(e) => {
            e.stopPropagation();
            handleRedirectToOptionCreator();
          }}
          style={{
            color: theme.colorsThemed.accent.yellow,
            cursor: 'pointer',
          }}
        >
          {`${t('me')}`}
        </SSpanBiddersHighlighted>
        <SSpanBiddersRegular className="spanRegular">
          {supporterCountSubstracted > 0 ? ` & ` : ''}
        </SSpanBiddersRegular>
        {supporterCountSubstracted > 0 ? (
          <>
            <SSpanBiddersHighlighted className="spanHighlighted">
              {formatNumber(supporterCountSubstracted, true)}{' '}
              {t('McPost.OptionsTab.OptionCard.others')}
            </SSpanBiddersHighlighted>
          </>
        ) : null}{' '}
        <SSpanBiddersRegular className="spanRegular">
          {t('McPost.OptionsTab.OptionCard.voted')}
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
    grid-template-columns: 3fr 7fr;

    padding: 14px;

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

  margin-bottom: 6px;
`;

const SOptionSymbolImg = styled.img`
  height: 24px;
`;

const SOptionInfo = styled(Text)`
  grid-area: optionInfo;

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
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

  background: ${({ theme }) => theme.colorsThemed.background.quinary};
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
          border-left: ${({ theme }) => theme.colors.dark} 1.5px solid;
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

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  right: 30px;
  top: 95px;
  text-align: left;
  div {
    width: 190px;
  }
`;
