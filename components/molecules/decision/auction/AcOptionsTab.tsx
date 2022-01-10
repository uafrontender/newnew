/* eslint-disable no-nested-ternary */
import React, {
  useCallback, useEffect, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { placeBidOnAuction } from '../../../../api/endpoints/auction';
import { useAppSelector } from '../../../../redux-store/store';

import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';

import AcOptionCard from './AcOptionCard';
import OptionOverview from './AcOptionOverview';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import PlaceBidForm from './PlaceAcBidForm';
import PaymentModal from '../PaymentModal';
import LoadingModal from '../LoadingModal';
import OptionActionMobileModal from '../OptionActionMobileModal';
import Button from '../../../atoms/Button';

interface IAcOptionsTab {
  postId: string;
  options: newnewapi.Auction.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
  overviewedOption?: newnewapi.Auction.Option;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.Auction.Option) => void;
  handleCloseOptionBidHistory: () => void;
  handleOpenOptionBidHistory: (
    optionToOpen: newnewapi.Auction.Option
  ) => void;
}

const AcOptionsTab: React.FunctionComponent<IAcOptionsTab> = ({
  postId,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
  overviewedOption,
  handleAddOrUpdateOptionFromResponse,
  handleCloseOptionBidHistory,
  handleOpenOptionBidHistory,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // New option/bid
  const [newBidText, setNewBidText] = useState('');
  const [newBidAmount, setNewBidAmount] = useState(minAmount.toString());
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
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

  const handleSubmitNewOption = useCallback(async () => {
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

      const optionFromResponse = (res.data.option as newnewapi.Auction.Option)!!;
      optionFromResponse.isSupportedByUser = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);

      setNewBidAmount('');
      setNewBidText('');
      setSuggestNewMobileOpen(false);
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
    handleAddOrUpdateOptionFromResponse,
  ]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  return (
    <>
      <STabContainer
        key="bids"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {
          !overviewedOption ? (
            <SBidsContainer
              style={{
                ...(optionBeingSupported ? {
                  overflowY: 'hidden',
                } : {}),
              }}
            >
              {options.map((option, i) => (
                <AcOptionCard
                  key={option.id.toString()}
                  option={option as TAcOptionWithHighestField}
                  postId={postId}
                  index={i}
                  minAmount={minAmount}
                  optionBeingSupported={optionBeingSupported}
                  handleSetSupportedBid={(id: string) => setOptionBeingSupported(id)}
                  handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
                  handleOpenOptionBidHistory={() => handleOpenOptionBidHistory(option)}
                />
              ))}
              {!isMobile ? (
                <SLoaderDiv
                  ref={loadingRef}
                />
              ) : (
                pagingToken ? (
                  (
                    <SLoadMoreBtn
                      onClick={() => handleLoadBids(pagingToken)}
                    >
                      { t('AcPost.OptionsTab.loadMoreBtn') }
                    </SLoadMoreBtn>
                  )
                ) : null
              )}
            </SBidsContainer>
          ) : (
            <OptionOverview
              postUuid={postId}
              overviewedOption={overviewedOption}
              handleCloseOptionBidHistory={handleCloseOptionBidHistory}
            />
          )
          }
        <SActionSection>
          <SuggestionTextArea
            value={newBidText}
            disabled={optionBeingSupported !== '' || overviewedOption !== undefined}
            placeholder={t('AcPost.OptionsTab.ActionSection.suggestionPlaceholder')}
            onChange={(e) => setNewBidText(e.target.value)}
          />
          <BidAmountTextInput
            value={newBidAmount}
            inputAlign="left"
            horizontalPadding="16px"
            disabled={optionBeingSupported !== '' || overviewedOption !== undefined}
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
              || optionBeingSupported !== ''
              || overviewedOption !== undefined}
            onClick={() => handleTogglePaymentModalOpen()}
          >
            { t('AcPost.OptionsTab.ActionSection.placeABidBtn') }
          </Button>
        </SActionSection>
      </STabContainer>
      {/* Suggest new Modal */}
      {isMobile ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newBidText}
              disabled={optionBeingSupported !== '' || overviewedOption !== undefined}
              placeholder={t('AcPost.OptionsTab.ActionSection.suggestionPlaceholder')}
              onChange={(e) => setNewBidText(e.target.value)}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              horizontalPadding="16px"
              disabled={optionBeingSupported !== '' || overviewedOption !== undefined}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!newBidText
                || parseInt(newBidAmount, 10) < minAmount
                || optionBeingSupported !== ''
                || overviewedOption !== undefined}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('AcPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            optionTitle={newBidText}
            amountRounded={newBidAmount}
            handlePlaceBid={handleSubmitNewOption}
          />
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
      {/* Mobile floating button */}
      {isMobile && !suggestNewMobileOpen ? (
        <SActionButton
          view="primaryGrad"
          onClick={() => setSuggestNewMobileOpen(true)}
        >
          { t('AcPost.FloatingActionButton.suggestNewBtn') }
        </SActionButton>
      ) : null}
    </>
  );
};

AcOptionsTab.defaultProps = {
  overviewedOption: undefined,
};

export default AcOptionsTab;

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

const SLoadMoreBtn = styled(Button)`

`;

const SActionButton = styled(Button)`
  position: fixed;
  z-index: 2;

  width: calc(100% - 32px);
  bottom: 16px;
  left: 16px;
`;

const SSuggestNewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;

  textarea {
    width: 100%;
  }
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
