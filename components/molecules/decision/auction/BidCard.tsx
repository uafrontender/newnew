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

interface IBidCard {
  bid: newnewapi.Auction.Option;
  postId: string;
  index: number;
  bidBeingSupported?: number;
  minAmount: number;
  handleSetSupportedBid: (idx: number) => void;
}

const BidCard: React.FunctionComponent<IBidCard> = ({
  bid,
  postId,
  index,
  bidBeingSupported,
  minAmount,
  handleSetSupportedBid,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled = bidBeingSupported !== -1 && bidBeingSupported !== index;

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(index);
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid(-1);
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
        optionId: bid.id,
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

      handleSetSupportedBid(-1);
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
    bid.id,
    postId,
  ]);

  return (
    <>
      <SContainer
        isDisabled={disabled}
      >
        <SBidDetails
          onClick={() => {
            if (disabled) return;
            handleOpenSupportForm();
          }}
        >
          <SBidTitle
            variant={3}
          >
            { bid.title }
          </SBidTitle>
          <SBidInfo>
            <SAvatarArea>
              <img
                src={bid?.creator?.avatarUrl!! as string}
                alt={bid?.creator?.username!!}
              />
            </SAvatarArea>
            <SUsername>
              { bid?.creator?.username }
            </SUsername>
            <SAmount>
              {bid.totalAmount?.usdCents
                ? (
                  `$${(bid?.totalAmount?.usdCents / 100).toFixed(2)}`
                ) : '00.00'}
                {` by `}
                { bid.supporterCount }
                {` bidders `}
            </SAmount>
          </SBidInfo>
        </SBidDetails>
        {bidBeingSupported !== -1 && !disabled ? (
          <div
            style={{
              minWidth: '92px',
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
      {!isMobile && isSupportFormOpen && (
        <SSupportBidForm>
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
        </SSupportBidForm>
      )}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            bidTitle={bid.title}
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
    </>
  );
};

BidCard.defaultProps = {
  bidBeingSupported: undefined,
};

export default BidCard;

const SContainer = styled.div<{
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

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};


  ${({ theme }) => theme.media.laptop} {
    width: 430px;
  }
`;

const SBidTitle = styled(Text)`
  margin-bottom: 8px;
`;

const SBidInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

const SAvatarArea = styled.div`
  overflow: hidden;
  border-radius: 50%;
  width: 36px;
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SUsername = styled.div`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SAmount = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
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
