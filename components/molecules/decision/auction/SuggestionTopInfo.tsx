/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { placeBidOnAuction } from '../../../../api/endpoints/auction';

import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import LoadingModal from '../LoadingModal';
import PaymentModal from '../PaymentModal';
import PlaceBidForm from './PlaceBidForm';

import ShareIconFilled from '../../../../public/images/svg/icons/filled/Share.svg';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import SuggestionActionMobileModal from './SuggestionActionMobileModal';

interface ISuggestionTopInfo {
  creator: newnewapi.IUser;
  createdAtSeconds: number;
  suggestion: newnewapi.Auction.Option;
  postId: string;
  minAmount: number;
  amountInBids?: number;
  handleUpdateIsSupportedByUser: (id: number) => void;
}

const SuggestionTopInfo: React.FunctionComponent<ISuggestionTopInfo> = ({
  creator,
  createdAtSeconds,
  suggestion,
  postId,
  minAmount,
  amountInBids,
  handleUpdateIsSupportedByUser,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const createdAtParsed = new Date(createdAtSeconds * 1000);
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [menuOpen, setMenuOpen] = useState(false);

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
        optionId: suggestion.id,
        postUuid: postId,
      });

      const res = await placeBidOnAuction(makeBidPayload);

      if (!res.data
        || res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      // Mark the option as isSupportedByUser
      handleUpdateIsSupportedByUser(suggestion.id as number);

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
    handleUpdateIsSupportedByUser,
    supportBidAmount,
    suggestion.id,
    postId,
  ]);

  return (
    <SWrapper>
      <SBidsAmount>
        <span>
          $
          {((amountInBids ?? 0) / 100).toFixed(2)}
        </span>
        {' '}
        { t('PostTopInfo.in_bids') }
      </SBidsAmount>
      <CreatorCard>
        <SAvatarArea>
          <img
            src={creator.avatarUrl!! as string}
            alt={creator.username!!}
          />
        </SAvatarArea>
        <SUsername>
          { creator.uuid !== user.userData?.userUuid
            ? creator.username : t('me') }
        </SUsername>
        <SStartsAt>
          { createdAtParsed.getDate() }
          {' '}
          { createdAtParsed.toLocaleString('default', { month: 'short' }) }
          {' '}
          { createdAtParsed.getFullYear() }
          {' '}
        </SStartsAt>
      </CreatorCard>
      <SActionsDiv>
        <SShareButton
          view="transparent"
          iconOnly
          withDim
          withShrink
          style={{
            padding: '8px',
          }}
          onClick={() => {
          }}
        >
          <InlineSvg
            svg={ShareIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width="24px"
            height="24px"
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
            view="secondary"
            onClick={() => handleOpenSupportForm()}
          >
            { t('BidsTab.SuggestionCard.supportBtn') }
          </SSupportButton>
        )}
      </SActionsDiv>
      {!isMobile && isSupportFormOpen && (
        <SSupportBidForm>
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
            { t('BidsTab.SuggestionCard.placeABidBtn') }
          </Button>
          <SCancelButton
            view="secondary"
            onClick={() => handleCloseSupportForm()}
          >
            { t('BidsTab.SuggestionCard.cancelBtn') }
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
            <div>
              { suggestion.title }
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
              Place a bid
            </Button>
          </SSuggestSupportMobileContainer>
        </SuggestionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {isMobile && paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          onClose={() => setPaymentModalOpen(false)}
        >
          <PlaceBidForm
            suggestionTitle={suggestion.title}
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
    </SWrapper>
  );
};

SuggestionTopInfo.defaultProps = {
  amountInBids: undefined,
};

export default SuggestionTopInfo;

const SWrapper = styled.div`
  position: relative;
  display: grid;

  grid-template-areas:
    'stats stats stats'
    'userCard userCard actions'
  ;

  height: fit-content;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    grid-template-areas:
      'userCard stats actions'
    ;
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
    'avatar startsAt'
  ;
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
    background: ${({
    theme,
    view,
  }) => theme.colorsThemed.button.background[view!!]};
  }
`;

const SMoreButton = styled(Button)`
  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 0px;
  padding-right: 26px;

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

// Support suggestion
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
