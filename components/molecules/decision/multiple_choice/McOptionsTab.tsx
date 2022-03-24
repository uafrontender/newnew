/* eslint-disable no-nested-ternary */
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
import { validateText } from '../../../../api/endpoints/infrastructure';
import { getSubscriptionStatus } from '../../../../api/endpoints/subscription';
import { voteOnPostWithWallet } from '../../../../api/endpoints/multiple_choice';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import McOptionCard from './McOptionCard';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import VotesAmountTextInput from '../../../atoms/decision/VotesAmountTextInput';
import PaymentModal from '../../checkout/PaymentModal';
import LoadingModal from '../../LoadingModal';
import GradientMask from '../../../atoms/GradientMask';
import OptionActionMobileModal from '../OptionActionMobileModal';
import McOptionCardDoubleVote from './McOptionCardDoubleVote';

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
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const hasVotedOptionId = useMemo(() => {
    const supportedOption = options.find((o) => o.isSupportedByMe);

    if (supportedOption) return supportedOption.id;
    return undefined;
  }, [options]);

  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(containerRef);

  const [heightDelta, setHeightDelta] = useState(post.isSuggestionsAllowed && !hasVotedOptionId ? 56 : 0);
  const actionSectionContainer = useRef<HTMLDivElement>();

  const mainContainer = useRef<HTMLDivElement>();

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
  const handleTogglePaymentModalOpen = async () => {
    if (isAPIValidateLoading) return;
    if (!user.loggedIn) {
      router.push('/sign-up?reason=subscribe-suggest-new-option');
      return;
    }
    // Check if subscribed
    const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
      creatorUuid: post.creator?.uuid,
    });

    const res = await getSubscriptionStatus(getStatusPayload);

    if (res.data?.status?.notSubscribed || res.data?.status?.activeCancelsAt) {
      router.push(`/${post.creator?.username}/subscribe`);
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

  const handlePayWithWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged in
      if (!user.loggedIn) {
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
          successUrl: `${window.location.href.split('#')[0]}&`,
          cancelUrl: `${window.location.href.split('#')[0]}&`,
          ...(!user.loggedIn ? {
            nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
          } : {}),
          mcVoteRequest: {
            votesCount: parseInt(newBidAmount, 10),
            optionText: newOptionText,
            postUuid: post.postUuid,
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
          votesCount: parseInt(newBidAmount, 10),
          optionText: newOptionText,
          postUuid: post.postUuid,
        });

        const res = await voteOnPostWithWallet(makeBidPayload);

        if (res.data && res.data.status === newnewapi.VoteOnPostResponse.Status.INSUFFICIENT_WALLET_BALANCE) {
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${window.location.href.split('#')[0]}&`,
            cancelUrl: `${window.location.href.split('#')[0]}&`,
            mcVoteRequest: {
              votesCount: parseInt(newBidAmount, 10),
              optionText: newOptionText,
              postUuid: post.postUuid,
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

        setNewBidAmount('');
        setNewOptionText('');
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
    newOptionText,
    post.postUuid,
    user.loggedIn,
    handleAddOrUpdateOptionFromResponse,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${window.location.href.split('#')[0]}&`,
        cancelUrl: `${window.location.href.split('#')[0]}&`,
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

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (!hasVotedOptionId && post.isSuggestionsAllowed) {
      resizeObserver.observe(actionSectionContainer.current!!);
    } else {
      setHeightDelta(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVotedOptionId, post.isSuggestionsAllowed]);

  return (
    <>
      <STabContainer
        key="options"
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          heightDelta={heightDelta}
        >
          {!isMobile ? (
            <>
              <GradientMask gradientType="secondary" positionTop active={showTopGradient} />
              <GradientMask gradientType="secondary" positionBottom={heightDelta} active={showBottomGradient} />
            </>
          ) : null}
          {options.map((option, i) => (
            hasVotedOptionId === option.id ? (
              <McOptionCardDoubleVote
                key={option.id.toString()}
                option={option as TMcOptionWithHighestField}
                creator={option.creator ?? post.creator!!}
                postId={post.postUuid}
                index={i}
                hasAlreadyVoted={hasVotedOptionId === option.id}
                noAction={hasVotedOptionId !== undefined && hasVotedOptionId !== option.id}
                handleSetSupportedBid={(id: string) => setOptionBeingSupported(id)}
                handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
              />
            ) : (
              <McOptionCard
                key={option.id.toString()}
                option={option as TMcOptionWithHighestField}
                creator={option.creator ?? post.creator!!}
                postId={post.postUuid}
                index={i}
                minAmount={minAmount}
                optionBeingSupported={optionBeingSupported}
                noAction={hasVotedOptionId !== undefined && hasVotedOptionId !== option.id}
                handleSetSupportedBid={(id: string) => setOptionBeingSupported(id)}
                handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
              />
            )
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
                  { t('loadMoreBtn') }
                </SLoadMoreBtn>
              )
            ) : null
          )}
        </SBidsContainer>
        {post.isSuggestionsAllowed && !hasVotedOptionId ? (
          <SActionSection
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
          >
            <SuggestionTextArea
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              placeholder={t('McPost.OptionsTab.ActionSection.suggestionPlaceholder')}
              onChange={handleUpdateNewOptionText}
            />
            <VotesAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              disabled={optionBeingSupported !== ''}
              placeholder={
                newBidAmount && parseInt(newBidAmount, 10) > 1
                ? t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')
                : t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')
              }
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              bottomPlaceholder={
                !newBidAmount || parseInt(newBidAmount, 10) === 1
                ? `${1} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')} = $ ${5}`
                : `${newBidAmount} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')} = $ ${parseInt(newBidAmount, 10) * 5}`
              }
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!newOptionText
                || !newBidAmount
                || parseInt(newBidAmount, 10) < minAmount
                || optionBeingSupported !== ''
                || !newOptionTextValid}
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('McPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
            {!isMobileOrTablet && (
              <SBottomPlaceholder>
                {
                  !newBidAmount || parseInt(newBidAmount, 10) === 1
                  ? `${1} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')} = $ ${5}`
                  : `${newBidAmount} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')} = $ ${parseInt(newBidAmount, 10) * 5}`
                }
              </SBottomPlaceholder>
            )}
          </SActionSection>
        ) : (
          <div
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
            style={{
              height: 0,
            }}
          />
        )}
      </STabContainer>
      {/* Suggest new Modal */}
      {isMobile && !hasVotedOptionId ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              autofocus={suggestNewMobileOpen}
              placeholder="Add a option ..."
              onChange={handleUpdateNewOptionText}
            />
            <VotesAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              disabled={optionBeingSupported !== ''}
              placeholder={
                newBidAmount && parseInt(newBidAmount, 10) > 1
                ? t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')
                : t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')
              }
              bottomPlaceholder={
                !newBidAmount || parseInt(newBidAmount, 10) === 1
                ? `${1} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.vote')} = $ ${5}`
                : `${newBidAmount} ${t('McPost.OptionsTab.ActionSection.votesAmount.placeholder.votes')} = $ ${parseInt(newBidAmount, 10) * 5}`
              }
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!newOptionText
                || !newBidAmount
                || parseInt(newBidAmount, 10) < minAmount
                || optionBeingSupported !== ''
                || !newOptionTextValid}
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('McPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${parseInt(newBidAmount, 10) * 5}`}
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
      {isMobile && !suggestNewMobileOpen && !hasVotedOptionId ? (
        <SActionButton
          view="primaryGrad"
          onClick={() => setSuggestNewMobileOpen(true)}
        >
          { t('McPost.FloatingActionButton.suggestNewBtn') }
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
  height: calc(100% - 50px);

  ${({ theme }) => theme.media.tablet} {
    height: calc(100% - 56px);
  }
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
    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
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
      scrollbar-width: thin;
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: 100%;
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
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;

    min-height: 50px;
    width: 100%;
    z-index: 5;

    padding-top: 8px;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

    border-top: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines1};

    textarea {
      width: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    flex-wrap: nowrap;
    justify-content: initial;

    textarea {
      width: 277px;
    }
  }
`;

const SBottomPlaceholder = styled.div`
  display: none;

  ${({ theme }) => theme.media.laptop} {
    display: block;

    position: absolute;
    bottom: -30px;

    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
    width: max-content;
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
