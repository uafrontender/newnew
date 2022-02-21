/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';

import { useAppSelector } from '../../../../redux-store/store';
import { WalletContext } from '../../../../contexts/walletContext';
import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';
import { validateText } from '../../../../api/endpoints/infrastructure';

import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import AcOptionCard from './AcOptionCard';
import OptionOverview from './AcOptionOverview';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import OptionActionMobileModal from '../OptionActionMobileModal';


interface IAcOptionsTab {
  postId: string;
  options: newnewapi.Auction.Option[];
  optionToAnimate?: string;
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
  optionToAnimate,
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
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const { walletBalance } = useContext(WalletContext);

  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const [shadowTop, setShadowTop] = useState(false);
  const [shadowBottom, setShadowBottom] = useState(!isMobile);
  const [heightDelta, setHeightDelta] = useState(56);
  const containerRef = useRef<HTMLDivElement>();
  const actionSectionContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  const mainContainer = useRef<HTMLDivElement>();
  const overviewedRefId = useRef('');

  // New option/bid
  const [newBidText, setNewBidText] = useState('');
  const [newBidTextValid, setNewBidTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [newBidAmount, setNewBidAmount] = useState(minAmount.toString());
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  // Handlers
  const handleTogglePaymentModalOpen = () => {
    if (isAPIValidateLoading) return;
    // if (!user.loggedIn) {
    //   router.push('/sign-up?reason=bid');
    //   return;
    // }
    setPaymentModalOpen(true);
  };

  const validateTextViaAPI = useCallback(async (
    text: string,
  ) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(
        payload,
      );

      if (!res.data?.status) throw new Error('An error occured');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setNewBidTextValid(false);
      } else {
        setNewBidTextValid(true);
      }

      setIsAPIValidateLoading(false);
    } catch (err) {
      console.error(err);
      setIsAPIValidateLoading(false);
    }
  }, []);

  const validateTextViaAPIDebounced = useMemo(() => debounce((
    text: string,
  ) => {
    validateTextViaAPI(text);
  }, 250),
  [validateTextViaAPI]);

  const handleUpdateNewOptionText = useCallback((
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setNewBidText(e.target.value);

    if (e.target.value.length > 0) {
      validateTextViaAPIDebounced(
        e.target.value,
      );
    }
  }, [
    setNewBidText, validateTextViaAPIDebounced,
  ]);

  const handleSubmitNewOptionWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged and if the wallet balance is sufficient
      if (!user.loggedIn || (walletBalance && walletBalance?.usdCents < parseInt(newBidAmount, 10) * 100)) {
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
          successUrl: `${window.location.href}&`,
          cancelUrl: `${window.location.href}&`,
          ...(!user.loggedIn ? {
            nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
          } : {}),
          acBidRequest: {
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(newBidAmount, 10) * 100,
            }),
            optionTitle: newBidText,
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
        const makeBidPayload = new newnewapi.PlaceBidRequest({
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(newBidAmount, 10) * 100,
          }),
          optionTitle: newBidText,
          postUuid: postId,
        });

        const res = await placeBidWithWallet(makeBidPayload);

        // Additional handler if balance turned out to be insufficient
        if (res.data && res.data.status === newnewapi.PlaceBidResponse.Status.INSUFFICIENT_WALLET_BALANCE) {
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${window.location.href}&`,
            cancelUrl: `${window.location.href}&`,
            acBidRequest: {
              amount: new newnewapi.MoneyAmount({
                usdCents: parseInt(newBidAmount, 10) * 100,
              }),
              optionTitle: newBidText,
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
          || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data.option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        setNewBidAmount('');
        setNewBidText('');
        setSuggestNewMobileOpen(false);
        setPaymentModalOpen(false);
        setLoadingModalOpen(false);
      }
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [
    newBidAmount,
    newBidText,
    postId,
    user,
    walletBalance,
    handleAddOrUpdateOptionFromResponse,
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
        acBidRequest: {
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(newBidAmount, 10) * 100,
          }),
          optionTitle: newBidText,
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
  }, [
    user.loggedIn,
    newBidAmount,
    newBidText,
    postId,
  ]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  useEffect(() => {
    if (optionBeingSupported && containerRef.current) {
      let optIdx = options.findIndex((o) => o.id.toString() === optionBeingSupported);
      optIdx += 2;
      const childDiv = containerRef.current.children[optIdx];

      const childRect = childDiv.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();

      const scrollBy = childRect.top - parentRect.top;

      containerRef.current.scrollBy({
        top: scrollBy,
      });
    }
  }, [options, optionBeingSupported]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledToTop = (containerRef.current?.scrollTop ?? 0) < 10;
      const isScrolledToBottom = (
        (containerRef.current?.scrollTop ?? 0) + (containerRef.current?.clientHeight ?? 0))
        >= (containerRef.current?.scrollHeight ?? 0);

      if (!isScrolledToTop) {
        setShadowTop(true);
      } else {
        setShadowTop(false);
      }

      if (!isScrolledToBottom) {
        setShadowBottom(true);
      } else {
        setShadowBottom(false);
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);

    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, [overviewedOption]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    resizeObserver.observe(actionSectionContainer.current!!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (overviewedOption) {
      overviewedRefId.current = overviewedOption.id.toString();

      if (isMobile) {
        document.getElementById('post-modal-container')
          ?.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
          });
      }
    } else if (!overviewedOption && overviewedRefId.current) {
      let optIdx = options.findIndex((o) => o.id.toString() === overviewedRefId.current);
      optIdx += 2;
      const childDiv = containerRef.current!!.children[optIdx];

      if (childDiv) {
        if (isMobile) {
          childDiv.scrollIntoView();
        } else {
          const childRect = childDiv.getBoundingClientRect();
          const parentRect = containerRef.current!!.getBoundingClientRect();
          const scrollBy = childRect.top - parentRect.top;

          containerRef.current!!.scrollBy({
            top: scrollBy,
          });
        }
      }

      overviewedRefId.current = '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewedOption, options]);

  return (
    <>
      <STabContainer
        key="bids"
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {
          !overviewedOption ? (
            <SBidsContainer
              ref={(el) => {
                containerRef.current = el!!;
              }}
              heightDelta={heightDelta}
            >
              <SShadowTop
                style={{
                  opacity: shadowTop && !optionBeingSupported ? 1 : 0,
                }}
              />
              <SShadowBottom
                heightDelta={heightDelta}
                style={{
                  opacity: shadowBottom && !optionBeingSupported ? 1 : 0,
                }}
              />
              {options.map((option, i) => (
                <AcOptionCard
                  key={option.id.toString()}
                  option={option as TAcOptionWithHighestField}
                  shouldAnimate={optionToAnimate === option.id.toString()}
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
                      view="secondary"
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
        <SActionSection
          ref={(el) => {
            actionSectionContainer.current = el!!;
          }}
        >
          <SuggestionTextArea
            value={newBidText}
            disabled={optionBeingSupported !== '' || overviewedOption !== undefined}
            placeholder={t('AcPost.OptionsTab.ActionSection.suggestionPlaceholder')}
            onChange={handleUpdateNewOptionText}
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
              || overviewedOption !== undefined
              || !newBidTextValid}
            style={{
              ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
            }}
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
              onChange={handleUpdateNewOptionText}
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
                || overviewedOption !== undefined
                || !newBidTextValid}
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
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
          amount={`$${newBidAmount}`}
          showTocApply
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          handlePayWithWallet={handleSubmitNewOptionWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle
              variant={3}
            >
              { t('AcPost.paymenModalHeader.subtitle') }
            </SPaymentModalTitle>
            <SPaymentModalOptionText>
              { newBidText }
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
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
  optionToAnimate: undefined,
};

export default AcOptionsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 112px);
`;

const SBidsContainer = styled.div<{
  heightDelta: number;
}>`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height:  ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: .2s linear;
    }

    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: .2s linear;
    }

    &:hover {
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;

const SShadowTop = styled.div`
  position: absolute;
  top: 0px;
  left: 0;

  width: calc(100% - 18px);
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 1)' : 'rgba(241, 243, 249, 1)')};
  ;
  clip-path: inset(0px 0px -100px 0px);

  transition: linear .2s;
`;

const SShadowBottom = styled.div<{
  heightDelta: number;
}>`
  position: absolute;
  bottom: ${({ heightDelta }) => heightDelta}px;
  left: 0;

  width: calc(100% - 18px);
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(20, 21, 31, 1)' : 'rgba(241, 243, 249, 1)')};
  ;
  clip-path: inset(-100px 0px 0px 0px);
  transition: linear .2s;
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: calc(100% - 16px);
  height: 56px;
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
    align-items: flex-end;
    gap: 16px;

    position: absolute;
    min-height: 50px;
    width: 100%;
    z-index: 5;
    bottom: 0;

    padding-top: 8px;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
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
