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
            <SCardPrimaryText variant={3} weight={700}>
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
          <InlineSvg
            svg={MoreIconFilled}
            width="14px"
            height="14px"
          />
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
        <SCardPrimaryText variant={2} weight={700}>
          {name}
        </SCardPrimaryText>
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
  padding: 8px;

  border-radius: ${({ theme }) => theme.borderRadius.smallLg};
  background: url('https://d3hqmhx7uxxlrw.cloudfront.net/assets/default-avatars-and-covers/cover_1.png');

  ${({ theme }) => theme.media.mobileM} {
    min-width: 311px;
  }
`;

const SLabel = styled.div`
  padding: 2px 16px;
  background-color: #0B0A1333;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const STopLine = styled.div`
  display: flex;
  align-items: center;
`;

const SCardPrimaryText = styled(Text)`
  color: ${({ theme }) => theme.colors.white};
`;

const SCardNumber = styled(Text)`
  color: ${({ theme }) => theme.colors.white};
`

const SCardMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: auto;
  padding: 16px;

  & > div:first-child {
    opacity: 0.6;
  }
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
      fill: #2C2C33;
    }
  }
`;
