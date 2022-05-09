/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  // useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
// import { WalletContext } from '../../../../contexts/walletContext';
// import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import {
  createPaymentSession,
  // getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';
import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import PaymentSuccessModal from '../PaymentSuccessModal';
import OptionActionMobileModal from '../OptionActionMobileModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';

import { formatNumber } from '../../../../utils/format';

// Icons
import AcIcon from '../../../../public/images/creation/AC-static.png';
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import getDisplayname from '../../../../utils/getDisplayname';

interface IAcOptionCard {
  option: TAcOptionWithHighestField;
  // shouldAnimate: boolean;
  votingAllowed: boolean;
  postId: string;
  postCreator: string;
  postDeadline: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
}

const AcOptionCard: React.FunctionComponent<IAcOptionCard> = ({
  option,
  // shouldAnimate,
  votingAllowed,
  postId,
  postCreator,
  postDeadline,
  index,
  optionBeingSupported,
  minAmount,
  handleSetSupportedBid,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // const { walletBalance } = useContext(WalletContext);

  // const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const isSupportedByMe = useMemo(
    () => option.isSupportedByMe,
    [option.isSupportedByMe]
  );
  const isMyBid = useMemo(
    () => option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid]
  );
  const isBlue = useMemo(
    () => isSupportedByMe || isMyBid,
    [isSupportedByMe, isMyBid]
  );

  // Tutorials
  // const [isTooltipVisible, setIsTooltipVisible] = useState(true);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled =
    optionBeingSupported !== '' &&
    optionBeingSupported !== option.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(option.id.toString());
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  };

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccesModalOpen, setPaymentSuccesModalOpen] = useState(false);

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  // const handlePayWithWallet = useCallback(async () => {
  //   setLoadingModalOpen(true);
  //   try {
  //     // Check if user is logged and if the wallet balance is sufficient
  //     if (
  //       !user.loggedIn ||
  //       (walletBalance &&
  //         walletBalance?.usdCents < parseInt(supportBidAmount) * 100)
  //     ) {
  //       const getTopUpWalletWithPaymentPurposeUrlPayload =
  //         new newnewapi.TopUpWalletWithPurposeRequest({
  //           successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //             router.locale !== 'en-US' ? `${router.locale}/` : ''
  //           }post/${postId}`,
  //           cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //             router.locale !== 'en-US' ? `${router.locale}/` : ''
  //           }post/${postId}`,
  //           ...(!user.loggedIn
  //             ? {
  //                 nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
  //               }
  //             : {}),
  //           acBidRequest: {
  //             amount: new newnewapi.MoneyAmount({
  //               usdCents: parseInt(supportBidAmount) * 100,
  //             }),
  //             optionId: option.id,
  //             postUuid: postId,
  //           },
  //         });

  //       const res = await getTopUpWalletWithPaymentPurposeUrl(
  //         getTopUpWalletWithPaymentPurposeUrlPayload
  //       );

  //       if (!res.data || !res.data.sessionUrl || res.error)
  //         throw new Error(res.error?.message ?? 'Request failed');

  //       window.location.href = res.data.sessionUrl;
  //     } else {
  //       const makeBidPayload = new newnewapi.PlaceBidRequest({
  //         amount: new newnewapi.MoneyAmount({
  //           usdCents: parseInt(supportBidAmount) * 100,
  //         }),
  //         optionId: option.id,
  //         postUuid: postId,
  //       });

  //       const res = await placeBidWithWallet(makeBidPayload);

  //       if (
  //         res.data &&
  //         res.data.status ===
  //           newnewapi.PlaceBidResponse.Status.INSUFFICIENT_WALLET_BALANCE
  //       ) {
  //         const getTopUpWalletWithPaymentPurposeUrlPayload =
  //           new newnewapi.TopUpWalletWithPurposeRequest({
  //             successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${postId}`,
  //             cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${postId}`,
  //             acBidRequest: {
  //               amount: new newnewapi.MoneyAmount({
  //                 usdCents: parseInt(supportBidAmount) * 100,
  //               }),
  //               optionId: option.id,
  //               postUuid: postId,
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
  //         res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS ||
  //         res.error
  //       )
  //         throw new Error(res.error?.message ?? 'Request failed');

  //       const optionFromResponse = (res.data
  //         .option as newnewapi.Auction.Option)!!;
  //       optionFromResponse.isSupportedByMe = true;
  //       handleAddOrUpdateOptionFromResponse(optionFromResponse);

  //       handleSetSupportedBid('');
  //       setSupportBidAmount('');
  //       setIsSupportFormOpen(false);
  //       setPaymentModalOpen(false);
  //       setLoadingModalOpen(false);
  //       setPaymentSuccesModalOpen(true);
  //     }
  //   } catch (err) {
  //     setPaymentModalOpen(false);
  //     setLoadingModalOpen(false);
  //     console.error(err);
  //   }
  // }, [
  //   setPaymentModalOpen,
  //   setLoadingModalOpen,
  //   setIsSupportFormOpen,
  //   setSupportBidAmount,
  //   handleSetSupportedBid,
  //   handleAddOrUpdateOptionFromResponse,
  //   supportBidAmount,
  //   option.id,
  //   postId,
  //   user.loggedIn,
  //   walletBalance,
  //   router.locale,
  // ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload =
        new newnewapi.CreatePaymentSessionRequest({
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          ...(!user.loggedIn
            ? {
                nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
              }
            : {}),
          acBidRequest: {
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(supportBidAmount) * 100,
            }),
            optionId: option.id,
            postUuid: postId,
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
  }, [router.locale, user.loggedIn, supportBidAmount, option.id, postId]);

  // eslint-disable-next-line consistent-return
  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
        acCurrentStep: user.userTutorialsProgress.remainingAcSteps!![0],
      });
      markTutorialStepAsCompleted(payload);
    }

    dispatch(
      setUserTutorialsProgress({
        remainingAcSteps: [
          ...user.userTutorialsProgress.remainingAcSteps!!,
        ].slice(1),
      })
    );
  };

  useEffect(() => {
    if (!isSupportFormOpen) {
      setSupportBidAmount('');
    }
  }, [isSupportFormOpen]);

  return (
    <div
      key={index}
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
        onClick={() => {
          if (!isMobile && !disabled && votingAllowed) {
            handleOpenSupportForm();
          }
        }}
      >
        <SBidDetails
          isBlue={isBlue}
          active={!!optionBeingSupported && !disabled}
          noAction={!votingAllowed}
        >
          <SLottieAnimationContainer>
            {/* {shouldAnimate ? (
              <Lottie
                width={80}
                height={80}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: highest ? CoinsSampleAnimation : HeartsSampleAnimation,
                }}
              />
            ) : null} */}
          </SLottieAnimationContainer>
          <SBidAmount isWhite={isSupportedByMe || isMyBid}>
            <SCoinImg src={AcIcon.src} />
            <div>
              {option.totalAmount?.usdCents
                ? `$${formatNumber(
                    option?.totalAmount?.usdCents / 100 ?? 0,
                    true
                  )}`
                : '$0'}
            </div>
          </SBidAmount>
          <SOptionInfo isWhite={isSupportedByMe || isMyBid} variant={3}>
            {option.title}
          </SOptionInfo>
          <SBiddersInfo variant={3}>
            <Link href={`/${option.creator?.username}`}>
              <SSpanBiddersHighlighted
                className='spanHighlighted'
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{
                  ...(!isMyBid && option.isCreatedBySubscriber
                    ? {
                        color:
                          theme.name === 'dark'
                            ? theme.colorsThemed.accent.yellow
                            : theme.colors.dark,
                      }
                    : {}),
                  ...(!isMyBid
                    ? {
                        cursor: 'pointer',
                      }
                    : {}),
                }}
              >
                {isMyBid ? t('my') : getDisplayname(option.creator!!)}
              </SSpanBiddersHighlighted>
            </Link>
            {isSupportedByMe && !isMyBid ? (
              <SSpanBiddersHighlighted className='spanHighlighted'>{`, ${t(
                'me'
              )}`}</SSpanBiddersHighlighted>
            ) : null}
            {option.supporterCount > (isSupportedByMe && !isMyBid ? 2 : 1) ? (
              <>
                <SSpanBiddersRegular className='spanRegular'>{` & `}</SSpanBiddersRegular>
                <SSpanBiddersHighlighted className='spanHighlighted'>
                  {formatNumber(
                    option.supporterCount -
                      (isSupportedByMe && !isMyBid ? 2 : 1),
                    true
                  )}{' '}
                  {t('AcPost.OptionsTab.OptionCard.others')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}{' '}
            <SSpanBiddersRegular className='spanRegular'>
              {t('AcPost.OptionsTab.OptionCard.bid')}
            </SSpanBiddersRegular>
          </SBiddersInfo>
        </SBidDetails>
        {(optionBeingSupported && !disabled) ||
        !votingAllowed ? null : isMobile ? (
          <SSupportButton
            view='quaternary'
            disabled={disabled}
            isBlue={isBlue}
            onClick={() => handleOpenSupportForm()}
          >
            <div>
              {!isSupportedByMe
                ? t('AcPost.OptionsTab.OptionCard.raiseBidBtn')
                : t('AcPost.OptionsTab.OptionCard.supportAgainBtn')}
            </div>
          </SSupportButton>
        ) : (
          <SSupportButtonDesktop
            view='secondary'
            disabled={disabled}
            isBlue={isBlue}
            onClick={() => handleOpenSupportForm()}
          >
            {!isSupportedByMe
              ? t('AcPost.OptionsTab.OptionCard.supportBtn')
              : t('AcPost.OptionsTab.OptionCard.supportAgainBtn')}
          </SSupportButtonDesktop>
        )}
        {index === 0 && !isMyBid && (
          <STutorialTooltipHolder>
            <TutorialTooltip
              isTooltipVisible={
                user!!.userTutorialsProgress.remainingAcSteps!![0] ===
                newnewapi.AcTutorialStep.AC_BOOST_BID
              }
              closeTooltip={goToNextStep}
              title={t('tutorials.ac.supportPeopleBids.title')}
              text={t('tutorials.ac.supportPeopleBids.text')}
              dotPosition={DotPositionEnum.TopRight}
            />
          </STutorialTooltipHolder>
        )}
      </SContainer>
      <SSupportBidForm
        // layout
        layout='size'
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        {!isMobile && isSupportFormOpen && (
          <>
            <BidAmountTextInput
              value={supportBidAmount}
              inputAlign='left'
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
              placeholder={t(
                'AcPost.OptionsTab.ActionSection.amountPlaceholder-boost',
                { amount: minAmount.toString() }
              )}
              style={{
                padding: '12.5px 16px',
              }}
            />
            <Button
              view='primaryGrad'
              disabled={
                !supportBidAmount
                  ? true
                  : parseInt(supportBidAmount) < minAmount
              }
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('AcPost.OptionsTab.OptionCard.raiseBidBtn')}
            </Button>
            <SCancelButton
              view='transparent'
              iconOnly
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
            isOpen={isSupportFormOpen}
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
                onClick={() => handleTogglePaymentModalOpen()}
              >
                {t('AcPost.OptionsTab.OptionCard.raiseBidBtn')}
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
          amount={`$${supportBidAmount}`}
          // {...(walletBalance?.usdCents &&
          // walletBalance.usdCents >= parseInt(supportBidAmount) * 100
          //   ? {}
          //   : {
          //       predefinedOption: 'card',
          //     })}
          predefinedOption='card'
          showTocApply={!user?.loggedIn}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          // handlePayWithWallet={handlePayWithWallet}
          bottomCaption={
            <SPaymentFooter variant={3}>
              {t('AcPost.paymentModalFooter.body', { creator: postCreator })}
            </SPaymentFooter>
          }
          payButtonCaptionKey={t('AcPost.paymentModalPayButton')}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle variant={3}>
              {t('AcPost.paymentModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText>{option.title}</SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      )}
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='ac'
        isVisible={paymentSuccesModalOpen}
        closeModal={() => setPaymentSuccesModalOpen(false)}
      >
        {t('PaymentSuccessModal.ac', {
          postCreator,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
    </div>
  );
};

AcOptionCard.defaultProps = {
  optionBeingSupported: undefined,
};

export default AcOptionCard;

const SContainer = styled(motion.div)<{
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
    grid-template-columns: 3fr 7fr;

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

  margin-bottom: 6px;

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

const SCoinImg = styled.img`
  height: 28px;

  position: relative;
  top: -2px;
`;

const SOptionInfo = styled(Text)<{
  isWhite: boolean;
}>`
  grid-area: optionInfo;

  margin-bottom: 8px;

  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

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

  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
    padding-top: 4px;
  }
`;

const SSpanBiddersHighlighted = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpanBiddersRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SLottieAnimationContainer = styled.div`
  position: absolute;
  top: -29px;
  left: -20px;

  z-index: 100;
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
  height: 100%;
  width: 60px;

  color: #ffffff;
  background: ${({ theme }) => theme.colorsThemed.accent.blue};

  padding: initial;

  border-radius: initial;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};

  span {
    width: 100%;

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
          border-left: ${({ theme }) => theme.colors.dark} 1.5px solid;
        `
      : null}
`;

const SSupportBidForm = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  width: 100%;

  div {
    display: flex;
    width: 100%;
    flex-grow: 1;
    input {
      width: 100%;
    }
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

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Tutorial
const STutorialTooltipHolder = styled.div`
  position: absolute;
  right: 35px;
  top: 25px;
  text-align: left;
`;

const SPaymentFooter = styled(Text)`
  margin-top: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
  white-space: pre;
`;
