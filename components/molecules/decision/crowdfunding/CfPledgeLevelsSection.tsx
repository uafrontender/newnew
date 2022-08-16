/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  // useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { doPledgeCrowdfunding } from '../../../../api/endpoints/crowdfunding';
import {
  createStripeSetupIntent,
  updateStripeSetupIntent,
  // getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import CfMakeCustomPledgeCard from './CfMakeCustomPledgeCard';
import CfMakeStandardPledgeCard from './CfMakeStandardPledgeCard';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import useScrollGradientsHorizontal from '../../../../utils/hooks/useScrollGradientsHorizontal';
import GradientMaskHorizontal from '../../../atoms/GradientMaskHorizontal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import InlineSvg from '../../../atoms/InlineSVG';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import getDisplayname from '../../../../utils/getDisplayname';
import assets from '../../../../constants/assets';
import Headline from '../../../atoms/Headline';
import { Mixpanel } from '../../../../utils/mixpanel';
import PostTitleContent from '../../../atoms/PostTitleContent';
// import { WalletContext } from '../../../../contexts/walletContext';

const getPayWithCardErrorMessage = (
  status?: newnewapi.DoPledgeResponse.Status
) => {
  switch (status) {
    case newnewapi.DoPledgeResponse.Status.NOT_ENOUGH_FUNDS:
      return 'errors.notEnoughMoney';
    case newnewapi.DoPledgeResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.DoPledgeResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.DoPledgeResponse.Status.BLOCKED_BY_CREATOR:
      return 'errors.blockedByCreator';
    case newnewapi.DoPledgeResponse.Status.CF_CANCELLED:
      return 'errors.cfCancelled';
    case newnewapi.DoPledgeResponse.Status.CF_FINISHED:
      return 'errors.cfFinished';
    case newnewapi.DoPledgeResponse.Status.CF_NOT_STARTED:
      return 'errors.cfNotStarted';
    default:
      return 'errors.requestFailed';
  }
};

interface ICfPledgeLevelsSection {
  pledgeLevels: newnewapi.IMoneyAmount[];
  post: newnewapi.Crowdfunding;
  handleSetPaymentSuccessModalOpen: (newValue: boolean) => void;
  handleAddPledgeFromResponse: (
    newPledge: newnewapi.Crowdfunding.Pledge
  ) => void;
}

const CfPledgeLevelsSection: React.FunctionComponent<
  ICfPledgeLevelsSection
> = ({
  pledgeLevels,
  post,
  handleSetPaymentSuccessModalOpen,
  handleAddPledgeFromResponse,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const { appConstants } = useGetAppConstants();
  // const { walletBalance } = useContext(WalletContext);

  const containerRef = useRef<HTMLDivElement>();

  const buttonsContainerRef = useRef<HTMLDivElement>();
  const { showLeftGradient, showRightGradient } =
    useScrollGradientsHorizontal(buttonsContainerRef);

  const [pledgeAmount, setPledgeAmount] = useState<number | undefined>(
    undefined
  );

  const [customPledgeAmount, setCustomPledgeAmount] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Handlers
  const handleSetPledgeAmountAndOpenPaymentModal = useCallback(
    (amount: number) => {
      setPledgeAmount(amount);
      setPaymentModalOpen(true);
    },
    [setPledgeAmount]
  );

  const handleCustomPledgePaymentModal = useCallback(() => {
    setPledgeAmount(parseInt(customPledgeAmount) * 100);
    setPaymentModalOpen(true);
  }, [customPledgeAmount]);

  const handleOpenCustomPledgeForm = () => setIsFormOpen(true);

  const handleCloseCustomPledgeForm = () => {
    setCustomPledgeAmount('');
    setIsFormOpen(false);
  };

  // Make a pledge and close all forms and modals
  // const handlePayWithWallet = useCallback(async () => {
  //  if (!user._persist?.rehydrated) {
  //    return;
  //  }
  //
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
  //           cfPledgeRequest: {
  //             amount: new newnewapi.MoneyAmount({
  //               usdCents: parseInt(pledgeAmount?.toString()!!),
  //             }),
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
  //       const makePledgePayload = new newnewapi.DoPledgeRequest({
  //         amount: new newnewapi.MoneyAmount({
  //           usdCents: parseInt(pledgeAmount?.toString()!!),
  //         }),
  //         postUuid: post.postUuid,
  //       });

  //       const res = await doPledgeWithWallet(makePledgePayload);

  //       if (
  //         res.data &&
  //         res.data.status ===
  //           newnewapi.DoPledgeResponse.Status.INSUFFICIENT_WALLET_BALANCE
  //       ) {
  //         const getTopUpWalletWithPaymentPurposeUrlPayload =
  //           new newnewapi.TopUpWalletWithPurposeRequest({
  //             successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${post.postUuid}`,
  //             cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
  //               router.locale !== 'en-US' ? `${router.locale}/` : ''
  //             }post/${post.postUuid}`,
  //             cfPledgeRequest: {
  //               amount: new newnewapi.MoneyAmount({
  //                 usdCents: parseInt(pledgeAmount?.toString()!!),
  //               }),
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
  //         res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS ||
  //         res.error
  //       )
  //         throw new Error(res.error?.message ?? 'Request failed');

  //       setIsFormOpen(false);
  //       setCustomPledgeAmount('');
  //       handleAddPledgeFromResponse(
  //         res.data.pledge as newnewapi.Crowdfunding.Pledge
  //       );

  //       setCustomPledgeAmount('');
  //       setIsFormOpen(false);
  //       setPaymentModalOpen(false);
  //       setLoadingModalOpen(false);
  //       handleSetPaymentSuccessModalOpen(true);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setPaymentModalOpen(false);
  //     setLoadingModalOpen(false);
  //   }
  // }, [
  //   user.loggedIn,
  //   user._persist?.rehydrated,
  //   router.locale,
  //   post.postUuid,
  //   pledgeAmount,
  //   handleAddPledgeFromResponse,
  //   handleSetPaymentSuccessModalOpen,
  // ]);

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
        _postUuid: post.postUuid,
        _component: 'CfPledgeLevelsSection',
      });

      try {
        const updateStripeSetupIntentRequest =
          new newnewapi.UpdateStripeSetupIntentRequest({
            stripeSetupIntentClientSecret,
            rewardAmount: new newnewapi.MoneyAmount({
              usdCents: rewardAmount,
            }),
          });

        await updateStripeSetupIntent(updateStripeSetupIntentRequest);

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

        const res = await doPledgeCrowdfunding(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        setIsFormOpen(false);
        setCustomPledgeAmount('');
        handleAddPledgeFromResponse(
          res.data.pledge as newnewapi.Crowdfunding.Pledge
        );

        handleSetPaymentSuccessModalOpen(true);
        setIsFormOpen(false);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setPaymentModalOpen(false);
      }
    },
    [
      handleSetPaymentSuccessModalOpen,
      post.postUuid,
      handleAddPledgeFromResponse,
      user.loggedIn,
      router,
      t,
    ]
  );

  useEffect(() => {
    if (!paymentModalOpen) setPledgeAmount(undefined);
  }, [paymentModalOpen]);

  const createSetupIntent = useCallback(async () => {
    try {
      const doPledgeRequest = new newnewapi.DoPledgeRequest({
        postUuid: post.postUuid,
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(pledgeAmount ? pledgeAmount?.toString() : '0'),
        }),
      });

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        ...(!user.loggedIn ? { guestEmail: '' } : {}),
        ...(!user.loggedIn
          ? {
              successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${post.postUuid}`,
            }
          : {}),
        cfPledgeRequest: doPledgeRequest,
      });
      const response = await createStripeSetupIntent(payload);

      if (!response.data || response.error) {
        throw new Error(response.error?.message || 'Some error occurred');
      }

      return response.data;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }, [post.postUuid, pledgeAmount, user.loggedIn]);

  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingCfSteps &&
      user.userTutorialsProgress.remainingCfSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          cfCurrentStep: user.userTutorialsProgress.remainingCfSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingCfSteps: [
            ...user.userTutorialsProgress.remainingCfSteps,
          ].slice(1),
        })
      );
    }
  };

  return (
    <>
      <SSectionContainer
        ref={(el) => {
          // eslint-disable-next-line no-param-reassign
          containerRef.current = el!!;
        }}
      >
        <SInfoSubsection>
          <STitle variant={2} weight={600}>
            {t('cfPost.backersTab.info.title', {
              creator: post.creator?.nickname,
            })}
          </STitle>
        </SInfoSubsection>
        {isFormOpen ? (
          <SNewPledgeForm>
            <BidAmountTextInput
              value={customPledgeAmount}
              minAmount={Math.round(appConstants.minCfPledge / 100)}
              inputAlign='left'
              style={{
                padding: '12.5px 16px',
                width: '100%',
              }}
              onChange={(newValue: string) => setCustomPledgeAmount(newValue)}
            />
            <Button
              size='sm'
              view='primaryGrad'
              disabled={
                customPledgeAmount === '' ||
                parseInt(customPledgeAmount) <
                  Math.round(appConstants.minCfPledge / 100)
              }
              onClickCapture={() => {
                Mixpanel.track('Submit Custom Pledge', {
                  _stage: 'Post',
                });
              }}
              onClick={() => handleCustomPledgePaymentModal()}
            >
              {t('cfPost.backersTab.customPledge.pledgeButton')}
            </Button>
            <SCancelButton
              view='transparent'
              iconOnly
              onClickCapture={() => {
                Mixpanel.track('Cancel Custom Pledge', {
                  _stage: 'Post',
                });
              }}
              onClick={() => handleCloseCustomPledgeForm()}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCancelButton>
          </SNewPledgeForm>
        ) : (
          <SButtonsContainer
            ref={(el) => {
              buttonsContainerRef.current = el!!;
            }}
            numItems={1 + pledgeLevels.length}
          >
            {pledgeLevels.map((pledgeLevel, i, arr) => (
              <CfMakeStandardPledgeCard
                key={pledgeLevel.usdCents}
                amount={pledgeLevel}
                grandsVipStatus={i === arr.length - 1}
                handleOpenMakePledgeForm={() => {
                  handleSetPledgeAmountAndOpenPaymentModal(
                    pledgeLevel?.usdCents ? pledgeLevel.usdCents : 0
                  );
                }}
              />
            ))}
            <CfMakeCustomPledgeCard
              handleOpenMakePledgeForm={handleOpenCustomPledgeForm}
            />
            <GradientMaskHorizontal
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
              height={`${
                buttonsContainerRef.current?.getBoundingClientRect().height
              }px`}
              positionBottom='0px'
              positionLeft='0px'
              active={showLeftGradient}
            />
            <GradientMaskHorizontal
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
              height={`${
                buttonsContainerRef.current?.getBoundingClientRect().height
              }px`}
              positionBottom='0px'
              positionRight='0px'
              active={showRightGradient}
            />
            {user?.userTutorialsProgress.remainingCfSteps && (
              <STutorialTooltipHolder>
                <TutorialTooltip
                  isTooltipVisible={
                    user.userTutorialsProgress.remainingCfSteps[0] ===
                    newnewapi.CfTutorialStep.CF_BACK_GOAL
                  }
                  closeTooltip={goToNextStep}
                  title={t('tutorials.cf.createYourBid.title')}
                  text={t('tutorials.cf.createYourBid.text')}
                  dotPosition={DotPositionEnum.BottomRight}
                />
              </STutorialTooltipHolder>
            )}
          </SButtonsContainer>
        )}
      </SSectionContainer>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={pledgeAmount || 0}
          createStripeSetupIntent={createSetupIntent}
          // {...(walletBalance?.usdCents &&
          // pledgeAmount &&
          // walletBalance.usdCents >= pledgeAmount
          //   ? {}
          //   : {
          //       predefinedOption: 'card',
          //     })}
          // predefinedOption='card'
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          redirectUrl={`post/${post.postUuid}`}
          // handlePayWithWallet={handlePayWithWallet}
          bottomCaption={
            <>
              {post.creator && (
                <SPaymentSign variant={3}>
                  {t('cfPost.paymentModalFooter.body', {
                    creator: getDisplayname(post.creator),
                  })}
                </SPaymentSign>
              )}
              <SPaymentTerms variant={3}>
                *{' '}
                <Link href='https://terms.newnew.co'>
                  <SPaymentTermsLink
                    href='https://terms.newnew.co'
                    target='_blank'
                  >
                    {t('cfPost.paymentModalFooter.terms')}
                  </SPaymentTermsLink>
                </Link>{' '}
                {t('cfPost.paymentModalFooter.apply')}
              </SPaymentTerms>
            </>
          }
          // payButtonCaptionKey={t('cfPost.paymentModalPayButton')}
        >
          <SPaymentModalHeader>
            <SPaymentModalHeading>
              <SPaymentModalHeadingPostSymbol>
                <SPaymentModalHeadingPostSymbolImg
                  src={
                    theme.name === 'light'
                      ? assets.creation.lightCfStatic
                      : assets.creation.darkCfStatic
                  }
                />
              </SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostCreator variant={3}>
                {post.creator
                  ? t('cfPost.paymentModalHeader.title', {
                      creator: getDisplayname(post.creator),
                    })
                  : ''}
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalOptionText variant={5}>
              <PostTitleContent>{post.title}</PostTitleContent>
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
    </>
  );
};

export default CfPledgeLevelsSection;

const SSectionContainer = styled.div`
  position: relative;

  max-width: 520px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const SInfoSubsection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  width: 100%;

  margin-bottom: 12px;
`;

const STitle = styled(Text)`
  text-align: center;
  width: 100%;
`;

const SButtonsContainer = styled.div<{
  numItems: number;
}>`
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  gap: 8px;

  width: 400px;

  overflow-x: auto;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  z-index: 10;

  @media (min-width: 800px) {
    width: 480px;
  }

  @media (min-width: 860px) {
    width: 540px;
  }

  @media (min-width: 960px) {
    width: 600px;
  }

  @media (min-width: 960px) {
    width: 650px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 100%;
  }
`;

// Custom pledge form
const SNewPledgeForm = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  justify-content: space-between;

  height: 96px;

  div:first-child {
    width: 100%;
  }
`;

const SCancelButton = styled(Button)`
  width: 48px;
  height: 48px;

  /* padding: 0px; */

  flex-shrink: 0;

  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.background.primary};
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
`;

const SPaymentModalHeadingPostCreator = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

const SPaymentModalOptionText = styled(Headline)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: -180px;
  bottom: 70%;
  text-align: left;
  z-index: 1;
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
