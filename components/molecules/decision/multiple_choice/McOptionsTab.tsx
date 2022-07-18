/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, {
  useCallback,
  // useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { validateText } from '../../../../api/endpoints/infrastructure';
// import { getSubscriptionStatus } from '../../../../api/endpoints/subscription';
import {
  doFreeVote,
  // voteOnPostWithWallet,
} from '../../../../api/endpoints/multiple_choice';
import {
  createPaymentSession,
  // getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';

import { TMcOptionWithHighestField } from '../../../organisms/decision/PostViewMC';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import McOptionCard from './McOptionCard';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
// import VotesAmountTextInput from '../../../atoms/decision/VotesAmountTextInput';
import PaymentModal from '../../checkout/PaymentModalRedirectOnly';
import LoadingModal from '../../LoadingModal';
import GradientMask from '../../../atoms/GradientMask';
import OptionActionMobileModal from '../OptionActionMobileModal';
import PaymentSuccessModal from '../PaymentSuccessModal';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
// import { WalletContext } from '../../../../contexts/walletContext';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import McConfirmUseFreeVoteModal from './McConfirmUseFreeVoteModal';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import Headline from '../../../atoms/Headline';
import assets from '../../../../constants/assets';
import { formatNumber } from '../../../../utils/format';
import { Mixpanel } from '../../../../utils/mixpanel';
import PostTitleContent from '../../../atoms/PostTitleContent';

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  postLoading: boolean;
  postStatus: TPostStatusStringified;
  postCreator: string;
  postDeadline: string;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  votePrice: number;
  canVoteForFree: boolean;
  hasVotedOptionId?: number;
  canSubscribe: boolean;
  handleResetFreeVote: () => void;
  handleLoadOptions: (token?: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.MultipleChoice.Option
  ) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTab: React.FunctionComponent<IMcOptionsTab> = ({
  post,
  postLoading,
  postStatus,
  postCreator,
  postDeadline,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  votePrice,
  canVoteForFree,
  hasVotedOptionId,
  canSubscribe,
  handleLoadOptions,
  handleResetFreeVote,
  handleRemoveOption,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // const { walletBalance } = useContext(WalletContext);
  const { appConstants } = useGetAppConstants();

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const [heightDelta, setHeightDelta] = useState(
    post.isSuggestionsAllowed && !hasVotedOptionId && postStatus === 'voting'
      ? 56
      : 0
  );
  const actionSectionContainer = useRef<HTMLDivElement>();

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // New option/bid
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTextValid, setNewOptionTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newBidAmount, setNewBidAmount] = useState(minAmount.toString());
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [useFreeVoteModalOpen, setUseFreeVoteModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Handlers
  const validateTextViaAPI = useCallback(async (text: string) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(payload);

      if (!res.data?.status) throw new Error('An error occurred');

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

  const validateTextViaAPIDebounced = useMemo(
    () =>
      debounce((text: string) => {
        validateTextViaAPI(text);
      }, 250),
    [validateTextViaAPI]
  );

  const handleUpdateNewOptionText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewOptionText(e.target.value.trim() ? e.target.value : '');

      if (e.target.value.length > 0) {
        validateTextViaAPIDebounced(e.target.value);
      }
    },
    [setNewOptionText, validateTextViaAPIDebounced]
  );

  // const handlePayWithWallet = useCallback(async () => {
  //   setLoadingModalOpen(true);
  //   try {
  //     // Check if user is logged in
  //     if (!user.loggedIn) {
  //       const getTopUpWalletWithPaymentPurposeUrlPayload =
  //         new newnewapi.TopUpWalletWithPurposeRequest({
  //           successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //             router.locale !== 'en-US' ? `${router.locale}/` : ''
  //           }post/${post.postUuid}`,
  //           cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //             router.locale !== 'en-US' ? `${router.locale}/` : ''
  //           }post/${post.postUuid}`,
  //           ...(!user.loggedIn
  //             ? {
  //                 nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
  //               }
  //             : {}),
  //           mcVoteRequest: {
  //             votesCount: parseInt(newBidAmount),
  //             optionText: newOptionText,
  //             postUuid: post.postUuid,
  //           },
  //         });

  //       const res = await getTopUpWalletWithPaymentPurposeUrl(
  //         getTopUpWalletWithPaymentPurposeUrlPayload
  //       );

  //       if (!res.data || !res.data.sessionUrl || res.error)
  //         throw new Error(res.error?.message ?? 'Request failed');

  //       window.location.href = res.data.sessionUrl;
  //     } else {
  //       const makeBidPayload = new newnewapi.VoteOnPostRequest({
  //         votesCount: parseInt(newBidAmount),
  //         optionText: newOptionText,
  //         postUuid: post.postUuid,
  //       });

  //       const res = await voteOnPostWithWallet(makeBidPayload);

  //       if (
  //         res.data &&
  //         res.data.status ===
  //           newnewapi.VoteOnPostResponse.Status.INSUFFICIENT_WALLET_BALANCE
  //       ) {
  //         const getTopUpWalletWithPaymentPurposeUrlPayload =
  //           new newnewapi.TopUpWalletWithPurposeRequest({
  //             successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${post.postUuid}`,
  //             cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${post.postUuid}`,
  //             mcVoteRequest: {
  //               votesCount: parseInt(newBidAmount),
  //               optionText: newOptionText,
  //               postUuid: post.postUuid,
  //             },
  //           });

  //         const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(
  //           getTopUpWalletWithPaymentPurposeUrlPayload
  //         );

  //         if (
  //           !resStripeRedirect.data ||
  //           !resStripeRedirect.data.sessionUrl ||
  //           resStripeRedirect.error
  //         )
  //           throw new Error(
  //             resStripeRedirect.error?.message ?? 'Request failed'
  //           );

  //         window.location.href = resStripeRedirect.data.sessionUrl;
  //         return;
  //       }

  //       if (
  //         !res.data ||
  //         res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
  //         res.error
  //       )
  //         throw new Error(res.error?.message ?? 'Request failed');

  //       const optionFromResponse = (res.data
  //         .option as newnewapi.MultipleChoice.Option)!!;
  //       optionFromResponse.isSupportedByMe = true;
  //       handleAddOrUpdateOptionFromResponse(optionFromResponse);

  //       setNewBidAmount('');
  //       setNewOptionText('');
  //       setSuggestNewMobileOpen(false);
  //       setPaymentModalOpen(false);
  //       setLoadingModalOpen(false);
  //       setPaymentSuccessModalOpen(true);
  //     }
  //   } catch (err) {
  //     setPaymentModalOpen(false);
  //     setLoadingModalOpen(false);
  //     console.error(err);
  //   }
  // }, [
  //   newBidAmount,
  //   newOptionText,
  //   post.postUuid,
  //   user.loggedIn,
  //   router.locale,
  //   handleAddOrUpdateOptionFromResponse,
  // ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      Mixpanel.track('PayWithCardStripeRedirect', {
        _stage: 'Post',
        _postUuid: post.postUuid,
        _component: 'McOptionsTab',
      });
      const createPaymentSessionPayload =
        new newnewapi.CreatePaymentSessionRequest({
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${post.postUuid}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${post.postUuid}`,
          mcVoteRequest: {
            votesCount: parseInt(newBidAmount),
            optionText: newOptionText,
            postUuid: post.postUuid,
          },
        });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data || !res.data.sessionUrl || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [newBidAmount, newOptionText, post.postUuid, router.locale]);

  const handleVoteForFree = useCallback(async () => {
    setUseFreeVoteModalOpen(false);
    setLoadingModalOpen(true);
    Mixpanel.track('Vote For Free', {
      _stage: 'Post',
      _postUuid: post.postUuid,
      _component: 'McOptionsTab',
    });
    try {
      const payload = new newnewapi.VoteOnPostRequest({
        votesCount: appConstants.mcFreeVoteCount,
        optionText: newOptionText,
        postUuid: post.postUuid,
      });

      const res = await doFreeVote(payload);

      if (
        !res.data ||
        res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
        res.error
      ) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      const optionFromResponse = (res.data
        .option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      // optionFromResponse.isCreatedBySubscriber = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);

      setNewOptionText('');
      setSuggestNewMobileOpen(false);
      setLoadingModalOpen(false);
      handleResetFreeVote();
      setPaymentSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);
    }
  }, [
    newOptionText,
    post.postUuid,
    appConstants.mcFreeVoteCount,
    handleResetFreeVote,
    handleAddOrUpdateOptionFromResponse,
  ]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry: any) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize
        : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (
      post.isSuggestionsAllowed &&
      !postLoading &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      actionSectionContainer.current
    ) {
      resizeObserver.observe(actionSectionContainer.current!!);
    } else {
      setHeightDelta(0);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    hasVotedOptionId,
    postLoading,
    post.isSuggestionsAllowed,
    postStatus,
    isMobileOrTablet,
  ]);

  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingMcSteps &&
      user.userTutorialsProgress.remainingMcSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          mcCurrentStep: user.userTutorialsProgress.remainingMcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingMcSteps: [
            ...user.userTutorialsProgress.remainingMcSteps,
          ].slice(1),
        })
      );
    }
  };

  return (
    <>
      <STabContainer
        key='options'
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
              <GradientMask
                gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
                positionTop
                active={showTopGradient}
              />
              <GradientMask
                gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
                positionBottom={heightDelta}
                active={showBottomGradient}
              />
            </>
          ) : null}
          {options.map((option, i) => (
            <McOptionCard
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              postCreator={postCreator}
              postText={post.title}
              postId={post.postUuid}
              index={i}
              minAmount={minAmount}
              votePrice={votePrice}
              optionBeingSupported={optionBeingSupported}
              votingAllowed={postStatus === 'voting'}
              canVoteForFree={canVoteForFree}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              handleResetFreeVote={handleResetFreeVote}
              noAction={
                (hasVotedOptionId !== undefined &&
                  hasVotedOptionId !== option.id) ||
                postStatus === 'failed'
              }
              handleSetSupportedBid={(id: string) =>
                setOptionBeingSupported(id)
              }
              handleSetPaymentSuccesModalOpen={(newValue: boolean) =>
                setPaymentSuccessModalOpen(newValue)
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
              handleRemoveOption={() => {
                Mixpanel.track('Removed Option', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                handleRemoveOption(option);
              }}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : pagingToken ? (
            <SLoadMoreBtn
              onClick={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                handleLoadOptions(pagingToken);
              }}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
          ) : null}
        </SBidsContainer>
        {post.isSuggestionsAllowed &&
        !hasVotedOptionId &&
        canVoteForFree &&
        postStatus === 'voting' ? (
          <SActionSection
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
          >
            <SuggestionTextArea
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              placeholder={t(
                'mcPost.optionsTab.actionSection.suggestionPlaceholder'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <SAddFreeVoteButton
              size='sm'
              disabled={
                !newOptionText ||
                optionBeingSupported !== '' ||
                !newOptionTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => {
                Mixpanel.track('Click Add Free Option', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                setUseFreeVoteModalOpen(true);
              }}
            >
              {t('mcPost.optionsTab.actionSection.placeABidButton')}
            </SAddFreeVoteButton>
            {user.userTutorialsProgress.remainingMcSteps && (
              <STutorialTooltipTextAreaHolder>
                <TutorialTooltip
                  isTooltipVisible={
                    user.userTutorialsProgress.remainingMcSteps[0] ===
                    newnewapi.McTutorialStep.MC_TEXT_FIELD
                  }
                  closeTooltip={goToNextStep}
                  title={t('tutorials.mc.createYourBid.title')}
                  text={t('tutorials.mc.createYourBid.text')}
                  dotPosition={DotPositionEnum.BottomRight}
                />
              </STutorialTooltipTextAreaHolder>
            )}
          </SActionSection>
        ) : post.isSuggestionsAllowed &&
          !hasVotedOptionId &&
          !canVoteForFree &&
          postStatus === 'voting' &&
          canSubscribe &&
          !postLoading ? (
          <SActionSectionSubscribe
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
          >
            <SText variant={3}>
              {t('mcPost.optionsTab.actionSection.subscribeToCreatorCaption', {
                creator: post.creator?.nickname,
              })}
            </SText>
            <Link href={`/${post.creator?.username}/subscribe`}>
              <SSubscribeButton>
                {t('mcPost.optionsTab.actionSection.subscribeButton')}
              </SSubscribeButton>
            </Link>
          </SActionSectionSubscribe>
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
        {user.userTutorialsProgress.remainingMcSteps && (
          <STutorialTooltipHolder>
            <TutorialTooltip
              isTooltipVisible={
                user.userTutorialsProgress.remainingMcSteps[0] ===
                newnewapi.McTutorialStep.MC_ALL_OPTIONS
              }
              closeTooltip={goToNextStep}
              title={t('tutorials.mc.peopleBids.title')}
              text={t('tutorials.mc.peopleBids.text')}
              dotPosition={DotPositionEnum.BottomLeft}
            />
          </STutorialTooltipHolder>
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
              placeholder={t(
                'mcPost.optionsTab.actionSection.suggestionPlaceholderDesktop'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <SAddFreeVoteButton
              size='sm'
              disabled={
                !newOptionText ||
                optionBeingSupported !== '' ||
                !newOptionTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => {
                Mixpanel.track('Click Add Free Option', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                setUseFreeVoteModalOpen(true);
              }}
            >
              {t('mcPost.optionsTab.actionSection.placeABidButton')}
            </SAddFreeVoteButton>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Use Free vote modal */}
      <McConfirmUseFreeVoteModal
        isVisible={useFreeVoteModalOpen}
        handleMakeFreeVote={handleVoteForFree}
        closeModal={() => setUseFreeVoteModalOpen(false)}
      />
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${formatNumber(
            parseInt(newBidAmount) * votePrice ?? 0,
            true
          )}`}
          // {...(walletBalance?.usdCents &&
          // walletBalance.usdCents >= parseInt(newBidAmount) * votePrice * 100
          //   ? {}
          //   : {
          //       predefinedOption: 'card',
          //     })}

          // {...{
          //   ...(walletBalance &&
          //   walletBalance?.usdCents < parseInt(newBidAmount) * votePrice
          //     ? {
          //         predefinedOption: 'card',
          //       }
          //     : {}),
          // }}
          // predefinedOption='card'
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          // handlePayWithWallet={handlePayWithWallet}
          bottomCaption={
            <>
              <SPaymentSign variant={3}>
                {t('mcPost.paymentModalFooter.body', { creator: postCreator })}
              </SPaymentSign>
              <SPaymentTerms variant={3}>
                *{' '}
                <Link href='https://terms.newnew.co'>
                  <SPaymentTermsLink
                    href='https://terms.newnew.co'
                    target='_blank'
                  >
                    {t('mcPost.paymentModalFooter.terms')}
                  </SPaymentTermsLink>
                </Link>{' '}
                {t('mcPost.paymentModalFooter.apply')}
              </SPaymentTerms>
            </>
          }
          // payButtonCaptionKey={t('mcPost.paymentModalPayButton')}
        >
          <SPaymentModalHeader>
            <SPaymentModalHeading>
              <SPaymentModalHeadingPostSymbol>
                <SPaymentModalHeadingPostSymbolImg
                  src={assets.decision.votes}
                />
              </SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostCreator variant={3}>
                {t('mcPost.paymentModalHeader.title', {
                  creator: postCreator,
                })}
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalPostText variant={2}>
              <PostTitleContent>{post.title}</PostTitleContent>
            </SPaymentModalPostText>
            <SPaymentModalTitle variant={3}>
              {t('mcPost.paymentModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText variant={5}>
              {newOptionText}
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='mc'
        isVisible={paymentSuccessModalOpen}
        closeModal={() => setPaymentSuccessModalOpen(false)}
      >
        {t('paymentSuccessModal.mc', {
          postCreator,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile &&
      !suggestNewMobileOpen &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      post.isSuggestionsAllowed &&
      canVoteForFree ? (
        <>
          <SActionButton
            id='action-button-mobile'
            view='primaryGrad'
            onClick={() => setSuggestNewMobileOpen(true)}
            onClickCapture={() =>
              Mixpanel.track('SuggestNewMobile', {
                _stage: 'Post',
                _postUuid: post.postUuid,
                _component: 'McOptionsTab',
              })
            }
          >
            {t('mcPost.floatingActionButton.suggestNewButton')}
          </SActionButton>
          {user.userTutorialsProgress.remainingMcSteps && (
            <STutorialTooltipHolderMobile>
              <TutorialTooltip
                isTooltipVisible={
                  user.userTutorialsProgress.remainingMcSteps[0] ===
                  newnewapi.McTutorialStep.MC_TEXT_FIELD
                }
                closeTooltip={goToNextStep}
                title={t('tutorials.mc.createYourBid.title')}
                text={t('tutorials.mc.createYourBid.text')}
                dotPosition={DotPositionEnum.BottomRight}
              />
            </STutorialTooltipHolderMobile>
          )}
        </>
      ) : null}
    </>
  );
};

McOptionsTab.defaultProps = {};

export default McOptionsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  /* height: calc(100% - 50px); */

  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    display: initial;

    height: calc(100% - 56px);
    height: 100%;
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
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
    padding-top: 0px;
    padding-right: 12px;
    margin-right: -14px;
    width: calc(100% + 14px);

    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
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

const SAddFreeVoteButton = styled(Button)`
  width: 100%;

  color: ${({ theme }) => theme.colors.dark};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  }
`;

const SActionSection = styled.div`
  display: none;
  position: relative;

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

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary};

    border-top: 1.5px solid
      ${({ theme }) => theme.colorsThemed.background.outlines1};

    textarea {
      width: 100%;
    }
  }
`;

const SActionSectionSubscribe = styled.div`
  order: -1;

  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;

  min-height: 50px;
  width: 100%;
  z-index: 5;

  padding-top: 24px;

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colorsThemed.background.primary};

  div {
    width: 100%;
    text-align: center;
  }

  button {
    width: 100%;
  }
  ${({ theme }) => theme.media.tablet} {
    order: unset;

    padding-top: 18px;

    border-top: 1.5px solid
      ${({ theme }) => theme.colorsThemed.background.outlines1};
  }

  ${({ theme }) => theme.media.laptop} {
    flex-wrap: nowrap;
    justify-content: initial;
    gap: 16px;

    div {
      width: initial;
      text-align: left;
    }
    button {
      max-width: 130px;
    }
  }
`;

const SText = styled(Text)`
  height: 100%;
  align-self: center;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
`;

const SSubscribeButton = styled(Button)`
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  color: ${({ theme }) => theme.colors.dark};

  :active:enabled,
  :focus:enabled,
  :hover:enabled {
    background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  }
`;

// const SBottomPlaceholder = styled.div`
//   display: none;

//   ${({ theme }) => theme.media.laptop} {
//     display: block;

//     position: absolute;
//     bottom: 0px;

//     font-weight: 600;
//     font-size: 12px;
//     line-height: 16px;
//     color: ${({ theme }) => theme.colorsThemed.text.tertiary};
//     width: max-content;
//   }
// `;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 16px;

  padding-right: 64px;
  margin-bottom: 24px;
`;

const SPaymentModalHeadingPostSymbol = styled.div`
  background: ${({ theme }) => theme.colorsThemed.background.quaternary};

  display: flex;
  justify-content: center;
  align-items: center;

  width: 42px;
  height: 42px;
  border-radius: 50%;
`;

const SPaymentModalHeadingPostSymbolImg = styled.img`
  width: 24px;
`;

const SPaymentModalHeadingPostCreator = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

const SPaymentModalPostText = styled(Text)`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 24px;
`;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled(Headline)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 40%;
  bottom: 90%;
  text-align: left;
  div {
    width: 190px;
  }
`;

const STutorialTooltipHolderMobile = styled.div`
  position: fixed;
  left: 20%;
  bottom: 82px;
  text-align: left;
  z-index: 999;
  div {
    width: 190px;
  }
`;

const STutorialTooltipTextAreaHolder = styled.div`
  position: absolute;
  left: -140px;
  bottom: 94%;
  text-align: left;
  div {
    width: 190px;
  }
`;

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
  white-space: pre-wrap; ;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SPaymentTerms = styled(Text)`
  margin-top: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  text-align: center;
  white-space: pre-wrap;
`;
