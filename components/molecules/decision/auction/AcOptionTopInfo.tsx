/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../../redux-store/store';
// import { WalletContext } from '../../../../contexts/walletContext';
// import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import {
  createPaymentSession,
  // getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModalRedirectOnly';
import SuggestionActionMobileModal from '../OptionActionMobileModal';

import ShareIconFilled from '../../../../public/images/svg/icons/filled/Share.svg';

interface IAcOptionTopInfo {
  creator: newnewapi.IUser;
  createdAtSeconds: number;
  option: newnewapi.Auction.Option;
  postId: string;
  minAmount: number;
  amountInBids?: number;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
}

const AcOptionTopInfo: React.FunctionComponent<IAcOptionTopInfo> = ({
  creator,
  createdAtSeconds,
  option,
  postId,
  minAmount,
  amountInBids,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const createdAtParsed = new Date(createdAtSeconds * 1000);
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // const { walletBalance } = useContext(WalletContext);

  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [supportBidAmount, setSupportBidAmount] = useState('');

  const handleOpenSupportForm = () => {
    setIsSupportFormOpen(true);
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
  };

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
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

  //       setSupportBidAmount('');
  //       setIsSupportFormOpen(false);
  //       setPaymentModalOpen(false);
  //       setLoadingModalOpen(false);
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
  }, [user.loggedIn, supportBidAmount, option.id, postId, router.locale]);

  return (
    <SWrapper>
      <SBidsAmount>
        <span>${((amountInBids ?? 0) / 100).toFixed(2)}</span>{' '}
        {t('acPost.postTopInfo.inBids')}
      </SBidsAmount>
      <CreatorCard>
        <SAvatarArea>
          <img src={creator.avatarUrl ?? ''} alt={creator.username ?? ''} />
        </SAvatarArea>
        <SUsername>
          {creator.uuid !== user.userData?.userUuid
            ? creator.username
            : t('acPost.optionsTab.me')}
        </SUsername>
        <SStartsAt>
          {createdAtParsed.getDate()}{' '}
          {createdAtParsed.toLocaleString('default', { month: 'short' })}{' '}
          {createdAtParsed.getFullYear()}{' '}
        </SStartsAt>
      </CreatorCard>
      <SActionsDiv>
        <SShareButton
          view='transparent'
          iconOnly
          withDim
          withShrink
          style={{
            padding: '8px',
          }}
          onClick={() => {}}
        >
          <InlineSvg
            svg={ShareIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width='24px'
            height='24px'
          />
        </SShareButton>
        {isSupportFormOpen ? (
          <div
            style={{
              minWidth: '72px',
            }}
          />
        ) : (
          <SSupportButton
            view='secondary'
            onClick={() => handleOpenSupportForm()}
          >
            {t('acPost.optionsTab.optionCard.supportButton')}
          </SSupportButton>
        )}
      </SActionsDiv>
      {!isMobile && isSupportFormOpen && (
        <SSupportBidForm>
          <BidAmountTextInput
            value={supportBidAmount}
            inputAlign='left'
            onChange={(newValue: string) => setSupportBidAmount(newValue)}
            minAmount={minAmount}
          />
          <Button
            view='primaryGrad'
            disabled={
              !supportBidAmount ? true : parseInt(supportBidAmount) < minAmount
            }
            onClick={() => handleTogglePaymentModalOpen()}
          >
            {t('acPost.optionsTab.optionCard.placeABidButton')}
          </Button>
          <SCancelButton
            view='secondary'
            onClick={() => handleCloseSupportForm()}
          >
            {t('acPost.optionsTab.optionCard.cancelButton')}
          </SCancelButton>
        </SSupportBidForm>
      )}
      {isMobile ? (
        <SuggestionActionMobileModal
          isOpen={isSupportFormOpen}
          onClose={() => handleCloseSupportForm()}
          zIndex={12}
        >
          <SSuggestSupportMobileContainer>
            <div>{option.title}</div>
            <BidAmountTextInput
              value={supportBidAmount}
              inputAlign='center'
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view='primaryGrad'
              size='sm'
              disabled={!supportBidAmount}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('acPost.optionsTab.optionCard.placeABidButton')}
            </Button>
          </SSuggestSupportMobileContainer>
        </SuggestionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${supportBidAmount}`}
          showTocApply={!user?.loggedIn}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          // handlePayWithWallet={handlePayWithWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle variant={3}>
              {t('acPost.paymentModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText>{option.title}</SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
    </SWrapper>
  );
};

AcOptionTopInfo.defaultProps = {
  amountInBids: undefined,
};

export default AcOptionTopInfo;

const SWrapper = styled.div`
  position: relative;
  display: grid;

  grid-template-areas:
    'stats stats stats'
    'userCard userCard actions';

  height: fit-content;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    grid-template-areas: 'userCard stats actions';
    grid-template-rows: 40px;
    grid-template-columns: 1fr 1fr 120px;
    align-items: center;
  }
`;

// Creator card
const CreatorCard = styled.div`
  grid-area: userCard;

  display: grid;
  grid-template-areas:
    'avatar username'
    'avatar startsAt';
  grid-template-columns: 44px 1fr;

  height: 36px;
`;

const SAvatarArea = styled.div`
  grid-area: avatar;

  align-self: center;

  overflow: hidden;
  border-radius: 50%;
  width: 36px;
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SUsername = styled.div`
  grid-area: username;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SStartsAt = styled.div`
  grid-area: startsAt;

  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

// Action buttons
const SActionsDiv = styled.div`
  grid-area: actions;

  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;

const SShareButton = styled(Button)`
  background: none;

  padding: 0px;
  &:focus:enabled {
    background: ${({ theme, view }) =>
      view ? theme.colorsThemed.button.background[view] : ''};
  }
`;

// Auction
const SBidsAmount = styled.div`
  grid-area: stats;

  margin-bottom: 12px;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  span {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
    justify-self: flex-end;
  }
`;

// Support option
const SSupportButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover:enabled,
    &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;

const SSupportBidForm = styled(motion.div)`
  position: absolute;
  top: 100%;

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
