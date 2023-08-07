import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IAcBidCard {
  bid: newnewapi.Auction.Bid;
}

const AcBidCard: React.FunctionComponent<IAcBidCard> = ({ bid }) => {
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const { userUuid } = useAppState();
  const createdAtParsed = new Date((bid.createdAt?.seconds as number) * 1000);

  const handleRedirectToUser = () => {
    router.push(`/${bid.bidder?.username}`);
  };

  return (
    <motion.div
      key={bid.id.toString()}
      layout='position'
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      <SCardWrapper>
        <SAvatar
          onClick={(e) => {
            e.stopPropagation();
            handleRedirectToUser();
          }}
        >
          <img
            src={bid.bidder?.avatarUrl ?? ''}
            alt={bid.bidder?.username ?? ''}
            draggable={false}
          />
        </SAvatar>
        <SBidInfo>
          <SUsernameSpan onClick={() => handleRedirectToUser()}>
            {bid.bidder?.uuid !== userUuid ? bid.bidder?.username : t('me')}
          </SUsernameSpan>
          <SDidABidSpan>{t('acPost.optionsTab.bidCard.didABid')}</SDidABidSpan>
          <SAmountSpan>
            $
            {bid.amount?.usdCents
              ? `${((bid.amount?.usdCents as number) / 100).toFixed(2)}`
              : '00.00'}
          </SAmountSpan>
        </SBidInfo>
        <SBidDate>
          {createdAtParsed.getDate()}{' '}
          {createdAtParsed.toLocaleString('default', { month: 'short' })}{' '}
          {createdAtParsed.getFullYear()}{' '}
        </SBidDate>
      </SCardWrapper>
    </motion.div>
  );
};

export default AcBidCard;

const SCardWrapper = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  grid-template-areas:
    'avatar info'
    'avatar date';
  align-items: center;
`;

const SAvatar = styled.div`
  grid-area: avatar;

  overflow: hidden;
  border-radius: 50%;
  width: 24px;
  height: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  img {
    display: block;
    width: 24px;
    height: 24px;
  }
`;

const SBidInfo = styled.div`
  grid-area: info;
`;
const SUsernameSpan = styled.span`
  margin-right: 4px;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  transition: 0.2s linear;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;
const SDidABidSpan = styled.span`
  margin-right: 4px;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
const SAmountSpan = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SBidDate = styled.div`
  grid-area: date;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
