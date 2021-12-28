/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { placeBidOnAuction } from '../../../../api/endpoints/auction';
import { useAppSelector } from '../../../../redux-store/store';

import SuggestionCard from './SuggestionCard';
import Button from '../../../atoms/Button';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceBidForm';
import LoadingModal from '../LoadingModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import SuggestionOverview from './SuggestionOverview';
import { TOptionWithHighestField } from '../../../organisms/decision/PostViewAC';

interface IBidsTab {
  postId: string;
  suggestions: newnewapi.Auction.Option[];
  suggestionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
  overviewedSuggestion?: newnewapi.Auction.Option;
  handleUpdateIsSupportedByUser: (id: number) => void;
  handleCloseSuggestionBidHistory: () => void;
  handleOpenSuggestionBidHistory: (
    suggestionToOpen: newnewapi.Auction.Option
  ) => void;
}

const BidsTab: React.FunctionComponent<IBidsTab> = ({
  postId,
  suggestions,
  suggestionsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
  overviewedSuggestion,
  handleUpdateIsSupportedByUser,
  handleCloseSuggestionBidHistory,
  handleOpenSuggestionBidHistory,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const [suggestionBeingSupported, setSuggestionBeingSupported] = useState<string>('');

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

      if (!res.data
        || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

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
    if (inView && !suggestionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, suggestionsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {
          !overviewedSuggestion ? (
            <SBidsContainer
              style={{
                ...(suggestionBeingSupported ? {
                  overflowY: 'hidden',
                } : {}),
              }}
            >
              {suggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={suggestion.id.toString()}
                  suggestion={suggestion as TOptionWithHighestField}
                  postId={postId}
                  index={i}
                  minAmount={minAmount}
                  suggestionBeingSupported={suggestionBeingSupported}
                  handleSetSupportedBid={(id: string) => setSuggestionBeingSupported(id)}
                  handleUpdateIsSupportedByUser={handleUpdateIsSupportedByUser}
                  handleOpenSuggestionBidHistory={() => handleOpenSuggestionBidHistory(suggestion)}
                />
              ))}
              <SLoaderDiv
                ref={loadingRef}
              />
            </SBidsContainer>
          ) : (
            <SuggestionOverview
              postUuid={postId}
              overviewedSuggestion={overviewedSuggestion}
              handleCloseSuggestionBidHistory={handleCloseSuggestionBidHistory}
            />
          )
          }
        <SActionSection>
          <SuggestionTextArea
            value={newBidText}
            disabled={suggestionBeingSupported !== '' || overviewedSuggestion !== undefined}
            placeholder="Add a suggestion ..."
            onChange={(e) => setNewBidText(e.target.value)}
          />
          <BidAmountTextInput
            value={newBidAmount}
            inputAlign="left"
            horizontalPadding="16px"
            disabled={suggestionBeingSupported !== '' || overviewedSuggestion !== undefined}
            onChange={(newValue: string) => setNewBidAmount(newValue)}
            minAmount={minAmount}
            style={{
              width: '60px',
            }}
          />
          <Button
            view="primaryGrad"
            size="sm"
            disabled={!newBidText
              || parseInt(newBidAmount, 10) < minAmount
              || suggestionBeingSupported !== ''
              || overviewedSuggestion !== undefined}
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
            suggestionTitle={newBidText}
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

BidsTab.defaultProps = {
  overviewedSuggestion: undefined,
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
  /* gap: 16px; */

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 125px;
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
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
    box-shadow: 0px -50px 18px 20px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 0.9)' : 'rgba(241, 243, 249, 0.9)')};
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
