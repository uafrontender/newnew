/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
<<<<<<< HEAD
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
=======
import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
>>>>>>> development

import { useAppSelector } from '../../../../redux-store/store';
import { WalletContext } from '../../../../contexts/walletContext';
import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';
import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Lottie from '../../../atoms/Lottie';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import OptionActionMobileModal from '../OptionActionMobileModal';

import { formatNumber } from '../../../../utils/format';

// NB! temp sample
import HeartsSampleAnimation from '../../../../public/animations/hearts-sample.json';
import CoinsSampleAnimation from '../../../../public/animations/coins-sample.json';

// Icons
import SupportOptionIcon from '../../../../public/images/decision/support-option-mock.png';
import CoinIcon from '../../../../public/images/decision/coin-mock.png';

interface IAcOptionCard {
  option: TAcOptionWithHighestField;
  shouldAnimate: boolean;
  postId: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.Auction.Option) => void;
}

const AcOptionCard: React.FunctionComponent<IAcOptionCard> = ({
  option,
  shouldAnimate,
  postId,
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
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const { walletBalance } = useContext(WalletContext);

  const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const isSupportedByMe = useMemo(() => option.isSupportedByMe, [option.isSupportedByMe]);
  const isMyBid = useMemo(
    () => option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid]
  );

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');
  const disabled = optionBeingSupported !== '' && optionBeingSupported !== option.id.toString();

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
    handleSetSupportedBid(option.id.toString());
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
    handleSetSupportedBid('');
  };

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => router.push(`/u/${option.creator?.username}`);

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    setPaymentModalOpen(true);
  };

  const handlePayWithWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged and if the wallet balance is sufficient
      if (!user.loggedIn || (walletBalance && walletBalance?.usdCents < parseInt(supportBidAmount, 10) * 100)) {
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
<<<<<<< HEAD
          successUrl: `${window.location.href}&`,
          cancelUrl: `${window.location.href}&`,
          ...(!user.loggedIn
            ? {
                nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
              }
            : {}),
=======
          successUrl: `${window.location.href.split('#')[0]}&`,
          cancelUrl: `${window.location.href.split('#')[0]}&`,
          ...(!user.loggedIn ? {
            nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
          } : {}),
>>>>>>> development
          acBidRequest: {
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(supportBidAmount, 10) * 100,
            }),
            optionId: option.id,
            postUuid: postId,
          },
        });

        const res = await getTopUpWalletWithPaymentPurposeUrl(getTopUpWalletWithPaymentPurposeUrlPayload);

        if (!res.data || !res.data.sessionUrl || res.error) throw new Error(res.error?.message ?? 'Request failed');

        window.location.href = res.data.sessionUrl;
      } else {
        const makeBidPayload = new newnewapi.PlaceBidRequest({
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(supportBidAmount, 10) * 100,
          }),
          optionId: option.id,
          postUuid: postId,
        });

        const res = await placeBidWithWallet(makeBidPayload);

        if (res.data && res.data.status === newnewapi.PlaceBidResponse.Status.INSUFFICIENT_WALLET_BALANCE) {
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${window.location.href.split('#')[0]}&`,
            cancelUrl: `${window.location.href.split('#')[0]}&`,
            acBidRequest: {
              amount: new newnewapi.MoneyAmount({
                usdCents: parseInt(supportBidAmount, 10) * 100,
              }),
              optionId: option.id,
              postUuid: postId,
            },
          });

          const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(
            getTopUpWalletWithPaymentPurposeUrlPayload
          );

          if (!resStripeRedirect.data || !resStripeRedirect.data.sessionUrl || resStripeRedirect.error)
            throw new Error(resStripeRedirect.error?.message ?? 'Request failed');

          window.location.href = resStripeRedirect.data.sessionUrl;
          return;
        }

        if (!res.data || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data.option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        handleSetSupportedBid('');
        setSupportBidAmount('');
        setIsSupportFormOpen(false);
        setPaymentModalOpen(false);
        setLoadingModalOpen(false);
      }
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [
    setPaymentModalOpen,
    setLoadingModalOpen,
    setIsSupportFormOpen,
    setSupportBidAmount,
    handleSetSupportedBid,
    handleAddOrUpdateOptionFromResponse,
    supportBidAmount,
    option.id,
    postId,
    user.loggedIn,
    walletBalance,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${window.location.href.split('#')[0]}&`,
        cancelUrl: `${window.location.href.split('#')[0]}&`,
        ...(!user.loggedIn
          ? {
              nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
            }
          : {}),
        acBidRequest: {
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(supportBidAmount, 10) * 100,
          }),
          optionId: option.id,
          postUuid: postId,
        },
      });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data || !res.data.sessionUrl || res.error) throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [user.loggedIn, supportBidAmount, option.id, postId]);

  return (
    <motion.div
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
        isDisabled={disabled}
        isBlue={isSupportedByMe || isMyBid}
      >
        <SBidDetails
          isBlue={isSupportedByMe || isMyBid}
        >
          <SLottieAnimationContainer>
            {shouldAnimate ? (
              <Lottie
                width={80}
                height={80}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: highest ? CoinsSampleAnimation : HeartsSampleAnimation,
                }}
              />
            ) : null}
          </SLottieAnimationContainer>
          <SBidAmount>
            <SCoinImg
              src={CoinIcon.src}
            />
            <div>
              {option.totalAmount?.usdCents ? `$${formatNumber(option?.totalAmount?.usdCents / 100 ?? 0, true)}` : '$0'}
            </div>
          </SBidAmount>
          <SOptionInfo
            variant={3}
          >
            {option.title}
          </SOptionInfo>
          <SBiddersInfo
            variant={3}
          >
            <SSpanBiddersHighlighted
              className="spanHighlighted"
              onClick={() => {
                if (!isMyBid) {
                  handleRedirectToOptionCreator()
                }
              }}
              style={{
                ...(!isMyBid && option.isCreatedBySubscriber ? {
                  color: theme.colorsThemed.accent.yellow,
                } : {}),
                ...(!isMyBid ? {
                  cursor: 'pointer',
                } : {}),
              }}
            >
              {isMyBid ? t('me') : (option.creator?.nickname ?? option.creator?.username)}
            </SSpanBiddersHighlighted>
            {isSupportedByMe && !isMyBid ? (
              <SSpanBiddersHighlighted
                className="spanHighlighted"
              >
                {`, ${t('me')}`}
              </SSpanBiddersHighlighted>
            ) : null}
            {option.supporterCount > (isSupportedByMe && !isMyBid ? 2 : 1) ? (
              <>
                <SSpanBiddersRegular
                  className="spanRegular"
                >
                  {` & `}
                </SSpanBiddersRegular>
                <SSpanBiddersHighlighted
                  className="spanHighlighted"
                >
                  {formatNumber(
                    option.supporterCount - (isSupportedByMe && !isMyBid ? 2 : 1),
                    true,
                  )}
                  { ' ' }
                  {t('AcPost.OptionsTab.OptionCard.others')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}
            {' '}
            <SSpanBiddersRegular
              className="spanRegular"
            >
              {t('AcPost.OptionsTab.OptionCard.bid')}
            </SSpanBiddersRegular>
          </SBiddersInfo>
        </SBidDetails>
        {optionBeingSupported && !disabled ? (
          null
        ) : (
          <SSupportButton
            view="quaternary"
            disabled={disabled}
            onClick={() => handleOpenSupportForm()}
          >
            {!isMobile ? (
              <img
                draggable={false}
                src={SupportOptionIcon.src}
                alt={t('AcPost.OptionsTab.OptionCard.supportBtn')}
              />
            ) : (
              <>
                <img
                  draggable={false}
                  src={SupportOptionIcon.src}
                  alt={t('AcPost.OptionsTab.OptionCard.supportBtn')}
                />
                <div>
                  {t('AcPost.OptionsTab.OptionCard.raiseBidBtn')}
                </div>
              </>
            )}
          </SSupportButton>
        )}
      </SContainer>
      <SSupportBidForm
        // layout
        layout="size"
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
              inputAlign="left"
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
              style={{
                padding: '12.5px 16px',
              }}
            />
            <Button
              view="primaryGrad"
              disabled={!supportBidAmount ? true : parseInt(supportBidAmount, 10) < minAmount}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('AcPost.OptionsTab.OptionCard.placeABidBtn')}
            </Button>
            <SCancelButton view="secondary" onClick={() => handleCloseSupportForm()}>
              {t('AcPost.OptionsTab.OptionCard.cancelBtn')}
            </SCancelButton>
          </>
        )}
        {isMobile ? (
          <OptionActionMobileModal isOpen={isSupportFormOpen} onClose={() => handleCloseSupportForm()} zIndex={12}>
            <SSuggestSupportMobileContainer>
              <div>{option.title}</div>
              <BidAmountTextInput
                value={supportBidAmount}
                inputAlign="left"
                autofocus={isSupportFormOpen}
                minAmount={minAmount}
                style={{
                  textAlign: 'center',
                  paddingLeft: '12px',
                }}
                onChange={(newValue: string) => setSupportBidAmount(newValue)}
              />
              <Button
                view="primaryGrad"
                size="sm"
                disabled={!supportBidAmount}
                onClick={() => handleTogglePaymentModalOpen()}
              >
                {t('AcPost.OptionsTab.ActionSection.placeABidBtn')}
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
          showTocApply
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          handlePayWithWallet={handlePayWithWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle variant={3}>{t('AcPost.paymenModalHeader.subtitle')}</SPaymentModalTitle>
            <SPaymentModalOptionText>{option.title}</SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      )}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
    </motion.div>
  );
};

