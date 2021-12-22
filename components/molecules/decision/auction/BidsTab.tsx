/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { placeBidOnAuction } from '../../../../api/endpoints/auction';
import { useAppSelector } from '../../../../redux-store/store';

import BidCard from './BidCard';
import Button from '../../../atoms/Button';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceBidForm';
import LoadingModal from '../LoadingModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';

interface IBidsTab {
  postId: string;
  bids: newnewapi.Auction.Option[];
  bidsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
}

const BidsTab: React.FunctionComponent<IBidsTab> = ({
  postId,
  bids,
  bidsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();
  const textareaRef = useRef<HTMLTextAreaElement>();

  const [bidBeingSupported, setBidBeingSupported] = useState<number>(-1);

  // New suggestion/bid
  const [newBidText, setNewBidText] = useState('');
  const [newBidAmount, setNewBidAmount] = useState(minAmount.toString());
  // Payment modal
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

  const handleSubmitNewSuggestion = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const makeBidPayload = new newnewapi.PlaceBidRequest({
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(newBidAmount, 10) * 100,
        }),
        optionTitle: newBidText,
        postUuid: postId,
      });

      const res = await placeBidOnAuction(makeBidPayload);

      console.log(res);

      if (!res.data
        || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      console.log(res.data.status);

      setNewBidAmount('');
      setNewBidText('');
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [
    newBidAmount,
    newBidText,
    postId,
  ]);

  useEffect(() => {
    if (inView && !bidsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, bidsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SBidsContainer
          style={{
            ...(bidBeingSupported !== -1 ? {
              overflowY: 'hidden',
            } : {}),
          }}
        >
          {bids.map((bid, i) => (
            <BidCard
              key={bid.id.toString()}
              bid={bid}
              postId={postId}
              index={i}
              minAmount={minAmount}
              bidBeingSupported={bidBeingSupported}
              handleSetSupportedBid={(idx: number) => setBidBeingSupported(idx)}
            />
          ))}
        </SBidsContainer>
        <SLoaderDiv
          ref={loadingRef}
        />
        <SActionSection>
          <SuggestionTextArea
            value={newBidText}
            placeholder="Add a suggestion ..."
            onChange={(e) => setNewBidText(e.target.value)}
          />
          <BidAmountTextInput
            value={newBidAmount}
            inputAlign="center"
            horizontalPadding="5px"
            onChange={(newValue: string) => setNewBidAmount(newValue)}
            minAmount={minAmount}
            style={{
              width: '60px',
            }}
          />
          <Button
            view="primaryGrad"
            size="sm"
            disabled={!newBidText || parseInt(newBidAmount, 10) < minAmount}
            onClick={() => handleTogglePaymentModalOpen()}
          >
            Place a bid
          </Button>
        </SActionSection>
      </STabContainer>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            bidTitle={newBidText}
            amountRounded={newBidAmount}
            handlePlaceBid={handleSubmitNewSuggestion}
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

export default BidsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 112px);
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 125px;
  }
`;

const SLoaderDiv = styled.div`

`;

const SActionSection = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;

    position: absolute;
    min-height: 85px;
    width: 100%;
    z-index: 5;
    bottom: 0;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    box-shadow: 0px -50px 18px 20px rgba(20, 21, 31, 0.9);
  }
`;

const STextarea = styled.textarea`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 20px;
  resize: none;
  width: 277px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
  }
`;

const SAmountInput = styled.input`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 5px;
  width: 80px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: center;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
  }
`;
