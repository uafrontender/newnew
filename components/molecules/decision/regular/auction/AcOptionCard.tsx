/* eslint-disable no-nested-ternary */
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';

import { useUserData } from '../../../../../contexts/userDataContext';
import { TAcOptionWithHighestField } from '../../../../../utils/hooks/useAcOptions';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import InlineSvg from '../../../../atoms/InlineSVG';
import BidAmountTextInput from '../../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../../LoadingModal';
import PaymentModal from '../../../checkout/PaymentModal';
import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import Headline from '../../../../atoms/Headline';
import OptionEllipseModal from '../../common/OptionEllipseModal';
import OptionEllipseMenu from '../../common/OptionEllipseMenu';
import ReportModal, { ReportData } from '../../../direct-messages/ReportModal';
import PostTitleContent from '../../../../atoms/PostTitleContent';
import AcConfirmDeleteOptionModal from '../../moderation/auction/AcConfirmDeleteOptionModal';
import OptionCardUsernameSpan from '../../common/OptionCardUsernameSpan';

// Utils
import { formatNumber } from '../../../../../utils/format';
import { Mixpanel } from '../../../../../utils/mixpanel';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { reportEventOption } from '../../../../../api/endpoints/report';
import {
  deleteAcOption,
  placeBidOnAuction,
} from '../../../../../api/endpoints/auction';
import useStripeSetupIntent from '../../../../../utils/hooks/useStripeSetupIntent';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import getCustomerPaymentFee from '../../../../../utils/getCustomerPaymentFee';
import { usePushNotifications } from '../../../../../contexts/pushNotificationsContext';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';

// Icons
import assets from '../../../../../constants/assets';
import BidIconLight from '../../../../../public/images/decision/bid-icon-light.png';
import BidIconDark from '../../../../../public/images/decision/bid-icon-dark.png';
import CancelIcon from '../../../../../public/images/svg/icons/outlined/Close.svg';
import MoreIcon from '../../../../../public/images/svg/icons/filled/More.svg';
import { useAppState } from '../../../../../contexts/appStateContext';
import DisplayName from '../../../../atoms/DisplayName';
import { useTutorialProgress } from '../../../../../contexts/tutorialProgressContext';

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

interface IAcOptionCard {
  id?: string;
  option: TAcOptionWithHighestField;
  votingAllowed: boolean;
  postUuid: string;
  postShortId: string;
  postCreator: newnewapi.IUser | null | undefined;
  postText: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleUpdateOptionFromResponse: (newOption: newnewapi.Auction.Option) => void;
  handleRemoveOption?: () => void;
  handleSetScrollBlocked?: () => void;
  handleUnsetScrollBlocked?: () => void;
  handleScrollIntoListView?: (element: HTMLElement) => void;
}

