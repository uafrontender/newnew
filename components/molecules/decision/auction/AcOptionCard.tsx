/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import styled, { css } from 'styled-components';
import { placeBidOnAuction } from '../../../../api/endpoints/auction';

import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import Text from '../../../atoms/Text';
import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';
import LoadingModal from '../LoadingModal';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceAcBidForm';
import OptionActionMobileModal from '../OptionActionMobileModal';
import { formatNumber } from '../../../../utils/format';

import Lottie from '../../../atoms/Lottie';

// NB! temp sample
import HeartsSampleAnimation from '../../../../public/animations/hearts-sample.json';
import CoinsSampleAnimation from '../../../../public/animations/coins-sample.json';

interface IAcOptionCard {
  option: TAcOptionWithHighestField;
  shouldAnimate: boolean;
  postId: string;
  index: number;
  optionBeingSupported?: string;
  minAmount: number;
  handleSetSupportedBid: (id: string) => void;
  handleAddOrUpdateOptionFromResponse: (newOption: newnewapi.Auction.Option) => void;
  handleOpenOptionBidHistory: () => void;
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
  handleOpenOptionBidHistory,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const myVote = useMemo(() => option.isSupportedByUser, [option.isSupportedByUser]);
  const myBid = useMemo(() => option.creator?.uuid === user.userData?.userUuid, [
    option.creator?.uuid,
    user.userData?.userUuid,
  ]);
  const bgVariant = highest ? 'yellow' : (
    myBid ? 'blue' : myVote ? 'green' : undefined);

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
  const handleRedirectToUser = () => router.push(`/u/${option.creator?.username}`);

  // Payment and Loading modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  // Handlers
  const handleTogglePaymentModalOpen = () => {
    if (!user.loggedIn) {
      router.push('/sign-up?reason=bid');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleSubmitSupportBid = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const makeBidPayload = new newnewapi.PlaceBidRequest({
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(supportBidAmount, 10) * 100,
        }),
        optionId: option.id,
        postUuid: postId,
      });

      const res = await placeBidOnAuction(makeBidPayload);

      if (!res.data
        || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      const optionFromResponse = (res.data.option as newnewapi.Auction.Option)!!;
      optionFromResponse.isSupportedByUser = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);

      handleSetSupportedBid('');
      setSupportBidAmount('');
      setIsSupportFormOpen(false);
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
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
  ]);

  return (
    <motion.div
      key={index}
      // layout="position"
      // transition={{
      //   type: 'spring',
      //   damping: 20,
      //   stiffness: 300,
      // }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '16px',
        ...(!isMobile && isSupportFormOpen ? {
          gap: '16px',
        } : {}),
      }}
    >
      <SContainer
        // layout="position"
        // transition={{
        //   type: 'spring',
        //   damping: 20,
        //   stiffness: 300,
        // }}
        isDisabled={disabled}
      >
        <SBidDetails
          bgVariant={bgVariant}
          onClick={() => {
            if (optionBeingSupported) return;
            handleOpenOptionBidHistory();
          }}
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
          <SBidInfo>
            {highest
              ? (
                <STag>{t('AcPost.OptionsTab.tags.highest')}</STag>
              ) : null}
            {myVote
              && !myBid
              ? (
                <STag>{t('AcPost.OptionsTab.tags.my_vote')}</STag>
              ) : null}
            {myBid
              ? (
                <STag>{t('AcPost.OptionsTab.tags.my_bid')}</STag>
              ) : null}
            {/* Comment out for now */}
            {/* {option.creator.isVIP
              ? (
                <STag>{t('AcPost.OptionsTab.tags.vip')}</STag>
              ) : null} */}
            <SAvatar
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
              src={option?.creator?.avatarUrl!! as string}
              alt={option?.creator?.username!!}
              draggable={false}
            />
            <SUsername
              isColored={bgVariant !== undefined}
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
            >
              { option.creator?.uuid === user.userData?.userUuid
                ? t('me') : option?.creator?.username }
            </SUsername>
            <SBidTitle
              variant={3}
            >
              { option.title }
            </SBidTitle>
          </SBidInfo>
          <SAmount>
            {option.totalAmount?.usdCents
              ? (
                `$${formatNumber((option?.totalAmount?.usdCents / 100) ?? 0, true)}`
              ) : '$0'}
          </SAmount>
          {myVote || myBid ? (
            <SDoubleMyVote>
              <SDoubleMyVoteCaption>
                { t('AcPost.OptionsTab.OptionCard.doubleMyVoteCaption') }
              </SDoubleMyVoteCaption>
              <SDoubleMyVoteButton>
              { t('AcPost.OptionsTab.OptionCard.doubleMyVoteButton') }
              </SDoubleMyVoteButton>
            </SDoubleMyVote>
          ) : null}
        </SBidDetails>
        {(myBid || myVote) ? null : optionBeingSupported && !disabled ? (
          <div
            style={{
              minWidth: isMobileOrTablet ? '82px' : '92px',
            }}
          />
        ) : (
          <SSupportButton
            view="secondary"
            disabled={disabled}
            onClick={() => handleOpenSupportForm()}
          >
            { t('AcPost.OptionsTab.OptionCard.supportBtn') }
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
            horizontalPadding="20px"
            onChange={(newValue: string) => setSupportBidAmount(newValue)}
            minAmount={minAmount}
          />
          <Button
            view="primaryGrad"
            disabled={!supportBidAmount ? true : parseInt(supportBidAmount, 10) < minAmount}
            onClick={() => handleTogglePaymentModalOpen()}
          >
            { t('AcPost.OptionsTab.OptionCard.placeABidBtn') }
          </Button>
          <SCancelButton
            view="secondary"
            onClick={() => handleCloseSupportForm()}
          >
            { t('AcPost.OptionsTab.OptionCard.cancelBtn') }
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
            <div>
              { option.title }
            </div>
            <BidAmountTextInput
              value={supportBidAmount}
              inputAlign="left"
              horizontalPadding="16px"
              onChange={(newValue: string) => setSupportBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={!supportBidAmount}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              { t('AcPost.OptionsTab.ActionSection.placeABidBtn') }
            </Button>
          </SSuggestSupportMobileContainer>
        </OptionActionMobileModal>
      ) : null}
      </SSupportBidForm>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            optionTitle={option.title}
            amountRounded={supportBidAmount}
            handlePlaceBid={handleSubmitSupportBid}
          />
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </motion.div>
  );
};

