import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import BulletLine from './BulletLine';
import { formatNumber } from '../../../utils/format';
import HighlightedButton from '../../atoms/bundles/HighlightedButton';
import assets from '../../../constants/assets';

interface IBundleOfferCard {
  className?: string;
  bundleLevel: number;
  bundleOffer: newnewapi.IBundleOffer;
  onClick: () => void;
}

const BundleOfferCard: React.FC<IBundleOfferCard> = ({
  className,
  bundleLevel,
  bundleOffer,
  onClick,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);

  const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

  return (
    <SBundleContainer className={className}>
      <SBundleIcon
        src={
          theme.name === 'light'
            ? assets.bundles.lightVotes[bundleLevel].animated()
            : assets.bundles.darkVotes[bundleLevel].animated()
        }
        alt='Bundle votes'
      />
      <SVotesNumber>
        <Trans
          t={t}
          i18nKey='modal.buyBundle.votes'
          // @ts-ignore
          components={[
            <VotesNumberSpan />,
            { amount: formatNumber(bundleOffer.votesAmount! as number, true) },
          ]}
        />
      </SVotesNumber>
      <AccessDescription>
        {t('modal.buyBundle.access', {
          amount: monthsOfAccess,
          unit: t(`modal.buyBundle.unit.${unitOfTimeLeft}`),
        })}
      </AccessDescription>
      <BundleFeatures>
        <BulletLine>{t('modal.buyBundle.customOptions')}</BulletLine>
        <BulletLine>{t('modal.buyBundle.chat')}</BulletLine>
      </BundleFeatures>
      <BuyButton id={`buy-bundle-${bundleLevel}-button`} onClick={onClick}>
        {t('modal.buyBundle.buy', {
          amount: bundleOffer.price!.usdCents! / 100,
        })}
      </BuyButton>
    </SBundleContainer>
  );
};

export default BundleOfferCard;

const SBundleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-radius: 16px;
  padding: 24px;
  background-color: ${(props) => props.theme.colorsThemed.background.tertiary};
  overflow: hidden;
`;

const SBundleIcon = styled.img`
  height: 36px;
  width: 36px;
  margin-bottom: 16px;
`;

const SVotesNumber = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 28px;
  line-height: 36px;

  margin-bottom: 16px;

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

const BuyButton = styled(HighlightedButton)`
  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 160px;
  }
`;