const AcOptionCard: React.FunctionComponent<IAcOptionCard> = ({
  id,
  option,
  votingAllowed,
  postUuid,
  postShortId,
  postCreator,
  postText,
  index,
  optionBeingSupported,
  minAmount,
  handleSetSupportedBid,
  handleUpdateOptionFromResponse,
  handleRemoveOption,
  handleSetScrollBlocked,
  handleUnsetScrollBlocked,
  handleScrollIntoListView,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const { resizeMode, userLoggedIn } = useAppState();
  const { userData } = useUserData();
  const { userTutorialsProgress, setUserTutorialsProgress } =
    useTutorialProgress();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { appConstants } = useGetAppConstants();
  const { showErrorToastPredefined } = useErrorToasts();
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const containerRef = useRef<HTMLDivElement>();

  // const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const isSupportedByMe = useMemo(
    () => option.isSupportedByMe,
    [option.isSupportedByMe]
  );
  const isMyBid = useMemo(
    () => !!option.creator?.uuid && option.creator?.uuid === userData?.userUuid,
    [option.creator?.uuid, userData?.userUuid]
  );
  const isBlue = useMemo(
    () => isSupportedByMe || isMyBid,
    [isSupportedByMe, isMyBid]
  );

  // Ellipse menu
  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);
  const [optionMenuX, setOptionMenuXY] = useState({
    x: 0,
    y: 0,
  });

  // Report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      await reportEventOption(option.id, reasons, message);
      setIsReportModalOpen(false);
    },
    [option.id]
  );

  const handleOpenReportForm = useCallback(() => {
    if (!userLoggedIn) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setIsReportModalOpen(true);
  }, [userLoggedIn, router]);

  const handleReportClose = useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  // Remove modal
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const handleRemoveSubmit = useCallback(async () => {
    try {
      const payload = new newnewapi.DeleteAcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteAcOption(payload);

      if (!res.error) {
        setIsRemoveModalOpen(false);
        handleRemoveOption?.();
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  }, [handleRemoveOption, option.id, showErrorToastPredefined]);

  const handleOpenRemoveForm = useCallback(() => {
    setIsRemoveModalOpen(true);
  }, []);

  const handleRemoveClose = useCallback(() => {
    setIsRemoveModalOpen(false);
  }, []);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled =
    optionBeingSupported !== '' &&
    optionBeingSupported !== option.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(option.id.toString());

    // Have to execute in a microtask to allow rendering take place first
    setTimeout(() => {
      if (handleScrollIntoListView && containerRef.current) {
        handleScrollIntoListView(containerRef.current);
      }
    }, 0);
  };

  const handleCloseSupportForm = useCallback(() => {
    Mixpanel.track('Close Support Option Form', {
      _stage: 'Post',
      _component: 'AcOptionCard',
    });
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  }, [handleSetSupportedBid]);

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessValue, setPaymentSuccessValue] = useState<
    number | undefined
  >();

  // Handlers
  const handleClickOptionBodyOpenEllipseMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      Mixpanel.track('Click Option Body Open Ellipse Menu', {
        _stage: 'Post',
        _postUuid: postUuid,
        _optionId: option?.id,
        _component: 'AcOptionCard',
      });
      if (!isMobile && !isEllipseMenuOpen && !disabled && !isSupportFormOpen) {
        setIsEllipseMenuOpen(true);
        handleSetScrollBlocked?.();

        setOptionMenuXY({
          x: e.clientX,
          y: e.clientY,
        });
      }
    },
    [
      disabled,
      handleSetScrollBlocked,
      isEllipseMenuOpen,
      isMobile,
      isSupportFormOpen,
      option?.id,
      postUuid,
    ]
  );

  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const paymentAmountInCents = useMemo(
    () => parseInt(supportBidAmount) * 100,
    [supportBidAmount]
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
        optionId: option.id,
      }),
    [postUuid, paymentAmountInCents, option.id, paymentFeeInCents]
  );

  const setupIntent = useStripeSetupIntent({
    purpose: placeBidRequest,
    isGuest: !userLoggedIn,
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
        _component: 'AcOptionsCard',
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
          !res?.data ||
          res.error ||
          res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        ) {
          throw new Error(
            res?.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        const optionFromResponse = (res.data
          .option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleUpdateOptionFromResponse(optionFromResponse);

        setPaymentSuccessValue(paymentAmountInCents);
        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportFormOpen(false);
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
      handleUpdateOptionFromResponse,
      paymentAmountInCents,
      handleSetSupportedBid,
      t,
      showErrorToastCustom,
    ]
  );

  // eslint-disable-next-line consistent-return
  const goToNextStep = () => {
    if (
      userTutorialsProgress?.remainingAcSteps &&
      userTutorialsProgress.remainingAcSteps[0]
    ) {
      if (userLoggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          acCurrentStep: userTutorialsProgress.remainingAcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }

      setUserTutorialsProgress({
        remainingAcSteps: [...userTutorialsProgress.remainingAcSteps].slice(1),
      });
    }
  };

  useEffect(() => {
    if (!isSupportFormOpen) {
      setSupportBidAmount('');
    }
  }, [isSupportFormOpen]);

  return (
    <div
      key={option.id.toString()}
      ref={(el) => {
        if (el) {
          containerRef.current = el;
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '16px',
        ...(!isMobile && isSupportFormOpen
          ? {
              gap: '16px',
            }
          : {}),
      }}
    >
      <SContainer
        $isDisabled={disabled && votingAllowed}
        $isBlue={isBlue}
        onClick={(e) => handleClickOptionBodyOpenEllipseMenu(e)}
      >
        {isMobile && (
          <SEllipseButtonMobile
            onClickCapture={() => {
              Mixpanel.track('Click Option Ellipse Button Open Ellipse Modal', {
                _stage: 'Post',
                _postUuid: postUuid,
                _optionId: option?.id,
                _component: 'AcOptionCard',
              });
            }}
            onClick={() => setIsEllipseMenuOpen(true)}
          >
            <InlineSvg
              svg={MoreIcon}
              width='16px'
              height='16px'
              fill={isBlue ? '#FFFFFF' : theme.colorsThemed.text.primary}
            />
          </SEllipseButtonMobile>
        )}
        <SBidDetails
          isBlue={isBlue}
          active={!!optionBeingSupported && !disabled}
          noAction={!votingAllowed}
        >
          <SBidAmount isWhite={isSupportedByMe || isMyBid}>
            <OptionActionIcon
              src={theme.name === 'light' ? BidIconLight.src : BidIconDark.src}
            />
            <div>
              {option.totalAmount?.usdCents
                ? `$${formatNumber(
                    option.totalAmount.usdCents / 100 ?? 0,
                    true
                  )}`
                : '$0'}
            </div>
          </SBidAmount>
          <SOptionInfo isWhite={isSupportedByMe || isMyBid} variant={3}>
            {option.title}
          </SOptionInfo>
          <SBiddersInfo onClick={(e) => e.preventDefault()} variant={3}>
            {/* TODO: add logic that accepts option and returns users (me) to show */}
            {!option.whitelistSupporter ||
            option.whitelistSupporter?.uuid === userData?.userUuid ? (
              isMyBid ? (
                <OptionCardUsernameSpan
                  user={option.supporterCount > 1 ? t('me') : t('my')}
                  isBlue={isBlue}
                />
              ) : (
                <OptionCardUsernameSpan
                  user={option.creator!!}
                  isBlue={isBlue}
                />
              )
            ) : (
              <OptionCardUsernameSpan
                user={option.whitelistSupporter}
                isBlue={isBlue}
              />
            )}
            {(isSupportedByMe && !isMyBid) ||
            (isSupportedByMe &&
              !!option.whitelistSupporter &&
              option.whitelistSupporter?.uuid !== userData?.userUuid) ? (
              <OptionCardUsernameSpan user={`, ${t('me')}`} isBlue={isBlue} />
            ) : null}
            {option.supporterCount >
            ((isSupportedByMe && !isMyBid) ||
            (isSupportedByMe && isMyBid && option.whitelistSupporter)
              ? 2
              : 1) ? (
              <>
                <SSpanBiddersRegular className='spanRegular'>{` & `}</SSpanBiddersRegular>
                <SSpanBiddersHighlighted className='spanHighlighted'>
                  {formatNumber(
                    option.supporterCount -
                      ((isSupportedByMe && !isMyBid) ||
                      (isSupportedByMe && isMyBid && option.whitelistSupporter)
                        ? 2
                        : 1),
                    true
                  )}{' '}
                  {option.supporterCount -
                    ((isSupportedByMe && !isMyBid) ||
                    (isSupportedByMe && isMyBid && option.whitelistSupporter)
                      ? 2
                      : 1) >
                  1
                    ? t('acPost.optionsTab.optionCard.others')
                    : t('acPost.optionsTab.optionCard.other')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}
            <SSpanBiddersRegular className='spanRegular'>
              {' '}
              {t('acPost.optionsTab.optionCard.bid')}
            </SSpanBiddersRegular>
          </SBiddersInfo>
        </SBidDetails>
        {(optionBeingSupported && !disabled) ||
        !votingAllowed ? null : isMobile ? (
          <SSupportButton
            view='quaternary'
            disabled={disabled}
            isBlue={isBlue}
            onClickCapture={() => {
              Mixpanel.track('Boost Click', {
                _stage: 'Post',
                _postUuid: postUuid,
                _component: 'AcOptionCard',
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSupportForm();
            }}
          >
            <div>
              {!isSupportedByMe
                ? t('acPost.optionsTab.optionCard.raiseBidButton')
                : t('acPost.optionsTab.optionCard.supportAgainButton')}
            </div>
          </SSupportButton>
        ) : (
          <SSupportButtonDesktop
            id={`${id}-support`}
            view='secondary'
            disabled={disabled}
            isBlue={isBlue}
            onClickCapture={() => {
              Mixpanel.track('Boost Click', {
                _stage: 'Post',
                _postUuid: postUuid,
                _component: 'AcOptionCard',
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSupportForm();
            }}
          >
            {!isSupportedByMe
              ? t('acPost.optionsTab.optionCard.supportButton')
              : t('acPost.optionsTab.optionCard.supportAgainButton')}
          </SSupportButtonDesktop>
        )}
        {index === 0 &&
          !isMyBid &&
          userTutorialsProgress?.remainingAcSteps &&
          votingAllowed && (
            <STutorialTooltipHolder>
              <TutorialTooltip
                isTooltipVisible={
                  userTutorialsProgress.remainingAcSteps[0] ===
                  newnewapi.AcTutorialStep.AC_BOOST_BID
                }
                closeTooltip={goToNextStep}
                title={t('tutorials.ac.supportPeopleBids.title')}
                text={t('tutorials.ac.supportPeopleBids.text')}
                dotPosition={
                  isMobile
                    ? DotPositionEnum.BottomLeft
                    : DotPositionEnum.TopRight
                }
              />
            </STutorialTooltipHolder>
          )}
      </SContainer>
      <SSupportBidForm>
        {!isMobile && isSupportFormOpen && (
          <>
            <SBidAmountTextInput
              id={`${id}-amount`}
              value={supportBidAmount}
              inputAlign='left'
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
              placeholder={t(
                'acPost.optionsTab.actionSection.amountPlaceholderBoost',
                { amount: minAmount.toString() }
              )}
              style={{
                padding: '12.5px 16px',
              }}
            />
            <Button
              id={`${id}-submit`}
              view='primaryGrad'
              disabled={
                !supportBidAmount
                  ? true
                  : parseInt(supportBidAmount) < minAmount
              }
              onClickCapture={() => {
                Mixpanel.track('Open Payment Form', {
                  _stage: 'Post',
                  _component: 'AcOptionCard',
                });
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('acPost.optionsTab.optionCard.raiseBidButton')}
            </Button>
            <SCancelButton
              view='transparent'
              iconOnly
              onClickCapture={() => {
                Mixpanel.track('Close Support Option Form', {
                  _stage: 'Post',
                  _component: 'AcOptionCard',
                });
              }}
              onClick={() => handleCloseSupportForm()}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCancelButton>
          </>
        )}
        {isMobile ? (
          <OptionActionMobileModal
            show={isSupportFormOpen}
            onClose={() => handleCloseSupportForm()}
            zIndex={12}
          >
            <SSuggestSupportMobileContainer>
              <div>{option.title}</div>
              <BidAmountTextInput
                value={supportBidAmount}
                inputAlign='left'
                autofocus={isSupportFormOpen}
                minAmount={minAmount}
                style={{
                  textAlign: 'center',
                  paddingLeft: '12px',
                }}
                onChange={(newValue: string) => setSupportBidAmount(newValue)}
              />
              <Button
                view='primaryGrad'
                size='sm'
                disabled={!supportBidAmount}
                onClickCapture={() => {
                  Mixpanel.track('Submit Boost', {
                    _stage: 'Post',
                    _component: 'AcOptionCard',
                  });
                }}
                onClick={() => handleTogglePaymentModalOpen()}
              >
                {t('acPost.optionsTab.optionCard.raiseBidButton')}
              </Button>
            </SSuggestSupportMobileContainer>
          </OptionActionMobileModal>
        ) : null}
      </SSupportBidForm>
      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={paymentWithFeeInCents || 0}
          setupIntent={setupIntent}
          redirectUrl={`p/${postShortId || postUuid}`}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          bottomCaption={
            (!appConstants.minHoldAmount?.usdCents ||
              paymentWithFeeInCents > appConstants.minHoldAmount?.usdCents) && (
              <SPaymentSign variant='subtitle'>
                <Trans
                  t={t}
                  i18nKey='acPost.paymentModalFooter.body'
                  components={[<DisplayName user={postCreator} />]}
                />
                {' *'}
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
                <Trans
                  t={t}
                  i18nKey='acPost.paymentModalHeader.title'
                  components={[
                    <DisplayName
                      user={postCreator}
                      suffix={t('acPost.paymentModalHeader.suffix')}
                    />,
                  ]}
                />
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalPostText variant={2}>
              <PostTitleContent>{postText}</PostTitleContent>
            </SPaymentModalPostText>
            <SPaymentModalTitle variant='subtitle'>
              {t('acPost.paymentModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText variant={5}>
              {option.title}
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      )}
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
        <Trans
          t={t}
          i18nKey='paymentSuccessModal.ac'
          components={[<SDisplayName user={postCreator} />]}
        />
      </PaymentSuccessModal>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Ellipse modal */}
      {isMobile && (
        <OptionEllipseModal
          zIndex={12}
          isOpen={isEllipseMenuOpen}
          isMyOption={isMyBid}
          optionType='ac'
          optionId={option.id as number}
          optionCreatorUuid={option.creator?.uuid ?? ''}
          onClose={() => {
            setIsEllipseMenuOpen(false);
            handleUnsetScrollBlocked?.();
          }}
          handleOpenReportOptionModal={() => handleOpenReportForm()}
          handleOpenRemoveOptionModal={() => handleOpenRemoveForm()}
        />
      )}
      {!isMobile && (
        <OptionEllipseMenu
          xy={optionMenuX}
          isVisible={isEllipseMenuOpen}
          isMyOption={isMyBid}
          optionType='ac'
          optionId={option.id as number}
          optionCreatorUuid={option.creator?.uuid ?? ''}
          handleClose={() => {
            setIsEllipseMenuOpen(false);
            handleUnsetScrollBlocked?.();
          }}
          handleOpenReportOptionModal={() => handleOpenReportForm()}
          handleOpenRemoveOptionModal={() => handleOpenRemoveForm()}
        />
      )}
      {/* Report modal */}
      {option.creator && (
        <ReportModal
          show={isReportModalOpen}
          reportedUser={option.creator}
          onSubmit={handleReportSubmit}
          onClose={handleReportClose}
        />
      )}
      {/* Delete option modal */}
      <AcConfirmDeleteOptionModal
        isVisible={isRemoveModalOpen}
        closeModal={handleRemoveClose}
        handleConfirmDelete={handleRemoveSubmit}
      />
    </div>
  );
};

AcOptionCard.defaultProps = {
  optionBeingSupported: undefined,
  handleRemoveOption: undefined,
};

export default AcOptionCard;

const SContainer = styled.div<{
  $isDisabled: boolean;
  $isBlue: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme, $isBlue }) =>
    $isBlue
      ? theme.colorsThemed.accent.blue
      : theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0px;

    padding: initial;
    background-color: initial;
    border-radius: initial;
  }
`;

const SBidDetails = styled.div<{
  isBlue: boolean;
  active: boolean;
  noAction: boolean;
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ isBlue }) =>
    isBlue
      ? css`
          .spanRegular {
            color: #ffffff;
            opacity: 0.6;
          }
          .spanHighlighted {
            color: #ffffff;
          }
        `
      : null}

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'amount bidders'
      'optionInfo optionInfo';
    grid-template-columns: 5fr 6fr;

    padding: 16px;

    background-color: ${({ theme, isBlue }) =>
      isBlue
        ? theme.colorsThemed.accent.blue
        : theme.colorsThemed.background.tertiary};

    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};

    ${({ active, noAction }) =>
      active || noAction
        ? css`
            border-top-right-radius: ${({ theme }) =>
              theme.borderRadius.medium};
            border-bottom-right-radius: ${({ theme }) =>
              theme.borderRadius.medium};
          `
        : null}
  }
`;

const SBidAmount = styled.div<{
  isWhite: boolean;
}>`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  margin-bottom: 8px;

  font-weight: 700;
  font-size: 16px;
  line-height: 24px;

  ${({ isWhite }) =>
    isWhite
      ? css`
          color: #ffffff;
        `
      : null};
`;

const OptionActionIcon = styled.img`
  height: 24px;
  width: 24px;
`;

const SOptionInfo = styled(Text)<{
  isWhite: boolean;
}>`
  grid-area: optionInfo;

  margin-bottom: 8px;

  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  word-break: break-word;

  ${({ isWhite }) =>
    isWhite
      ? css`
          color: #ffffff;
        `
      : null};

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  max-width: 100%;

  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  white-space: pre;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
    padding-top: 4px;

    text-align: right;
  }
`;

const SSpanBiddersHighlighted = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpanBiddersRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SSupportButton = styled(Button)<{
  isBlue: boolean;
}>`
  width: 100%;

  border-radius: 12px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  background: ${({ theme }) => theme.colorsThemed.accent.blue};
  color: #ffffff;

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    color: ${({ theme }) => theme.colors.dark};
    background: #ffffff;
  }

  ${({ isBlue }) =>
    isBlue
      ? css`
          color: ${({ theme }) => theme.colors.dark};
          background: #ffffff;
        `
      : null}
`;

const SSupportButtonDesktop = styled(Button)<{
  isBlue: boolean;
}>`
  flex-shrink: 0;
  height: 100%;
  width: auto;
  min-width: 60px;

  color: #ffffff;
  background: ${({ theme }) => theme.colorsThemed.accent.blue};

  padding: 8px;

  border-radius: initial;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};

  span {
    width: auto;

    text-align: center;
    white-space: pre;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
  }

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    color: ${({ theme }) => theme.colors.dark};
    background: #ffffff;
  }

  ${({ isBlue }) =>
    isBlue
      ? css`
          border-left: ${({ theme }) => theme.colorsThemed.background.primary}
            1.5px solid;
        `
      : null}
`;

const SSupportBidForm = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  width: 100%;
`;

const SBidAmountTextInput = styled(BidAmountTextInput)`
  display: flex;
  width: 100%;
  flex-grow: 1;
  input {
    width: 100%;
  }
`;

const SCancelButton = styled(Button)`
  width: 48px;
  height: 48px;

  padding: 0px;

  flex-shrink: 0;

  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.background.primary};
  }
`;

const SSuggestSupportMobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;
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
  flex-shrink: 0;
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
  display: flex;
  flex-shrink: 1;
  overflow: hidden;
  flex-direction: row;
  align-items: center;
  white-space: pre;

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

  word-break: break-word;
`;

// Tutorial
const STutorialTooltipHolder = styled.div`
  position: absolute;
  right: 35px;
  top: 0;
  text-align: left;
  ${({ theme }) => theme.media.tablet} {
    right: 35px;
    top: 25px;
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

const SEllipseButtonMobile = styled(Button)`
  position: absolute;
  right: 16px;

  background: transparent;
  padding: 0;
  z-index: 1;

  &:hover:enabled,
  &:focus:enabled {
    background: transparent;
    box-shadow: none;
  }
`;

const SDisplayName = styled(DisplayName)`
  max-width: 100%;
`;
