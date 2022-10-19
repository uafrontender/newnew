import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import UserAvatar from '../UserAvatar';
import formatTimeLeft from '../../../utils/formatTimeLeft';
import BulletLine from './BulletLine';

interface IBundleCard {
  className?: string;
  creatorBundle?: newnewapi.ICreatorBundle;
  small?: boolean;
}

const BundleCard: React.FC<IBundleCard> = ({
  className,
  creatorBundle,
  small = false,
}) => {
  const { t } = useTranslation('page-Bundles');

  if (!creatorBundle || !creatorBundle.bundle || !creatorBundle.creator) {
    return <SBundlesContainer className={className} small={small} holder />;
  }

  const expiresAtTime =
    (creatorBundle.bundle.accessExpiresAt!.seconds as number) * 1000;
  const timeLeft = expiresAtTime - Date.now();
  const formattedTimeLeft = formatTimeLeft(timeLeft);

  return (
    <SBundlesContainer className={className} small={small}>
      <SUserInfo>
        <SUserAvatar
          small={small}
          avatarUrl={creatorBundle.creator?.avatarUrl || undefined}
        />
        <SUserData>
          <SDisplayName>{creatorBundle.creator?.nickname}</SDisplayName>
          <SUserName>@{creatorBundle.creator?.username}</SUserName>
        </SUserData>
      </SUserInfo>
      <SVotesLeft small={small}>
        <Trans
          t={t}
          i18nKey='bundle.votesLeft'
          // @ts-ignore
          components={[
            <VotesNumberSpan />,
            { amount: creatorBundle.bundle.votesLeft },
          ]}
        />
      </SVotesLeft>
      <AccessDescription>
        {t('bundle.access', {
          amount: formattedTimeLeft.value,
          unit: t(`bundle.unit.${formattedTimeLeft.unit}`),
        })}
      </AccessDescription>
      <BundleFeatures>
        <BulletLine>{t('bundle.customOptions')}</BulletLine>
        <BulletLine>{t('bundle.chat')}</BulletLine>
      </BundleFeatures>
    </SBundlesContainer>
  );
};

export default BundleCard;

const SBundlesContainer = styled.div<{ small: boolean; holder?: boolean }>`
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

  margin-bottom: 12px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const AccessDescription = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 12px;
`;

const BundleFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
