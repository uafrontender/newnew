/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';

import { useAppSelector } from '../../../../redux-store/store';
import { voteOnPost } from '../../../../api/endpoints/multiple_choice';
import { validateText } from '../../../../api/endpoints/infrastructure';

import McOptionCard from './McOptionCard';
import Button from '../../../atoms/Button';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import PaymentModal from '../../checkout/PaymentModal';
import PlaceMcBidForm from './PlaceMcBidForm';
import LoadingModal from '../../LoadingModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';
import OptionActionMobileModal from '../OptionActionMobileModal';
import Text from '../../../atoms/Text';
import { createPaymentSession } from '../../../../api/endpoints/payments';

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadOptions: (token?: string) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTab: React.FunctionComponent<IMcOptionsTab> = ({
  post,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadOptions,
  handleAddOrUpdateOptionFromResponse,
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
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTextValid, setNewOptionTextValid] = useState(true);
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
    if (!user.loggedIn) {
      router.push('/sign-up?reason=vote');
      return;
    }
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
        setNewOptionTextValid(false);
      } else {
        setNewOptionTextValid(true);
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
    setNewOptionText(e.target.value);

    if (e.target.value.length > 0) {
      validateTextViaAPIDebounced(
        e.target.value,
      );
    }
  }, [
    setNewOptionText, validateTextViaAPIDebounced,
  ]);

  const handleSubmitNewOption = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const makeBidPayload = new newnewapi.VoteOnPostRequest({
        votesCount: parseInt(newBidAmount, 10),
        optionText: newOptionText,
        postUuid: post.postUuid,
      });

      const res = await voteOnPost(makeBidPayload);

      if (!res.data
        || res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      const optionFromResponse = (res.data.option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);

      setNewBidAmount('');
      setNewOptionText('');
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
    newOptionText,
    post.postUuid,
    handleAddOrUpdateOptionFromResponse,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${window.location.href}&`,
        cancelUrl: `${window.location.href}&`,
        mcVoteRequest: {
          votesCount: parseInt(newBidAmount, 10),
          optionText: newOptionText,
          postUuid: post.postUuid,
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
    newBidAmount,
    newOptionText,
    post.postUuid,
  ]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
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
        <SBidsContainer
          style={{
            ...(optionBeingSupported ? {
              overflowY: 'hidden',
            } : {}),
          }}
        >
          {options.map((option, i) => (
            <McOptionCard
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              postId={post.postUuid}
              index={i}
              minAmount={minAmount}
              optionBeingSupported={optionBeingSupported}
              handleSetSupportedBid={(id: string) => setOptionBeingSupported(id)}
              handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
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
                  onClick={() => handleLoadOptions(pagingToken)}
                >
                  Load more
                </SLoadMoreBtn>
              )
            ) : null
          )}
        </SBidsContainer>
        {post.isSuggestionsAllowed ? (
          <SActionSection>
            <SuggestionTextArea
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              placeholder="Add a option ..."
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              horizontalPadding="16px"
              disabled={optionBeingSupported !== ''}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
              style={{
                width: '60px',
              }}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!newOptionText
                || parseInt(newBidAmount, 10) < minAmount
                || optionBeingSupported !== ''
                || !newOptionTextValid}
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              Place a bid
            </Button>
          </SActionSection>
        ) : null}
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
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              placeholder="Add a option ..."
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              horizontalPadding="16px"
              disabled={optionBeingSupported !== ''}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!newOptionText
                || parseInt(newBidAmount, 10) < minAmount
                || optionBeingSupported !== ''
                || !newOptionTextValid}
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              Place a bid
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
          handlePayWithWallet={() => {}}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle
              variant={3}
            >
              { t('paymenModalHeader.subtitle') }
            </SPaymentModalTitle>
            <SPaymentModalOptionText>
              { newOptionText }
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
          Suggest new
        </SActionButton>
      ) : null}
    </>
  );
};

McOptionsTab.defaultProps = {
};

export default McOptionsTab;

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
