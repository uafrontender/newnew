import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Text from '../../atoms/Text';

import CardEllipseMenu from './CardEllipseMenu';
import CardEllipseModal from './CardEllipseModal';

// Icons
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

interface ICard {
  isPrimary: boolean;
  name: string;
  lastFourDigits: string;
}

const Card: React.FunctionComponent<ICard> = ({
  isPrimary,
  name,
  lastFourDigits,
}) => {
  const { t } = useTranslation('page-Profile');

  const { resizeMode } = useAppSelector((state) => state.ui);

  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  return (
    <SCard>
      <STopLine>
        {isPrimary && (
          <SCardPrimaryText variant={2} weight={700}>
            {t('Settings.sections.cards.primary')}
          </SCardPrimaryText>
        )}
        <SMoreButton
          view='quaternary'
          iconOnly
          onClick={() => setIsEllipseMenuOpen(true)}
        >
          <InlineSvg
            svg={MoreIconFilled}
            width={isMobileOrTablet ? '16px' : '24px'}
            height={isMobileOrTablet ? '16px' : '24px'}
          />
        </SMoreButton>
        {!isMobile && (
          <CardEllipseMenu
            isVisible={isEllipseMenuOpen}
            isPrimary={isPrimary}
            handleClose={() => setIsEllipseMenuOpen(false)}
          />
        )}
        {isMobile && (
          <CardEllipseModal
            isOpen={isEllipseMenuOpen}
            zIndex={10}
            isPrimary={isPrimary}
            onClose={() => setIsEllipseMenuOpen(false)}
          />
        )}
      </STopLine>
      <SCardMainInfo>
        <SCardPrimaryText variant={2} weight={700}>
          {name}
        </SCardPrimaryText>
        <Text variant={5} weight={700}>
          **** {lastFourDigits}
        </Text>
      </SCardMainInfo>
    </SCard>
  );
};

export default Card;

const SCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 190px;
  flex-shrink: 0;
  padding: 16px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: url('https://d3hqmhx7uxxlrw.cloudfront.net/assets/default-avatars-and-covers/cover_1.png');

  ${({ theme }) => theme.media.mobileM} {
    min-width: 311px;
  }
`;

const STopLine = styled.div`
  display: flex;
  align-items: center;
`;

const SCardPrimaryText = styled(Text)`
  opacity: 0.6;
`;

const SCardMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: auto;
  padding: 12px;
`;

const SMoreButton = styled(Button)`
  margin-left: auto;
  background-color: rgba(11, 10, 19, 0.2);
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background-color: ${({ theme }) => theme.colors.white};

    svg {
      fill: ${({ theme }) => theme.colorsThemed.button.color.alternative};
    }
  }
`;
