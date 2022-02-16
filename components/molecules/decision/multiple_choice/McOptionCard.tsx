/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useMemo, useState,
} from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import Text from '../../../atoms/Text';
import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import PlaceMcBidForm from './PlaceMcBidForm';
import OptionActionMobileModal from '../OptionActionMobileModal';
import { voteOnPost, voteOnPostWithWallet } from '../../../../api/endpoints/multiple_choice';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

interface IMcOptionCard {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser,
  postId: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.MultipleChoice.Option) => void;
}

const McOptionCard: React.FunctionComponent<IMcOptionCard> = ({
  option,
  creator,
  postId,
  index,
  optionBeingSupported,
  minAmount,
  handleSetSupportedBid,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const myVote = useMemo(() => option.isSupportedByMe, [option.isSupportedByMe]);
  const myBid = useMemo(() => {
    if (!option.creator?.uuid || !user.userData?.userUuid) return false;
    return option.creator?.uuid === user.userData?.userUuid;
  }, [
    option.creator?.uuid,
    user.userData?.userUuid,
  ]);
  const bgVariant = highest ? 'yellow' : (
    myBid ? 'blue' : myVote ? 'green' : undefined);

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
  const handleRedirectToUser = () => router.push(`/u/${creator?.username}`);

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
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.GetTopUpWalletWithPaymentPurposeUrlRequest({
          successUrl: `${window.location.href}&`,
          cancelUrl: `${window.location.href}&`,
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
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.GetTopUpWalletWithPaymentPurposeUrlRequest({
            successUrl: `${window.location.href}&`,
            cancelUrl: `${window.location.href}&`,
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
    handleAddOrUpdateOptionFromResponse,
    supportBidAmount,
    option.id,
    postId,
    user.loggedIn,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${window.location.href}&`,
        cancelUrl: `${window.location.href}&`,
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
  }, [option.id, postId, supportBidAmount, user.loggedIn]);

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
        isDisabled={disabled}
      >
        <SBidDetails
          bgVariant={bgVariant}
        >
          <SBidInfo>
            {option.isSupportedByMe
              && creator?.uuid !== user.userData?.userUuid
              ? (
                <STag>{t('McPost.OptionsTab.tags.my_vote')}</STag>
              ) : null}
            {creator?.uuid === user.userData?.userUuid
              ? (
                <STag>{t('McPost.OptionsTab.tags.my_bid')}</STag>
              ) : null}
            {option.isHighest
              ? (
                <STag>{t('McPost.OptionsTab.tags.highest')}</STag>
              ) : null}
            {/* Comment out for now */}
            {/* {creator.isVIP
              ? (
                <STag>{t('McPost.OptionsTab.tags.vip')}</STag>
              ) : null} */}
            <SAvatar
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
              src={creator?.avatarUrl!! as string}
              alt={option?.creator?.username!!}
              draggable={false}
            />
            <SUsername
              isColored={bgVariant !== undefined}
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
            >
              { creator?.uuid === user.userData?.userUuid
                ? t('McPost.OptionsTab.me') : creator?.username }
            </SUsername>
            <SBidTitle
              variant={3}
            >
              { option.text }
            </SBidTitle>
          </SBidInfo>
          <SAmount>
            {option.voteCount}
            { ' ' }
            { t('McPost.OptionsTab.OptionCard.votes') }
          </SAmount>
          {myVote || myBid ? (
            <SDoubleMyVote>
              <SDoubleMyVoteCaption>
                { t('McPost.OptionsTab.OptionCard.doubleMyVoteCaption') }
              </SDoubleMyVoteCaption>
              <SDoubleMyVoteButton>
              { t('McPost.OptionsTab.OptionCard.doubleMyVoteButton') }
              </SDoubleMyVoteButton>
            </SDoubleMyVote>
          ) : null}
        </SBidDetails>
        {(myBid || myVote) ? null : optionBeingSupported && !disabled ? (
          <div
            style={{
              minWidth: isMobileOrTablet ? '82px' : '92px',
            }}
          />
        ) : (
          <SSupportButton
            view="secondary"
            disabled={disabled}
            onClick={() => handleOpenSupportForm()}
          >
            { t('McPost.OptionsTab.OptionCard.supportBtn') }
          </SSupportButton>
        )}
      </SContainer>
      <SSupportBidForm
        layout
      >
      {!isMobile && isSupportFormOpen && (
        <>
          <BidAmountTextInput
            value={supportBidAmount}
            inputAlign="left"
            horizontalPadding="20px"
            onChange={(newValue: string) => setSupportBidAmount(newValue)}
            minAmount={minAmount}
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
            <BidAmountTextInput
              value={supportBidAmount}
              inputAlign="left"
              horizontalPadding="16px"
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!supportBidAmount}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              Place a bid
            </Button>
          </SSuggestSupportMobileContainer>
        </OptionActionMobileModal>
      ) : null}
      </SSupportBidForm>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${supportBidAmount}`}
          showTocApply
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
  isDisabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: calc(100% - 16px);

  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
`;

const SBidDetails = styled.div<{
  bgVariant?: 'yellow' | 'green' | 'blue';
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'info amount'
    'doubleVote doubleVote'
  ;
  grid-template-columns: 7fr 2fr;
  gap: 16px;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ bgVariant }) => (
    bgVariant
      ? css`
        background: ${({ theme }) => theme.gradients.decisionOption[bgVariant]};
      ` : null
  )};

  &:hover {
    cursor: pointer;
  }
`;

const SBidInfo = styled.div`
  grid-area: info;

  /* display: flex; */
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;


  vertical-align: middle;
  line-height: 24px;
`;

const STag = styled.span`
  background-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 50px;
  padding: 6px;

  font-weight: bold;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.background.primary};

  margin-right: 8px;
`;

const SAvatar = styled.img`
  position: relative;
  top: 7.5px;

  display: inline;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  margin-right: 8px;

  cursor: pointer;
`;

const SUsername = styled.div<{
  isColored?: boolean;
}>`
  display: inline;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme, isColored }) => (isColored ? 'rgba(255, 255, 255, 0.8)' : theme.colorsThemed.text.secondary)};
  margin-right: 8px;

  transition: 0.2s linear;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBidTitle = styled(Text)`
  display: inline;
  line-break: loose;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

const SAmount = styled.div`
  grid-area: amount;
  align-self: center;
  justify-self: flex-end;


  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SDoubleMyVote = styled.div`
  grid-area: doubleVote;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 12px 16px;
  gap: 8px;

  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: nowrap;
  }
`;

const SDoubleMyVoteCaption = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: #FFFFFF;
`;

const SDoubleMyVoteButton = styled(Button)`
  background: #FFFFFF;
  color: #2C2C33;
  width: 100%;
  height: 48px;

  &:focus:enabled,
  &:hover:enabled  {
    background: #FFFFFF;
  }

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: fit-content;
  }
`;

const SSupportButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    margin-right: 16px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover:enabled, &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;

const SSupportBidForm = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  width: 100%;

  div {
    display: flex;
    width: 100%;
    flex-grow: 1;
    input {
      width: 100%;
    }
  }
`;

const SCancelButton = styled(Button)`
  width: auto;

  padding: 0px 12px;
  margin-right: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled, &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SSuggestSupportMobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;

`;


// Payment modal header
const SPaymentModalHeader = styled.div`

`;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
