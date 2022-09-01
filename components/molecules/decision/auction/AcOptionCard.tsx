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
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
// import { WalletContext } from '../../../../contexts/walletContext';
// import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import {
  createStripeSetupIntent,
  updateStripeSetupIntent,
  // getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';
import { TAcOptionWithHighestField } from '../../../organisms/decision/regular/PostViewAC';

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
import Headline from '../../../atoms/Headline';
import OptionEllipseModal from '../OptionEllipseModal';
import OptionEllipseMenu from '../OptionEllipseMenu';
import ReportModal, { ReportData } from '../../chat/ReportModal';
import PostTitleContent from '../../../atoms/PostTitleContent';
import AcConfirmDeleteOptionModal from './moderation/AcConfirmDeleteOptionModal';

// Utils
import { formatNumber } from '../../../../utils/format';
import { Mixpanel } from '../../../../utils/mixpanel';
import getDisplayname from '../../../../utils/getDisplayname';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';

import { reportEventOption } from '../../../../api/endpoints/report';
import {
  deleteAcOption,
  placeBidOnAuction,
} from '../../../../api/endpoints/auction';

// Icons
import assets from '../../../../constants/assets';
import BidIconLight from '../../../../public/images/decision/bid-icon-light.png';
import BidIconDark from '../../../../public/images/decision/bid-icon-dark.png';
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import MoreIcon from '../../../../public/images/svg/icons/filled/More.svg';
import getRewardErrorStatusTextKey from '../../../../utils/getRewardErrorStatusTextKey';

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
    case newnewapi.PlaceBidResponse.Status.BLOCKED_BY_CREATOR:
      return 'errors.blockedByCreator';
    case newnewapi.PlaceBidResponse.Status.BIDDING_NOT_STARTED:
      return 'errors.biddingNotStarted';
    case newnewapi.PlaceBidResponse.Status.BIDDING_ENDED:
      return 'errors.biddingIsEnded';
    default:
      return 'errors.requestFailed';
  }
};

interface IAcOptionCard {
  option: TAcOptionWithHighestField;
  // shouldAnimate: boolean;
  votingAllowed: boolean;
  postId: string;
  postCreator: string;
  postDeadline: string;
  postText: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
  handleRemoveOption?: () => void;
}

