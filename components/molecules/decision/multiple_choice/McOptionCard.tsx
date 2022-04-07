/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useMemo, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../../redux-store/store';
import { voteOnPostWithWallet } from '../../../../api/endpoints/multiple_choice';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import OptionActionMobileModal from '../OptionActionMobileModal';
import VotesAmountTextInput from '../../../atoms/decision/VotesAmountTextInput';

import { formatNumber } from '../../../../utils/format';

// Icons
import SupportOptionIcon from '../../../../public/images/decision/support-option-mock.png';
import McSymbolIcon from '../../../../public/images/decision/mc-option-mock.png';

interface IMcOptionCard {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser,
  postId: string;
  index: number;
  minAmount: number;
  votePrice: number;
  noAction: boolean;
  optionBeingSupported?: string;
  handleSetSupportedBid: (id: string) => void;
  handleSetPaymentSuccesModalOpen: (newValue: boolean) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.MultipleChoice.Option) => void;
}

const McOptionCard: React.FunctionComponent<IMcOptionCard> = ({
  option,
  creator,
  postId,
  index,
  minAmount,
  votePrice,
  noAction,
  optionBeingSupported,
  handleSetSupportedBid,
  handleSetPaymentSuccesModalOpen,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const isCreatorsBid = useMemo(() => {
    if (!option.creator) return true;
    return false;
  }, [option.creator]);
  const supporterCountSubstracted = useMemo(() => {
    if (isCreatorsBid) return option.supporterCount;
    return  option.supporterCount - 1;
  }, [option.supporterCount, isCreatorsBid]);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled = optionBeingSupported !== '' && optionBeingSupported !== option.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(option.id.toString());
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  };

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => {
    window?.history.replaceState({
      fromPost: true,
    }, '', '');
    router.push(`/${creator?.username}`);
  }

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const handlePayWithWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged in
      if (!user.loggedIn) {
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
          ...(!user.loggedIn ? {
            nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
          } : {}),
          mcVoteRequest: {
            votesCount: parseInt(supportBidAmount, 10),
            optionId: option.id,
            postUuid: postId,
          }
        });

        const res = await getTopUpWalletWithPaymentPurposeUrl(getTopUpWalletWithPaymentPurposeUrlPayload);

        if (!res.data
          || !res.data.sessionUrl
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        window.location.href = res.data.sessionUrl;
      } else {
        const makeBidPayload = new newnewapi.VoteOnPostRequest({
          votesCount: parseInt(supportBidAmount, 10),
          optionId: option.id,
          postUuid: postId,
        });

        const res = await voteOnPostWithWallet(makeBidPayload);

        if (res.data && res.data.status === newnewapi.VoteOnPostResponse.Status.INSUFFICIENT_WALLET_BALANCE) {
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
            mcVoteRequest: {
              votesCount: parseInt(supportBidAmount, 10),
              optionId: option.id,
              postUuid: postId,
            }
          });

          const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(getTopUpWalletWithPaymentPurposeUrlPayload);

          if (!resStripeRedirect.data
            || !resStripeRedirect.data.sessionUrl
            || resStripeRedirect.error
          ) throw new Error(resStripeRedirect.error?.message ?? 'Request failed');

          window.location.href = resStripeRedirect.data.sessionUrl;
          return;
        }

        if (!res.data
          || res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data.option as newnewapi.MultipleChoice.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportFormOpen(false);
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
    setIsSupportFormOpen,
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
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${router.locale !== 'en-US' ? `${router.locale}/` : ''}post/${postId}`,
        ...(!user.loggedIn ? {
          nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
        } : {}),
        mcVoteRequest: {
          votesCount: parseInt(supportBidAmount, 10),
          optionId: option.id,
          postUuid: postId,
        }
      });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data
        || !res.data.sessionUrl
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [option.id, postId, supportBidAmount, user.loggedIn, router.locale]);

  return (
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
        $isDisabled={disabled}
        onClick={() => {
          if (!isMobile && !disabled && !noAction) {
            handleOpenSupportForm();
          }
        }}
      >
        <SBidDetails>
          <SBidAmount>
            <SOptionSymbolImg
              src={McSymbolIcon.src}
            />
            <div>
              {
                option.voteCount && option.voteCount > 0
                ? `${formatNumber(option?.voteCount, true)}`
                : t('McPost.OptionsTab.OptionCard.noVotes')
              }
            </div>
          </SBidAmount>
          <SOptionInfo
            variant={3}
          >
            {option.text}
          </SOptionInfo>
          <SBiddersInfo
            variant={3}
          >
            {isCreatorsBid ? (
              <>
                {supporterCountSubstracted > 0 ? (
                  <>
                    <SSpanBiddersHighlighted>
                      {formatNumber(
                        supporterCountSubstracted,
                        true,
                      )}
                      { ' ' }
                      { t('McPost.OptionsTab.OptionCard.voters') }
                    </SSpanBiddersHighlighted>
                    {' '}
                    <SSpanBiddersRegular>
                      {t('McPost.OptionsTab.OptionCard.voted')}
                    </SSpanBiddersRegular>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <SSpanBiddersHighlighted
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRedirectToOptionCreator()
                  }}
                  style={{
                    color: theme.name === 'dark' ? theme.colorsThemed.accent.yellow : theme.colors.dark,
                    cursor: 'pointer',
                  }}
                >
                  {t('McPost.OptionsTab.OptionCard.subscriber_suggestion',
                    {
                      nickname: option.creator?.nickname ?? option.creator?.username
                    },
                  )}
                </SSpanBiddersHighlighted>
                {supporterCountSubstracted > 0 ? (
                  <>
                    { ', ' }
                    <SSpanBiddersHighlighted>
                      {formatNumber(
                        supporterCountSubstracted,
                        true,
                      )}
                      { ' ' }
                      {t('McPost.OptionsTab.OptionCard.voters')}
                    </SSpanBiddersHighlighted>
                    {' '}
                    <SSpanBiddersRegular>
                      {t('McPost.OptionsTab.OptionCard.voted')}
                    </SSpanBiddersRegular>
                  </>
                ) : null}
              </>
            )
            }
          </SBiddersInfo>
        </SBidDetails>
        {(optionBeingSupported && !disabled) || noAction ? (
          null
        ) : (
          <SSupportButton
            view="quaternary"
            disabled={disabled}
            onClick={() => handleOpenSupportForm()}
          >
            {!isMobile ? (
              <img
                draggable={false}
                src={SupportOptionIcon.src}
                alt={t('McPost.OptionsTab.OptionCard.supportBtn')}
              />
            ) : (
              <>
                <img
                  draggable={false}
                  src={SupportOptionIcon.src}
                  alt={t('McPost.OptionsTab.OptionCard.supportBtn')}
                />
                <div>
                  { t('McPost.OptionsTab.OptionCard.supportBtn') }
                </div>
              </>
            )}
          </SSupportButton>
        )}
      </SContainer>
      <SSupportBidForm
        layout
      >
      {!isMobile && isSupportFormOpen && (
        <>
          <VotesAmountTextInput
            inputAlign="left"
            minAmount={minAmount}
            value={supportBidAmount}
            widthHardCoded="100%"
            placeholder={
              !supportBidAmount || parseInt(supportBidAmount, 10) > 1
              ? t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')
              : t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')
            }
            onChange={(newValue: string) => setSupportBidAmount(newValue)}
          />
          <Button
            view="primaryGrad"
            disabled={!supportBidAmount ? true : parseInt(supportBidAmount, 10) < minAmount}
            onClick={() => handleTogglePaymentModalOpen()}
          >
            { t('McPost.OptionsTab.OptionCard.placeABidBtn') }
          </Button>
          <SCancelButton
            view="secondary"
            onClick={() => handleCloseSupportForm()}
          >
            { t('McPost.OptionsTab.OptionCard.cancelBtn') }
          </SCancelButton>
          <SBottomPlaceholder>
            {
              !supportBidAmount || parseInt(supportBidAmount, 10) === 1
              ? `${1} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')} = $ ${1 * votePrice}`
              : `${supportBidAmount} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')} = $ ${parseInt(supportBidAmount, 10) * votePrice}`
            }
          </SBottomPlaceholder>
        </>
      )}
      {isMobile ? (
        <OptionActionMobileModal
          isOpen={isSupportFormOpen}
          onClose={() => handleCloseSupportForm()}
          zIndex={12}
        >
          <SSuggestSupportMobileContainer>
            <div>
              { option.text }
            </div>
            <VotesAmountTextInput
              inputAlign="left"
              minAmount={minAmount}
              value={supportBidAmount}
              autofocus={isSupportFormOpen}
              placeholder={
                !supportBidAmount || parseInt(supportBidAmount, 10) > 1
                ? t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')
                : t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')
              }
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!supportBidAmount}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('McPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
          </SSuggestSupportMobileContainer>
        </OptionActionMobileModal>
      ) : null}
      </SSupportBidForm>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          zIndex={12}
          showTocApply={!user?.loggedIn}
          isOpen={paymentModalOpen}
          amount={`$${parseInt(supportBidAmount, 10) * 1}`}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          handlePayWithWallet={handlePayWithWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle
              variant={3}
            >
              { t('McPost.paymenModalHeader.subtitle') }
            </SPaymentModalTitle>
            <SPaymentModalOptionText>
              { option.text }
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </motion.div>
  );
};

McOptionCard.defaultProps = {
  optionBeingSupported: undefined,
};

export default McOptionCard;

const SContainer = styled(motion.div)<{
  $isDisabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;

    padding: initial;
    background-color: initial;
    border-radius: initial;
  }
`;

const SBidDetails = styled.div`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
    'amount bidders'
    'optionInfo optionInfo';
    grid-template-columns: 3fr 7fr;



    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 14px;
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

const SSupportButton = styled(Button)`
  width: 100%;

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    background: none;

    &:hover:enabled,
    &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;

const SSupportBidForm = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;

  width: 100%;

  div:first-child {
    display: flex;
    max-width: 100%;
    flex-grow: 1;
    input {
      width: 100%;
    }
  }
`;

const SCancelButton = styled(Button)`
  width: auto;

  padding: 0px 12px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled,
  &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBottomPlaceholder = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  width: 100%;
`;

const SSuggestSupportMobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;
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
