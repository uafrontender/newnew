/* eslint-disable react/no-array-index-key */
import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';

interface IOfferCard {
  className?: string;
  bundleLevel: number;
  bundleOffer: newnewapi.IBundleOffer;
  onClick: () => void;
}

const OfferCard: React.FC<IOfferCard> = ({
  className,
  bundleLevel,
  bundleOffer,
  onClick,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);

  const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

  return (
    <SBundleContainer className={className}>
      <BundleIconLine>
        {Array.from('x'.repeat(bundleLevel + 1)).map((v, index) => (
          <BundleLevelIcon
            key={index}
            src={theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src}
            index={index}
          />
        ))}
      </BundleIconLine>
      <SVotesNumber>
        <Trans
          t={t}
          i18nKey='modal.buyBundle.votes'
          // @ts-ignore
          components={[
            <VotesNumberSpan />,
            { amount: bundleOffer.votesAmount },
          ]}
        />
      </SVotesNumber>
      <AccessDescription>
        {t('modal.buyBundle.access', {
          amount: monthsOfAccess,
          unit: t(`modal.buyBundle.unit.${unitOfTimeLeft}`),
        })}
      </AccessDescription>
      <SDescriptionLine>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>
          {t('modal.buyBundle.customOptions')}
        </SDescriptionText>
      </SDescriptionLine>
      <SDescriptionLine last>
        <SBullet>
          <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
        </SBullet>
        <SDescriptionText>{t('modal.buyBundle.chat')}</SDescriptionText>
      </SDescriptionLine>
      <BuyButton onClick={onClick}>
        {t('modal.buyBundle.buy', {
          amount: bundleOffer.price!.usdCents! / 100,
        })}
      </BuyButton>
    </SBundleContainer>
  );
};

export default OfferCard;

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

const BundleIconLine = styled.div`
  height: 36px;
  width: 36px;
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 16px;
  overflow: hidden;
`;

const BundleLevelIcon = styled.img<{ index: number }>`
  width: 36px;
  height: 36px;
  position: absolute;
  left: ${({ index }) => `${11 * index}px`};
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

const BuyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 8px 16px;
  width: 100%;
  margin-top: 32px;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    min-width: 160px;
  }
`;