AcOptionCard.defaultProps = {
  optionBeingSupported: undefined,
};

export default AcOptionCard;

const SContainer = styled(motion.div)<{
  isDisabled: boolean;
  isBlue: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme, isBlue }) => (isBlue ? theme.colorsThemed.accent.blue : theme.colorsThemed.background.tertiary)};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;

    padding: initial;
    background-color: initial;
    border-radius: initial;
  }
`;

const SBidDetails = styled.div<{
  isBlue: boolean;
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ isBlue }) => (isBlue ? (
    css`
      .spanRegular {
        color: #FFFFFF;
        opacity: 0.6;
      }
      .spanHighlighted {
        color: #FFFFFF;
      }
    `
  ) : null)}

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
    'amount bidders'
    'optionInfo optionInfo';
    grid-template-columns: 3fr 7fr;



    background-color: ${({ theme, isBlue }) => (isBlue ? theme.colorsThemed.accent.blue : theme.colorsThemed.background.tertiary)};
    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 14px;
  }
`;

const SBidAmount = styled.div`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  margin-bottom: 6px;
`;

const SCoinImg = styled.img`
  height: 24px;
`;

const SOptionInfo = styled(Text)`
  grid-area: optionInfo;

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
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

const SSupportButton = styled(Button)`
  width: 100%;

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    margin-right: 16px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    background: none;

    &:hover:enabled,
    &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
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
  width: auto;

  padding: 0px 12px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled,
  &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
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
