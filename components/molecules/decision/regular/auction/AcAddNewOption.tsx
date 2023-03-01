import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import Link from 'next/link';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';
import { validateText } from '../../../../../api/endpoints/infrastructure';
import { placeBidOnAuction } from '../../../../../api/endpoints/auction';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import SuggestionTextArea from '../../../../atoms/decision/SuggestionTextArea';
import BidAmountTextInput from '../../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../../LoadingModal';
import PaymentModal from '../../../checkout/PaymentModal';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';

import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import { usePushNotifications } from '../../../../../contexts/pushNotificationsContext';
import Headline from '../../../../atoms/Headline';
import assets from '../../../../../constants/assets';
import { Mixpanel } from '../../../../../utils/mixpanel';
import PostTitleContent from '../../../../atoms/PostTitleContent';
import useStripeSetupIntent from '../../../../../utils/hooks/useStripeSetupIntent';
import getCustomerPaymentFee from '../../../../../utils/getCustomerPaymentFee';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';
import { useAppState } from '../../../../../contexts/appStateContext';

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
    case newnewapi.PlaceBidResponse.Status.OPTION_NOT_UNIQUE:
      return 'errors.optionNotUnique';
    default:
      return 'errors.requestFailed';
  }
};

interface IAcAddNewOption {
  postUuid: string;
  postShortId: string;
  postCreator: string;
  postText: string;
  postDeadline: string;
  postStatus: TPostStatusStringified;
  options: newnewapi.Auction.Option[];
  minAmount: number;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
}
// empty change
const AcAddNewOption: React.FunctionComponent<IAcAddNewOption> = ({
  postUuid,
  postShortId,
  postCreator,
  postText,
  postDeadline,
  postStatus,
  options,
  minAmount,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { appConstants } = useGetAppConstants();
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

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
  const [paymentSuccessValue, setPaymentSuccessValue] = useState<
    number | undefined
  >();

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
    if (isAPIValidateLoading) {
      return;
    }
    setPaymentModalOpen(true);
  };

  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateTextViaAPI = useCallback(async (text: string) => {
    setIsAPIValidateLoading(true);
    if (validateTextAbortControllerRef.current) {
      validateTextAbortControllerRef.current?.abort();
    }
    validateTextAbortControllerRef.current = new AbortController();
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(
        payload,
        validateTextAbortControllerRef?.current?.signal
      );

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
        postUuid,
        amount: new newnewapi.MoneyAmount({
          usdCents: paymentAmountInCents,
        }),
        customerFee: new newnewapi.MoneyAmount({
          usdCents: paymentFeeInCents,
        }),
        optionTitle: newBidText,
      }),
    [postUuid, paymentAmountInCents, newBidText, paymentFeeInCents]
  );

  const setupIntent = useStripeSetupIntent({
    purpose: placeBidRequest,
    isGuest: !user.loggedIn,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${
      postShortId || postUuid
    }`,
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

      Mixpanel.track('Pay With Card', {
        _stage: 'Post',
        _postUuid: postUuid,
        _component: 'AcOptionsTab',
        _paymentMethod: cardUuid ? 'Primary card' : 'New card',
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

        setPaymentSuccessValue(paymentAmountInCents);
        setNewBidAmount('');
        setNewBidText('');
        setSuggestNewMobileOpen(false);
        setPaymentModalOpen(false);
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [
      setupIntent,
      postUuid,
      router,
      handleAddOrUpdateOptionFromResponse,
      paymentAmountInCents,
      t,
      showErrorToastCustom,
    ]
  );

  useEffect(() => {
    if (!suggestNewMobileOpen) {
      setNewBidAmount('');
      setNewBidText('');
    }
  }, [suggestNewMobileOpen]);

  return (
    <>
      <SActionSection>
        <SuggestionTextArea
          id='text-input'
          value={newBidText}
          placeholder={t(
            'acPost.optionsTab.actionSection.suggestionPlaceholderDesktop',
            { username: postCreator }
          )}
          onChange={handleUpdateNewOptionText}
        />
        <BidAmountTextInput
          id='bid-input'
          value={newBidAmount}
          inputAlign='center'
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
                _postUuid: postUuid,
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
      {/* Suggest new Modal */}
      {isMobile && postStatus === 'voting' ? (
        <OptionActionMobileModal
          show={suggestNewMobileOpen}
          modalType={paymentModalOpen !== undefined ? 'covered' : 'initial'}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newBidText}
              autofocus={suggestNewMobileOpen}
              placeholder={t(
                'acPost.optionsTab.actionSection.suggestionPlaceholder'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign='left'
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
          modalType='following'
          zIndex={12}
          amount={paymentWithFeeInCents || 0}
          redirectUrl={`p/${postShortId || postUuid}`}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          setupIntent={setupIntent}
          bottomCaption={
            (!appConstants.minHoldAmount?.usdCents ||
              paymentWithFeeInCents > appConstants.minHoldAmount?.usdCents) && (
              <SPaymentSign variant='subtitle'>
                {t('acPost.paymentModalFooter.body', { creator: postCreator })}*
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
                      ? assets.common.ac.lightAcStatic
                      : assets.common.ac.darkAcStatic
                  }
                />
              </SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostCreator variant={3}>
                {t('acPost.paymentModalHeader.title', { creator: postCreator })}
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
        show={paymentSuccessValue !== undefined}
        value={paymentSuccessValue}
        modalType='following'
        closeModal={() => {
          setPaymentSuccessValue(undefined);
          promptUserWithPushNotificationsPermissionModal();
        }}
      >
        {t('paymentSuccessModal.ac', {
          postCreator,
          postDeadline,
        })}
      </PaymentSuccessModal>
    </>
  );
};

export default AcAddNewOption;

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

const STutorialTooltipTextAreaHolder = styled.div`
  position: absolute;
  left: -140px;
  bottom: 94%;
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
  display: inline-block;
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

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