const AcOptionCard: React.FunctionComponent<IAcOptionCard> = ({
  option,
  // shouldAnimate,
  votingAllowed,
  postId,
  postCreator,
  postDeadline,
  postText,
  index,
  optionBeingSupported,
  minAmount,
  handleSetSupportedBid,
  handleAddOrUpdateOptionFromResponse,
  handleRemoveOption,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
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
    () =>
      !!option.creator?.uuid &&
      option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid]
  );
  const isBlue = useMemo(
    () => isSupportedByMe || isMyBid,
    [isSupportedByMe, isMyBid]
  );

  // Tutorials
  // const [isTooltipVisible, setIsTooltipVisible] = useState(true);

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
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setIsReportModalOpen(true);
  }, [user, router]);

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
      toast.error(t('toastErrors.generic'));
    }
  }, [handleRemoveOption, option.id, t]);

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
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  };

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  // const handlePayWithWallet = useCallback(async () => {
  //  if (!user._persist?.rehydrated) {
  //    return;
  //  }
  //
  //   setLoadingModalOpen(true);
  //   try {
  //     // Check if user is logged and if the wallet balance is sufficient
  //     if (!user.loggedIn ||
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
  //  user._persist?.rehydrated,
  //   walletBalance,
  //   router.locale,
  // ]);

  const createSetupIntent = useCallback(async () => {
    try {
      const placeBidRequest = new newnewapi.PlaceBidRequest({
        postUuid: postId,
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(supportBidAmount) * 100,
        }),
        optionId: option.id,
      });

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        acBidRequest: placeBidRequest,
        ...(!user.loggedIn ? { guestEmail: '' } : {}),
        ...(!user.loggedIn
          ? { successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}` }
          : {}),
      });
      const response = await createStripeSetupIntent(payload);

      if (
        !response.data ||
        response.error ||
        !response.data?.stripeSetupIntentClientSecret
      ) {
        throw new Error(response.error?.message || 'Some error occurred');
      }

      return response.data;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [postId, option.id, supportBidAmount, user.loggedIn]);

  const handlePayWithCard = useCallback(
    async ({
      rewardAmount,
      cardUuid,
      stripeSetupIntentClientSecret,
      saveCard,
    }: {
      rewardAmount: number;
      cardUuid?: string;
      stripeSetupIntentClientSecret: string;
      saveCard?: boolean;
    }) => {
      setLoadingModalOpen(true);

      if (!user.loggedIn) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('PayWithCard', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'AcOptionsCard',
      });

      try {
        if (rewardAmount > 0) {
          const updateStripeSetupIntentRequest =
            new newnewapi.UpdateStripeSetupIntentRequest({
              stripeSetupIntentClientSecret,
              rewardAmount: new newnewapi.MoneyAmount({
                usdCents: rewardAmount,
              }),
            });

          const updateRes = await updateStripeSetupIntent(
            updateStripeSetupIntentRequest
          );

          if (
            !updateRes.data ||
            updateRes.error ||
            updateRes.data.status !==
              newnewapi.UpdateStripeSetupIntentResponse.Status.SUCCESS
          ) {
            throw new Error(
              updateRes.error?.message ??
                t(getRewardErrorStatusTextKey(updateRes.data?.status))
            );
          }
        }

        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            stripeSetupIntentClientSecret,
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
        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportFormOpen(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setPaymentModalOpen(false);
      }
    },
    [
      handleSetSupportedBid,
      postId,
      user.loggedIn,
      router,
      handleAddOrUpdateOptionFromResponse,
      t,
    ]
  );

  // eslint-disable-next-line consistent-return
  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingAcSteps &&
      user.userTutorialsProgress.remainingAcSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          acCurrentStep: user.userTutorialsProgress.remainingAcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }

      dispatch(
        setUserTutorialsProgress({
          remainingAcSteps: [
            ...user.userTutorialsProgress.remainingAcSteps,
          ].slice(1),
        })
      );
    }
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
        onClick={(e) => {
          if (!isMobile && !isEllipseMenuOpen) {
            setIsEllipseMenuOpen(true);

            setOptionMenuXY({
              x: e.clientX,
              y: e.clientY,
            });
          }
        }}
      >
        {isMobile && (
          <SEllipseButtonMobile onClick={() => setIsEllipseMenuOpen(true)}>
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
            <OptionActionIcon
              src={theme.name === 'light' ? BidIconLight.src : BidIconDark.src}
            />
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
          <SBiddersInfo onClick={(e) => e.preventDefault()} variant={3}>
            {option.creator?.username ? (
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
                      : isMyBid && option.isCreatedBySubscriber
                      ? {
                          color: theme.colorsThemed.accent.yellow,
                        }
                      : {}),
                    ...(!isMyBid
                      ? {
                          cursor: 'pointer',
                        }
                      : {}),
                  }}
                >
                  {isMyBid
                    ? option.supporterCount > 2
                      ? t('me')
                      : t('my')
                    : getDisplayname(option.creator!!)}
                </SSpanBiddersHighlighted>
              </Link>
            ) : (
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
                    : isMyBid && option.isCreatedBySubscriber
                    ? {
                        color: theme.colorsThemed.accent.yellow,
                      }
                    : {}),
                }}
              >
                {isMyBid
                  ? option.supporterCount > 2
                    ? t('me')
                    : t('my')
                  : getDisplayname(option.creator!!)}
              </SSpanBiddersHighlighted>
            )}
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
                  {t('acPost.optionsTab.optionCard.others')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}{' '}
            <SSpanBiddersRegular className='spanRegular'>
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
                _postUuid: postId,
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
            view='secondary'
            disabled={disabled}
            isBlue={isBlue}
            onClickCapture={() => {
              Mixpanel.track('Boost Click', {
                _stage: 'Post',
                _postUuid: postId,
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
          user?.userTutorialsProgress.remainingAcSteps && (
            <STutorialTooltipHolder>
              <TutorialTooltip
                isTooltipVisible={
                  user.userTutorialsProgress.remainingAcSteps[0] ===
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
                'acPost.optionsTab.actionSection.amountPlaceholderBoost',
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
            <SCancelButton
              view='transparent'
              iconOnly
              onClickCapture={() => {
                Mixpanel.track('Cancel Boost', {
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
          amount={parseInt(supportBidAmount) * 100 || 0}
          createStripeSetupIntent={createSetupIntent}
          redirectUrl={`post/${postId}`}
          // {...(walletBalance?.usdCents &&
          // walletBalance.usdCents >= parseInt(supportBidAmount) * 100
          //   ? {}
          //   : {
          //       predefinedOption: 'card',
          //     })}
          // predefinedOption='card'
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          // handlePayWithWallet={handlePayWithWallet}
          bottomCaption={
            <>
              <SPaymentSign variant={3}>
                {t('acPost.paymentModalFooter.body', { creator: postCreator })}
              </SPaymentSign>
              <SPaymentTerms variant={3}>
                *{' '}
                <Link href='https://terms.newnew.co'>
                  <SPaymentTermsLink
                    href='https://terms.newnew.co'
                    target='_blank'
                  >
                    {t('acPost.paymentModalFooter.terms')}
                  </SPaymentTermsLink>
                </Link>{' '}
                {t('acPost.paymentModalFooter.apply')}
              </SPaymentTerms>
            </>
          }
          // payButtonCaptionKey={t('acPost.paymentModalPayButton')}
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
                {t('acPost.paymentModalHeader.title', { creator: postCreator })}
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalPostText variant={2}>
              <PostTitleContent>{postText}</PostTitleContent>
            </SPaymentModalPostText>
            <SPaymentModalTitle variant={3}>
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
        isVisible={paymentSuccessModalOpen}
        closeModal={() => setPaymentSuccessModalOpen(false)}
      >
        {t('paymentSuccessModal.ac', {
          postCreator,
          postDeadline,
        })}
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
          onClose={() => setIsEllipseMenuOpen(false)}
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
          handleClose={() => setIsEllipseMenuOpen(false)}
          handleOpenReportOptionModal={() => handleOpenReportForm()}
          handleOpenRemoveOptionModal={() => handleOpenRemoveForm()}
        />
      )}
      {/* Report modal */}
      {option.creator && (
        <ReportModal
          show={isReportModalOpen}
          reportedDisplayname={getDisplayname(option.creator)}
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
    grid-template-columns: 5fr 4fr;

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

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
  white-space: pre-wrap;
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

const SEllipseButtonMobile = styled(Button)`
  position: absolute;
  right: 16px;

  background: transparent;
  padding: 0;
  z-index: 1;

  &:hover:enabled,
  &:focus:enabled {
    background: transparent;
  }
`;