AcOptionCard.defaultProps = {
  optionBeingSupported: undefined,
};

export default AcOptionCard;

const SContainer = styled(motion.div)<{
  isDisabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: calc(100% - 16px);

  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
`;

const SBidDetails = styled.div<{
  bgVariant?: 'yellow' | 'green' | 'blue';
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'info amount'
    'doubleVote doubleVote'
  ;
  grid-template-columns: 7fr 1fr;
  gap: 16px;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ bgVariant }) => (
    bgVariant
      ? css`
        background: ${({ theme }) => theme.gradients.decisionOption[bgVariant]};
      ` : null
  )};

  &:hover {
    cursor: pointer;
  }
`;

const SLottieAnimationContainer = styled.div`
  position: absolute;
  top: -29px;
  left: -20px;

  z-index: 100;
`;

const SBidInfo = styled.div`
  grid-area: info;

  /* display: flex; */
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;


  vertical-align: middle;
  line-height: 24px;
`;

const STag = styled.span`
  background-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 50px;
  padding: 6px;

  font-weight: bold;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.background.primary};

  margin-right: 8px;
`;

const SAvatar = styled.img`
  position: relative;
  top: 7.5px;

  display: inline;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  margin-right: 8px;

  cursor: pointer;
`;

const SUsername = styled.div<{
  isColored?: boolean;
}>`
  display: inline;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme, isColored }) => (isColored ? 'rgba(255, 255, 255, 0.8)' : theme.colorsThemed.text.secondary)};
  margin-right: 8px;

  transition: 0.2s linear;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBidTitle = styled(Text)`
  display: inline;
  line-break: loose;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

const SAmount = styled.div`
  grid-area: amount;
  align-self: center;
  justify-self: flex-end;


  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SDoubleMyVote = styled.div`
  grid-area: doubleVote;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 12px 16px;
  gap: 8px;

  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: nowrap;
  }
`;

const SDoubleMyVoteCaption = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: #FFFFFF;
`;

const SDoubleMyVoteButton = styled(Button)`
  background: #FFFFFF;
  color: #2C2C33;
  width: 100%;
  height: 48px;

  &:focus:enabled,
  &:hover:enabled  {
    background: #FFFFFF;
  }

  ${({ theme }) => theme.media.tablet} {
    flex-wrap: fit-content;
  }
`;

const SSupportButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    margin-right: 16px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover:enabled, &:focus:enabled {
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
  margin-right: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled, &:focus:enabled {
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
