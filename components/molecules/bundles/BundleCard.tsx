import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';
import formatTimeLeft from '../../../utils/formatTimeLeft';

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
      <SDescriptionLine>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>{t('bundle.customOptions')}</SDescriptionText>
      </SDescriptionLine>
      <SDescriptionLine last>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>{t('bundle.chat')}</SDescriptionText>
      </SDescriptionLine>
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
