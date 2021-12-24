/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { placeBidOnAuction } from '../../../../api/endpoints/auction';

import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import Text from '../../../atoms/Text';
import LoadingModal from '../LoadingModal';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceBidForm';

interface ISuggestionCard {
  suggestion: newnewapi.Auction.Option;
  postId: string;
  index: number;
  suggestionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleOpenSuggestionBidHistory: () => void;
}

const SuggestionCard: React.FunctionComponent<ISuggestionCard> = ({
  suggestion,
  postId,
  index,
  suggestionBeingSupported,
  minAmount,
  handleSetSupportedBid,
  handleOpenSuggestionBidHistory,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled = suggestionBeingSupported !== '' && suggestionBeingSupported !== suggestion.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(suggestion.id.toString());
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  };

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  // Handlers
  const handleTogglePaymentModalOpen = () => {
    if (!user.loggedIn) {
      router.push('/sign-up?reason=bid');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleSubmitSupportBid = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const makeBidPayload = new newnewapi.PlaceBidRequest({
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(supportBidAmount, 10) * 100,
        }),
        optionId: suggestion.id,
        postUuid: postId,
      });

      const res = await placeBidOnAuction(makeBidPayload);

      console.log(res);

      if (!res.data
        || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      console.log(res.data.status);

      // Need to updated cached data!!!

      handleSetSupportedBid('');
      setSupportBidAmount('');
      setIsSupportFormOpen(false);
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
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
    supportBidAmount,
    suggestion.id,
    postId,
  ]);

  return (
    <motion.div
      key={suggestion.id.toString()}
      layout="position"
      // transition={{
      //   y: {
      //     type: 'spring',
      //     damping: 20,
      //     stiffness: 300,
      //   },
      //   default: {
      //     type: 'spring',
      //     damping: 20,
      //     stiffness: 300,
      //   },
      // }}
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
          onClick={() => {
            if (suggestionBeingSupported) return;
            handleOpenSuggestionBidHistory();
          }}
        >
          <SBidInfo>
              <SAvatar
                src={suggestion?.creator?.avatarUrl!! as string}
                alt={suggestion?.creator?.username!!}
                draggable={false}
              />
            <SUsername>
              { suggestion?.creator?.username }
            </SUsername>
            <SBidTitle
              variant={3}
            >
              { suggestion.title }
            </SBidTitle>
          </SBidInfo>
          <SAmount>
            {suggestion.totalAmount?.usdCents
              ? (
                `$${(suggestion?.totalAmount?.usdCents / 100).toFixed(2)}`
              ) : '00.00'}
          </SAmount>
        </SBidDetails>
        {suggestionBeingSupported && !disabled ? (
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
            { t('BidsTab.BidCard.supportBtn') }
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
            { t('BidsTab.BidCard.placeABidBtn') }
          </Button>
          <SCancelButton
            view="secondary"
            onClick={() => handleCloseSupportForm()}
          >
            { t('BidsTab.BidCard.cancelBtn') }
          </SCancelButton>
        </>
      )}
      </SSupportBidForm>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            suggestionTitle={suggestion.title}
            amountRounded={supportBidAmount}
            handlePlaceBid={handleSubmitSupportBid}
          />
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

SuggestionCard.defaultProps = {
  suggestionBeingSupported: undefined,
};

export default SuggestionCard;

const SContainer = styled(motion.div)<{
  isDisabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
`;

const SBidDetails = styled.div`
  display: grid;
  grid-template-areas: 'info amount';
  grid-template-columns: 7fr 1fr;
  gap: 16px;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:hover {
    cursor: pointer;
  }


  ${({ theme }) => theme.media.laptop} {
    width: 430px;
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

const SAvatar = styled.img`
  display: inline;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  margin-right: 8px;
  float: left;
`;

const SAvatarArea = styled.div`
  overflow: hidden;
  border-radius: 50%;
  width: 36px;
  height: 36px;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SUsername = styled.div`
  display: inline;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  margin-right: 8px;
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
