import { newnewapi } from 'newnew-api';
import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import UserAvatar from '../UserAvatar';
import { formatNumber } from '../../../utils/format';

interface ICreatorCard {
  creator: newnewapi.IUser;
  // TODO: make sign creator specific, get more data
  sign?: string;
  subscriptionPrice?: number;
}

export const CreatorCard: React.FC<ICreatorCard> = ({
  creator,
  sign,
  subscriptionPrice,
}) => {
  const { t } = useTranslation('common');

  return (
    <SCard showSubscriptionPrice={subscriptionPrice !== undefined}>
      <SUserAvatarContainer>
        <SUserAvatar>
          <UserAvatar avatarUrl={creator.avatarUrl ?? ''} />
        </SUserAvatar>
        {sign && <AvatarSign>{sign}</AvatarSign>}
      </SUserAvatarContainer>
      <SDisplayName>{creator.nickname}</SDisplayName>
      <SUserName>@{creator.username}</SUserName>
      {subscriptionPrice !== undefined && subscriptionPrice > 0 && (
        <SSubscriptionPrice>
          {t('creatorCard.subscriptionCost', {
            amount: formatNumber(subscriptionPrice / 100, true),
          })}
        </SSubscriptionPrice>
      )}
      <SBackground>
        <Image src={creator.coverUrl ?? ''} layout='fill' />
      </SBackground>
    </SCard>
  );
};

export default CreatorCard;

CreatorCard.defaultProps = {
  sign: '',
  subscriptionPrice: undefined,
};

const SCard = styled.div<{ showSubscriptionPrice: boolean }>`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  height: ${({ showSubscriptionPrice }) =>
    showSubscriptionPrice ? '185px' : '160px'};
  cursor: pointer;
  transition: 0.2s linear;
  &:hover {
    transform: translateY(-8px);
  }
`;

const SBackground = styled.div`
  height: 68px;
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
`;

const SUserAvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-top: 17px;
  margin-bottom: 10px;
`;

const SUserAvatar = styled.div`
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colorsThemed.background.primary};
  position: relative;
  z-index: 1;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const AvatarSign = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: -5px;
  padding: 0px 8px;
  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};
  color: #2c2c33;
  border-radius: 10px;
  height: 20px;
  font-size: 8px;
  line-height: 8px;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 2;
`;

const SDisplayName = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin: 0 0 5px;
`;

const SUserName = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSubscriptionPrice = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  margin-top: 5px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
