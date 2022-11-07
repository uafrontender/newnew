/* eslint-disable no-unsafe-optional-chaining */
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
import { useInView } from 'react-intersection-observer';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import Link from 'next/link';
import { toast } from 'react-toastify';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';
import { validateText } from '../../../../../api/endpoints/infrastructure';
import { placeBidOnAuction } from '../../../../../api/endpoints/auction';

import { TAcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewAC';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import AcOptionCard from './AcOptionCard';
import SuggestionTextArea from '../../../../atoms/decision/SuggestionTextArea';
import BidAmountTextInput from '../../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../../LoadingModal';
import PaymentModal from '../../../checkout/PaymentModal';
import GradientMask from '../../../../atoms/GradientMask';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';

import NoContentYetImg from '../../../../../public/images/decision/no-content-yet-mock.png';
import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import Headline from '../../../../atoms/Headline';
import assets from '../../../../../constants/assets';
import { Mixpanel } from '../../../../../utils/mixpanel';
import PostTitleContent from '../../../../atoms/PostTitleContent';
import useStripeSetupIntent from '../../../../../utils/hooks/useStripeSetupIntent';
import getCustomerPaymentFee from '../../../../../utils/getCustomerPaymentFee';
import { usePushNotifications } from '../../../../../contexts/pushNotificationsContext';

const getPayWithCardErrorMessage = (
  status?: newnewapi.PlaceBidResponse.Status
) => {
  switch (status) {
    case newnewapi.PlaceBidResponse.Status.NOT_ENOUGH_MONEY:
      return 'errors.notEnoughMoney';
    case newnewapi.PlaceBidResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.PlaceBidResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.PlaceBidResponse.Status.BIDDING_NOT_STARTED:
      return 'errors.biddingNotStarted';
    case newnewapi.PlaceBidResponse.Status.BIDDING_ENDED:
      return 'errors.biddingIsEnded';
    default:
      return 'errors.requestFailed';
  }
};

interface IAcOptionsTab {
  postId: string;
  postCreatorName: string;
  postText: string;
  postDeadline: string;
  postStatus: TPostStatusStringified;
  options: newnewapi.Auction.Option[];
  // optionToAnimate?: string;
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
  handleRemoveOption: (optionToRemove: newnewapi.Auction.Option) => void;
}

const AcOptionsTab: React.FunctionComponent<IAcOptionsTab> = ({
  postId,
  postCreatorName,
  postText,
  postDeadline,
  postStatus,
  options,
  // optionToAnimate,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
  handleAddOrUpdateOptionFromResponse,
  handleRemoveOption,
}) => {
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isTablet = ['tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const { appConstants } = useGetAppConstants();

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const [heightDelta, setHeightDelta] = useState(
    postStatus === 'voting' ? 56 : 0
  );
  const gradientMaskBottomPosition = useMemo(
    () => (isTablet ? heightDelta - 12 : heightDelta),
    [heightDelta, isTablet]
  );

  const actionSectionContainer = useRef<HTMLDivElement>();

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // New option/bid
  const [newBidText, setNewBidText] = useState('');
  const [newBidTextValid, setNewBidTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [newBidAmount, setNewBidAmount] = useState('');
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  const goToNextStep = (currentStep: newnewapi.AcTutorialStep) => {
    if (user.userTutorialsProgress.remainingAcSteps && currentStep) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          acCurrentStep: currentStep,
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingAcSteps: [
            ...user.userTutorialsProgress.remainingAcSteps,
          ].filter((el) => el !== currentStep),
        })
      );
    }
  };

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    if (isAPIValidateLoading) return;
    setPaymentModalOpen(true);
  };

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

  const validateTextViaAPIDebounced = useMemo(
    () =>
      debounce((text: string) => {
        validateTextViaAPI(text);
      }, 250),
    [validateTextViaAPI]
  );

  const handleUpdateNewOptionText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewBidText(e.target.value.trim() ? e.target.value : '');

      if (e.target.value.length > 0) {
        validateTextViaAPIDebounced(e.target.value);
      }
    },
    [setNewBidText, validateTextViaAPIDebounced]
  );

  const paymentAmountInCents = useMemo(
    () => parseInt(newBidAmount) * 100,
    [newBidAmount]
  );

  const paymentFeeInCents = useMemo(
    () =>
      getCustomerPaymentFee(
        paymentAmountInCents,
        parseFloat(appConstants.customerFee)
      ),
    [paymentAmountInCents, appConstants.customerFee]
  );

  const paymentWithFeeInCents = useMemo(
    () => paymentAmountInCents + paymentFeeInCents,
    [paymentAmountInCents, paymentFeeInCents]
  );

  const placeBidRequest = useMemo(
    () =>
      new newnewapi.PlaceBidRequest({
        postUuid: postId,
        amount: new newnewapi.MoneyAmount({
          usdCents: paymentAmountInCents,
        }),
        customerFee: new newnewapi.MoneyAmount({
          usdCents: paymentFeeInCents,
        }),
        optionTitle: newBidText,
      }),
    [postId, paymentAmountInCents, newBidText, paymentFeeInCents]
  );

  const setupIntent = useStripeSetupIntent({
    purpose: placeBidRequest,
    isGuest: !user.loggedIn,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`,
  });

  const handlePayWithCard = useCallback(
    async ({
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      saveCard?: boolean;
    }) => {
      setLoadingModalOpen(true);

      if (setupIntent.isGuest) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${setupIntent.setupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('PayWithCard', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'AcOptionsTab',
      });

      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        const res = await placeBidOnAuction(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        const optionFromResponse = (res.data
          .option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        setPaymentSuccessModalOpen(true);
        setNewBidAmount('');
        setNewBidText('');
        setSuggestNewMobileOpen(false);
        setPaymentModalOpen(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [postId, handleAddOrUpdateOptionFromResponse, setupIntent, router, t]
  );

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  useEffect(() => {
    if (optionBeingSupported && containerRef.current && !isMobile) {
      let optIdx = options.findIndex(
        (o) => o.id.toString() === optionBeingSupported
      );
      optIdx += 2;
      const childDiv = containerRef.current.children[optIdx];

      const childRect = childDiv.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();

      const scrollBy = childRect.top - parentRect.top;

      containerRef.current.scrollBy({
        top: scrollBy,
      });
    }
  }, [options, optionBeingSupported, isMobile]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry: any) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize
        : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (actionSectionContainer.current) {
      resizeObserver.observe(actionSectionContainer.current!!);
    }

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <STabContainer
        key='bids'
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {options.length === 0 && !optionsLoading && postStatus !== 'failed' ? (
          <SNoOptionsYet>
            <SNoOptionsImgContainer>
              <img src={NoContentYetImg.src} alt='No content yet' />
            </SNoOptionsImgContainer>
            <SNoOptionsCaption variant={3}>
              {t('acPost.optionsTab.noOptions.caption_1')}
            </SNoOptionsCaption>
            <SNoOptionsCaption variant={3}>
              {t('acPost.optionsTab.noOptions.caption_2')}
            </SNoOptionsCaption>
          </SNoOptionsYet>
        ) : null}
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
                positionBottom={gradientMaskBottomPosition}
                active={showBottomGradient}
              />
            </>
          ) : null}
          {options.map((option, i) => (
            <AcOptionCard
              key={option.id.toString()}
              option={option as TAcOptionWithHighestField}
              // shouldAnimate={optionToAnimate === option.id.toString()}
              postId={postId}
              postCreatorName={postCreatorName}
              postDeadline={postDeadline}
              postText={postText}
              index={i}
              minAmount={parseInt((appConstants.minAcBid / 100).toFixed(0))}
              votingAllowed={postStatus === 'voting'}
              optionBeingSupported={optionBeingSupported}
              handleSetSupportedBid={(id: string) =>
                setOptionBeingSupported(id)
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
              handleRemoveOption={() => {
                Mixpanel.track('Removed Option', {
                  _stage: 'Post',
                  _postUuid: postId,
                  _component: 'AcOptionsTab',
                });
                handleRemoveOption(option);
              }}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : pagingToken ? (
            <SLoadMoreBtn
              view='secondary'
              onClick={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: postId,
                  _component: 'AcOptionsTab',
                });
                handleLoadBids(pagingToken);
              }}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
          ) : null}
        </SBidsContainer>
        {postStatus === 'voting' && (
          <SActionSection
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
          >
            <SuggestionTextArea
              id='text-input'
              value={newBidText}
              disabled={optionBeingSupported !== ''}
              placeholder={t(
                'acPost.optionsTab.actionSection.suggestionPlaceholderDesktop',
                { username: postCreatorName }
              )}
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              id='bid-input'
              value={newBidAmount}
              inputAlign='center'
              disabled={optionBeingSupported !== ''}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
              placeholder={t(
                'acPost.optionsTab.actionSection.amountPlaceholderDesktop',
                { amount: minAmount.toString() }
              )}
              style={{
                width: '60px',
              }}
            />
            <Button
              id='submit'
              view='primaryGrad'
              size='sm'
              disabled={
                !newBidText ||
                !newBidAmount ||
                parseInt(newBidAmount) < minAmount ||
                optionBeingSupported !== '' ||
                !newBidTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClickCapture={() => {
                Mixpanel.track('Place Bid', {
                  _stage: 'Post',
                  _component: 'AcOptionsTab',
                });
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('acPost.optionsTab.actionSection.placeABidButton')}
            </Button>
            {user?.userTutorialsProgress.remainingAcSteps && (
              <STutorialTooltipTextAreaHolder>
                <TutorialTooltip
                  isTooltipVisible={
                    options.length > 0
                      ? user.userTutorialsProgress.remainingAcSteps[0] ===
                        newnewapi.AcTutorialStep.AC_TEXT_FIELD
                      : user.userTutorialsProgress.remainingAcSteps.includes(
                          newnewapi.AcTutorialStep.AC_TEXT_FIELD
                        ) &&
                        !user.userTutorialsProgress.remainingAcSteps.includes(
                          newnewapi.AcTutorialStep.AC_TIMER
                        )
                  }
                  closeTooltip={() =>
                    goToNextStep(newnewapi.AcTutorialStep.AC_TEXT_FIELD)
                  }
                  title={t('tutorials.ac.createYourBid.title')}
                  text={t('tutorials.ac.createYourBid.text')}
                  dotPosition={DotPositionEnum.BottomRight}
                />
              </STutorialTooltipTextAreaHolder>
            )}
          </SActionSection>
        )}
        {user?.userTutorialsProgress.remainingAcSteps && (
          <STutorialTooltipHolder>
            <TutorialTooltip
              isTooltipVisible={
                options.length > 0 &&
                user.userTutorialsProgress.remainingAcSteps[0] ===
                  newnewapi.AcTutorialStep.AC_ALL_BIDS
              }
              closeTooltip={() =>
                goToNextStep(newnewapi.AcTutorialStep.AC_ALL_BIDS)
              }
              title={t('tutorials.ac.peopleBids.title')}
              text={t('tutorials.ac.peopleBids.text')}
              dotPosition={DotPositionEnum.BottomLeft}
            />
          </STutorialTooltipHolder>
        )}
      </STabContainer>
      {/* Suggest new Modal */}
      {isMobile && postStatus === 'voting' ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newBidText}
              disabled={optionBeingSupported !== ''}
              autofocus={suggestNewMobileOpen}
              placeholder={t(
                'acPost.optionsTab.actionSection.suggestionPlaceholder'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign='left'
              disabled={optionBeingSupported !== ''}
              style={{
                textAlign: 'center',
                paddingLeft: '12px',
              }}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view='primaryGrad'
              size='sm'
              disabled={
                !newBidText ||
                !newBidAmount ||
                parseInt(newBidAmount) < minAmount ||
                optionBeingSupported !== '' ||
                !newBidTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClickCapture={() => {
                Mixpanel.track('Place Bid', {
                  _stage: 'Post',
                  _component: 'AcOptionsTab',
                });
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('acPost.optionsTab.actionSection.placeABidButton')}
            </Button>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={paymentWithFeeInCents || 0}
          redirectUrl={`post/${postId}`}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          setupIntent={setupIntent}
          bottomCaption={
            (!appConstants.minHoldAmount?.usdCents ||
              paymentWithFeeInCents > appConstants.minHoldAmount?.usdCents) && (
              <SPaymentSign variant='subtitle'>
                {t('acPost.paymentModalFooter.body', {
                  creator: postCreatorName,
                })}
                *
                <Link href='https://terms.newnew.co'>
                  <SPaymentTermsLink
                    href='https://terms.newnew.co'
                    target='_blank'
                  >
                    {t('acPost.paymentModalFooter.terms')}
                  </SPaymentTermsLink>
                </Link>{' '}
                {t('acPost.paymentModalFooter.apply')}
              </SPaymentSign>
            )
          }
        >
          <SPaymentModalHeader>
            <SPaymentModalHeading>
              <SPaymentModalHeadingPostSymbol>
                <SPaymentModalHeadingPostSymbolImg
                  src={
                    theme.name === 'light'
                      ? assets.creation.lightAcStatic
                      : assets.creation.darkAcStatic
                  }
                />
              </SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostCreator variant={3}>
                {t('acPost.paymentModalHeader.title', {
                  creator: postCreatorName,
                })}
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalPostText variant={2}>
              <PostTitleContent>{postText}</PostTitleContent>
            </SPaymentModalPostText>
            <SPaymentModalTitle variant='subtitle'>
              {t('acPost.paymentModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText variant={5}>
              {newBidText}
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='ac'
        isVisible={paymentSuccessModalOpen}
        closeModal={() => {
          setPaymentSuccessModalOpen(false);
          promptUserWithPushNotificationsPermissionModal();
        }}
      >
        {t('paymentSuccessModal.ac', {
          postCreator: postCreatorName,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile && !suggestNewMobileOpen && postStatus === 'voting' ? (
        <>
          <SActionButton
            id='action-button-mobile'
            view='primaryGrad'
            onClick={() => setSuggestNewMobileOpen(true)}
            onClickCapture={() =>
              Mixpanel.track('SuggestNewMobile', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'AcOptionsTab',
              })
            }
          >
            {t('acPost.floatingActionButton.suggestNewButton')}
          </SActionButton>
          {user?.userTutorialsProgress.remainingAcSteps && (
            <STutorialTooltipHolderMobile>
              <TutorialTooltip
                isTooltipVisible={
                  options.length > 0 &&
                  user.userTutorialsProgress.remainingAcSteps[0] ===
                    newnewapi.AcTutorialStep.AC_TEXT_FIELD
                }
                closeTooltip={() =>
                  goToNextStep(newnewapi.AcTutorialStep.AC_TEXT_FIELD)
                }
                title={t('tutorials.ac.createYourBid.title')}
                text={t('tutorials.ac.createYourBid.text')}
                dotPosition={DotPositionEnum.BottomRight}
              />
            </STutorialTooltipHolderMobile>
          )}
        </>
      ) : null}
    </>
  );
};

AcOptionsTab.defaultProps = {
  // optionToAnimate: undefined,
};

export default AcOptionsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 56px);
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
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px + 10px)`};
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

  ${({ theme }) => theme.media.laptop} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
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
  position: relative;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    min-height: 50px;
    width: 100%;
    z-index: 5;

    padding-top: 16px;

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary};

    border-top: 1.5px solid
      ${({ theme }) => theme.colorsThemed.background.outlines1};

    textarea {
      width: calc(80% - 8px) !important;
    }

    div {
      width: 20%;

      input {
        width: 100% !important;
      }
    }

    button {
      width: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    /* flex-wrap: nowrap; */
    /* justify-content: initial; */

    textarea {
      /* width: 277px; */
    }
  }
`;

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

  position: relative;
  top: -3px;
  left: 2px;
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
  white-space: pre-wrap;
  word-break: break-word;

  margin-bottom: 24px;
`;

const SPaymentModalTitle = styled(Text)`
  margin-bottom: 8px;
`;

const SPaymentModalOptionText = styled(Headline)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// No options yet
const SNoOptionsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 300px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
  }

  ${({ theme }) => theme.media.laptop} {
    min-height: 400px;
  }
`;

const SNoOptionsImgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;
`;

const SNoOptionsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 60px;
  bottom: 90%;
  text-align: left;
  div {
    width: 190px;
  }
  ${({ theme }) => theme.media.tablet} {
    bottom: 97%;
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

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
