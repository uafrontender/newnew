/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAppSelector } from '../../../../redux-store/store';
import { doPledgeCrowdfunding } from '../../../../api/endpoints/crowdfunding';
import {
  // getTopUpWalletWithPaymentPurposeUrl,
  createStripeSetupIntent,
} from '../../../../api/endpoints/payments';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import LoadingModal from '../../LoadingModal';
import InlineSvg from '../../../atoms/InlineSVG';
import OptionActionMobileModal from '../OptionActionMobileModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import getDisplayname from '../../../../utils/getDisplayname';
import Headline from '../../../atoms/Headline';
import assets from '../../../../constants/assets';
import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import PostTitleContent from '../../../atoms/PostTitleContent';
import PaymentModal from '../../checkout/PaymentModal';
import { Mixpanel } from '../../../../utils/mixpanel';
// import { WalletContext } from '../../../../contexts/walletContext';

const getPayWithCardErrorMessage = (
  status?: newnewapi.DoPledgeResponse.Status
) => {
  switch (status) {
    case newnewapi.DoPledgeResponse.Status.NOT_ENOUGH_FUNDS:
      return 'Not enough money';
    case newnewapi.DoPledgeResponse.Status.CARD_NOT_FOUND:
      return 'Card not found';
    case newnewapi.DoPledgeResponse.Status.CARD_CANNOT_BE_USED:
      return 'This card can not be used';
    case newnewapi.DoPledgeResponse.Status.BLOCKED_BY_CREATOR:
      return 'Blocked by creator';
    case newnewapi.DoPledgeResponse.Status.CF_CANCELLED:
      return 'Goal is cancelled';
    case newnewapi.DoPledgeResponse.Status.CF_FINISHED:
      return 'Goal is finished already';
    case newnewapi.DoPledgeResponse.Status.CF_NOT_STARTED:
      return 'Goal is not started yet';
    default:
      return 'Request failed';
  }
};

interface ICfPledgeLevelsModal {
  zIndex: number;
  isOpen: boolean;
  post: newnewapi.Crowdfunding;
  pledgeLevels: newnewapi.IMoneyAmount[];
  onClose: () => void;
  handleSetPaymentSuccessModalOpen: (newValue: boolean) => void;
  handleAddPledgeFromResponse: (
    newPledge: newnewapi.Crowdfunding.Pledge
  ) => void;
}

const CfPledgeLevelsModal: React.FunctionComponent<ICfPledgeLevelsModal> = ({
  post,
  zIndex,
  isOpen,
  pledgeLevels,
  onClose,
  handleSetPaymentSuccessModalOpen,
  handleAddPledgeFromResponse,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);

  // const { walletBalance } = useContext(WalletContext);

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
  //       onClose();
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setPaymentModalOpen(false);
  //     setLoadingModalOpen(false);
  //   }
  // }, [
  //   pledgeAmount,
  //   post.postUuid,
  //   user.loggedIn,
  //   router.locale,
  //   handleAddPledgeFromResponse,
  //   handleSetPaymentSuccessModalOpen,
  //   onClose,
  // ]);

  const handlePayWithCard = useCallback(
    async ({
      cardUuid,
      stripeSetupIntentClientSecret,
      saveCard,
    }: {
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
        _component: 'CfPledgeLevelsModal',
      });
      try {
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
            res.error?.message ?? getPayWithCardErrorMessage(res.data?.status)
          );
        }

        setIsFormOpen(false);
        setCustomPledgeAmount('');
        handleAddPledgeFromResponse(
          res.data.pledge as newnewapi.Crowdfunding.Pledge
        );

        handleSetPaymentSuccessModalOpen(true);

        onClose();
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
      onClose,
      handleAddPledgeFromResponse,
      post.postUuid,
      user.loggedIn,
      router,
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

  return (
    <>
      <EllipseModal zIndex={zIndex} show={isOpen} onClose={() => onClose()}>
        {pledgeLevels
          .map((p, i) =>
            p.usdCents ? (
              <EllipseModalButton
                key={`${p.usdCents}_${i}`}
                onClick={() => {
                  handleSetPledgeAmountAndOpenPaymentModal(
                    p.usdCents ? p.usdCents : 0
                  );
                }}
              >{`$${(p.usdCents / 100).toFixed(0)}`}</EllipseModalButton>
            ) : null
          )
          .concat(
            <EllipseModalButton
              onClick={() => {
                handleOpenCustomPledgeForm();
              }}
            >
              {t('cfPost.backersTab.custom')}
            </EllipseModalButton>
          )}
      </EllipseModal>
      {/* Custom pledge modal */}
      <OptionActionMobileModal
        isOpen={isFormOpen}
        onClose={() => handleCloseCustomPledgeForm()}
        zIndex={12}
      >
        <SCustomPledgeMobileContainer>
          <div
            style={{
              position: 'relative',
            }}
          >
            {t('cfPost.backersTab.customPledge.pledgeButton')}
            <SCloseButton onClick={() => handleCloseCustomPledgeForm()}>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          </div>
          <BidAmountTextInput
            value={customPledgeAmount}
            inputAlign='center'
            autofocus={isFormOpen}
            minAmount={1}
            style={{
              textAlign: 'center',
              paddingLeft: '12px',
            }}
            onChange={(newValue: string) => setCustomPledgeAmount(newValue)}
          />
          <Button
            view='primaryGrad'
            size='sm'
            disabled={customPledgeAmount === ''}
            onClick={() => handleCustomPledgePaymentModal()}
          >
            {t('cfPost.backersTab.customPledge.continue')}
          </Button>
          <SCaption>{t('cfPost.backersTab.info.caption')}</SCaption>
        </SCustomPledgeMobileContainer>
      </OptionActionMobileModal>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={14}
          amount={pledgeAmount || 0}
          // {...(walletBalance?.usdCents &&
          // pledgeAmount &&
          // walletBalance.usdCents >= pledgeAmount
          //   ? {}
          //   : {
          //       predefinedOption: 'card',
          //     })}
          // predefinedOption='card'
          onClose={() => setPaymentModalOpen(false)}
          createStripeSetupIntent={createSetupIntent}
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
      <LoadingModal isOpen={loadingModalOpen} zIndex={15} />
    </>
  );
};

export default CfPledgeLevelsModal;

const SCaption = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  text-align: center;
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

// Custom pledge form
const SCustomPledgeMobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;
`;

const SCloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 12px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  border: transparent;
  background: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
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
