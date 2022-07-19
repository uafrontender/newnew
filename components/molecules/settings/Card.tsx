import React, { useState, useRef } from 'react';
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

  const moreButtonRef: any = useRef();

  return (
    <SCard>
      <STopLine>
        {isPrimary && (
          <SLabel>
            <SCardPrimaryText variant={5} weight={700}>
              {t('Settings.sections.cards.primary')}
            </SCardPrimaryText>
          </SLabel>
        )}
        <SMoreButton
          view='quaternary'
          iconOnly
          onClick={() => setIsEllipseMenuOpen(true)}
          ref={moreButtonRef}
        >
          <InlineSvg svg={MoreIconFilled} width='14px' height='14px' />
        </SMoreButton>
        {!isMobile && (
          <CardEllipseMenu
            isVisible={isEllipseMenuOpen}
            isPrimary={isPrimary}
            handleClose={() => setIsEllipseMenuOpen(false)}
            anchorElement={moreButtonRef.current}
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
        <SCardName variant={5} weight={700}>
          {name}
        </SCardName>
        <SCardNumber variant={5} weight={700}>
          **** {lastFourDigits}
        </SCardNumber>
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
  padding: 16px !important;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: url('https://d3hqmhx7uxxlrw.cloudfront.net/assets/default-avatars-and-covers/cover_1.png');

  ${({ theme }) => theme.media.mobileM} {
    min-width: 320px;
  }
`;

const SLabel = styled.div`
  ${({ theme }) => theme.media.tablet} {
    padding: 0 16px;
    background-color: #0b0a1333;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const STopLine = styled.div`
  display: flex;
  align-items: center;
`;

const SCardPrimaryText = styled(Text)`
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 24px;
  }
`;

const SCardName = styled(Text)`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SCardNumber = styled(Text)`
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  line-height: 28px;
`;

const SCardMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: auto;
  padding: 8px;

  ${({ theme }) => theme.media.tablet} {
    padding: 9px 8px;
  }
`;

const SMoreButton = styled(Button)`
  margin-left: auto;
  background-color: rgba(11, 10, 19, 0.2);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background-color: ${({ theme }) => theme.colors.white};

    svg {
      fill: #2c2c33;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    top: -8px;
    right: -8px;
  }
`;
