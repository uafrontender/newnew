import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';

interface IPackCard {
  className?: string;
  creatorPack?: newnewapi.ICreatorPack;
  small?: boolean;
}

const PackCard: React.FC<IPackCard> = ({
  className,
  creatorPack,
  small = false,
}) => {
  const { t } = useTranslation('page-Packs');

  if (!creatorPack || !creatorPack.pack || !creatorPack.creator) {
    return <SPackContainer className={className} small={small} holder />;
  }

  const expiresAtTime =
    (creatorPack.pack.accessExpiredAt!.seconds as number) * 1000;
  const timeLeft = expiresAtTime - Date.now();
  const daysLeft = timeLeft / 1000 / 60 / 60 / 24;
  const monthsLeft = Math.floor(daysLeft / 30);

  return (
    <SPackContainer className={className} small={small}>
      <SUserInfo>
        <SUserAvatar
          small={small}
          avatarUrl={creatorPack.creator?.avatarUrl || undefined}
        />
        <SUserData>
          <SDisplayName>{creatorPack.creator?.nickname}</SDisplayName>
          <SUserName>@{creatorPack.creator?.username}</SUserName>
        </SUserData>
      </SUserInfo>
      {/* TODO: add Trans */}
      <SVotesLeft small={small}>
        {t('pack.votesLeft', { amount: creatorPack.pack.votesLeft })}
      </SVotesLeft>
      <SDescriptionLine>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>
          {t('pack.chatAccessLeft', { amount: monthsLeft })}
        </SDescriptionText>
      </SDescriptionLine>
      <SDescriptionLine>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>{t('pack.customOptions')}</SDescriptionText>
      </SDescriptionLine>
      <SDescriptionLine last>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>{t('pack.expiation')}</SDescriptionText>
      </SDescriptionLine>
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
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  opacity: ${({ holder }) => (holder ? '0' : '1')};
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    max-width: 300px;
  }
`;

const SUserInfo = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 32px;
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

  margin-bottom: 16px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SDescriptionLine = styled.div<{ last?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ last }) => (last ? '0px' : '8px;')};
  width: 100%;

  overflow: hidden;
`;

const SBullet = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-top: 4px;
  margin-right: 8px;
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SDescriptionText = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
