import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import UserAvatar from '../UserAvatar';

interface IPackCard {
  className?: string;
  pack?: newnewapi.Pack;
  small?: boolean;
}

const PackCard: React.FC<IPackCard> = ({ className, pack, small = false }) => {
  const { t } = useTranslation('page-Packs');

  if (!pack) {
    return <SPackContainer className={className} small={small} holder />;
  }

  const expiresAtTime = (pack.subscriptionExpiresAt!.seconds as number) * 1000;
  const timeLeft = expiresAtTime - Date.now();
  const daysLeft = timeLeft / 1000 / 60 / 60 / 24;
  const monthsLeft = Math.floor(daysLeft / 30);

  return (
    <SPackContainer className={className} small={small}>
      <SUserInfo>
        <SUserAvatar
          small={small}
          avatarUrl={pack.creator?.avatarUrl || undefined}
        />
        <SUserData>
          <SDisplayName>{pack.creator?.nickname}</SDisplayName>
          <SUserName>{pack.creator?.username}</SUserName>
        </SUserData>
      </SUserInfo>
      {/* TODO: add Trans */}
      <SVotesLeft small={small}>
        {t('packs.votesLeft', { amount: pack.votesLeft })}
      </SVotesLeft>
      <SSubscriptionLeft>
        {t('packs.chatAccessLeft', { amount: monthsLeft })}
      </SSubscriptionLeft>
    </SPackContainer>
  );
};

export default PackCard;

const SPackContainer = styled.div<{ small: boolean; holder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-radius: 16px;
  padding: ${({ small }) => (small ? '16px' : '24px')};
  max-width: 300px;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  opacity: ${({ holder }) => (holder ? '0' : '1')};
  overflow: hidden;
`;

const SUserInfo = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`;

const SUserAvatar = styled(UserAvatar)<{ small: boolean }>`
  width: ${({ small }) => (small ? '36px' : '48px')};
  min-width: ${({ small }) => (small ? '36px' : '48px')};
  height: ${({ small }) => (small ? '36px' : '48px')};
  min-height: ${({ small }) => (small ? '36px' : '48px')};
`;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
  margin-left: 12px;
  overflow: hidden;
`;

const SDisplayName = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 5px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SUserName = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 12px;
  line-height: 16px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SVotesLeft = styled.p<{ small: boolean }>`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: ${({ small }) => (small ? '24px' : '28px;')};
  line-height: ${({ small }) => (small ? '32px' : '36px;')};

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SSubscriptionLeft = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
