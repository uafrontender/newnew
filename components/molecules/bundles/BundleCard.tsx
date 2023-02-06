import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import UserAvatar from '../UserAvatar';
import formatTimeLeft from '../../../utils/formatTimeLeft';
import BulletLine from './BulletLine';
import { formatNumber } from '../../../utils/format';
import InlineSvg from '../../atoms/InlineSVG';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import getDisplayname from '../../../utils/getDisplayname';

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
          <SDisplayNameContainer>
            <SDisplayName>{getDisplayname(creatorBundle.creator)}</SDisplayName>
            {creatorBundle.creator.options?.isVerified && (
              <SInlineSvg
                svg={VerificationCheckmark}
                width='24px'
                height='24px'
                fill='none'
              />
            )}
          </SDisplayNameContainer>
          <Link href={`/${creatorBundle.creator?.username}`}>
            <SUserName>{`@${creatorBundle.creator?.username}`}</SUserName>
          </Link>
        </SUserData>
      </SUserInfo>
      <SVotesLeft small={small}>
        <Trans
          t={t}
          i18nKey='bundle.votesLeft'
          // @ts-ignore
          components={[
            <VotesNumberSpan />,
            {
              amount: formatNumber(
                creatorBundle.bundle.votesLeft as number,
                true
              ),
            },
          ]}
        />
      </SVotesLeft>
      {formattedTimeLeft ? (
        <>
          <AccessDescription>
            <Trans
              t={t}
              i18nKey='bundle.access'
              // @ts-ignore
              components={[
                <>
                  {formattedTimeLeft.map((time, index) => (
                    <React.Fragment key={time.unit}>
                      {index > 0 ? t('bundle.and') : null}
                      {t('bundle.unitPair', {
                        amount: time.value,
                        unit: t(`bundle.unit.${time.unit}`),
                      })}
                    </React.Fragment>
                  ))}
                </>,
              ]}
            />
          </AccessDescription>
          <BundleFeatures>
            <BulletLine>{t('bundle.customOptions')}</BulletLine>
            <BulletLine>{t('bundle.chat')}</BulletLine>
          </BundleFeatures>
        </>
      ) : (
        <AccessDescription>{t('bundle.accessExpired')}</AccessDescription>
      )}
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
    max-width: 400px;
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
  border-radius: 50%;
`;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  overflow: hidden;
`;

const SDisplayNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SDisplayName = styled.p`
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SInlineSvg = styled(InlineSvg)`
  flex-shrink: 0;
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
  cursor: pointer;
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
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.accent.yellow};
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
