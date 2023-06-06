import React, { useState, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import useErrorToasts from '../../../utils/hooks/useErrorToasts';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Text from '../../atoms/Text';

import CardEllipseMenu from './CardEllipseMenu';
import CardEllipseModal from './CardEllipseModal';

// Icons
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import useCards from '../../../utils/hooks/useCards';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import { useAppSelector } from '../../../redux-store/store';

const getCardBrandName = (cardBrand: newnewapi.Card.CardBrand) => {
  switch (cardBrand) {
    case newnewapi.Card.CardBrand.VISA:
      return 'Visa';
    case newnewapi.Card.CardBrand.MASTERCARD:
      return 'Mastercard';
    case newnewapi.Card.CardBrand.AMEX:
      return 'American Express';
    case newnewapi.Card.CardBrand.DISCOVER:
      return 'Discover';
    case newnewapi.Card.CardBrand.JCB:
      return 'JCB';
    case newnewapi.Card.CardBrand.DINERS_CLUB:
      return 'Diners Club';
    case newnewapi.Card.CardBrand.UNIONPAY:
      return 'UnionPay';
    case newnewapi.Card.CardBrand.CARTES_BANCAIRES:
      return 'CB';
    default:
      return '';
  }
};

const getCardFunding = (cardFunding: newnewapi.Card.CardFunding) => {
  switch (cardFunding) {
    case newnewapi.Card.CardFunding.CREDIT:
      return 'Credit';
    case newnewapi.Card.CardFunding.DEBIT:
      return 'Debit';
    case newnewapi.Card.CardFunding.PREPAID:
      return 'Prepaid';
    default:
      return '';
  }
};

interface ICard {
  isPrimary: boolean;
  brand: newnewapi.Card.CardBrand;
  funding: newnewapi.Card.CardFunding;
  lastFourDigits: string;
  backgroundImg: string;
  cardId: string;
  disabledForActions: boolean;
}

const Card: React.FunctionComponent<ICard> = ({
  isPrimary,
  brand,
  funding,
  lastFourDigits,
  cardId,
  disabledForActions,
  backgroundImg,
}) => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastCustom } = useErrorToasts();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();

  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const moreButtonRef = useRef<HTMLButtonElement>();

  const { setPrimaryCardMutation, removeCardMutation } = useCards();

  const notWhitelisted = useMemo(
    () => user._persist?.rehydrated && !user?.userData?.options?.isWhiteListed,
    [user._persist?.rehydrated, user?.userData?.options?.isWhiteListed]
  );

  const handleCloseCardEllipseMenu = useCallback(
    () => setIsEllipseMenuOpen(false),
    []
  );

  const handelSetPrimaryCard = () => {
    Mixpanel.track('Set Primary Card', {
      _stage: 'Settings',
      _cardUuid: cardId,
    });
    setPrimaryCardMutation?.mutate(cardId);
  };

  const handleDeleteCard = () => {
    try {
      Mixpanel.track('Delete Card', {
        _stage: 'Settings',
        _cardUuid: cardId,
      });

      removeCardMutation?.mutate(cardId);
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    }
  };

  return (
    <SCard background={backgroundImg}>
      <STopLine>
        {isPrimary && (
          <SLabel>
            <SCardPrimaryText variant={5} weight={700}>
              {t('Settings.sections.cards.primary')}
            </SCardPrimaryText>
          </SLabel>
        )}

        {notWhitelisted && (
          <SMoreButton
            view='quaternary'
            iconOnly
            onClick={
              !disabledForActions ? () => setIsEllipseMenuOpen(true) : () => {}
            }
            ref={moreButtonRef as any}
          >
            <InlineSvg svg={MoreIconFilled} width='14px' height='14px' />
          </SMoreButton>
        )}

        {!isMobile && (
          <CardEllipseMenu
            isVisible={isEllipseMenuOpen}
            isPrimary={isPrimary}
            handleClose={handleCloseCardEllipseMenu}
            anchorElement={moreButtonRef.current}
            onSetPrimaryCard={handelSetPrimaryCard}
            onDeleteCard={handleDeleteCard}
          />
        )}
        {isMobile && (
          <CardEllipseModal
            isOpen={isEllipseMenuOpen}
            zIndex={10}
            isPrimary={isPrimary}
            onClose={() => setIsEllipseMenuOpen(false)}
            onSetPrimaryCard={handelSetPrimaryCard}
            onDeleteCard={handleDeleteCard}
          />
        )}
      </STopLine>
      <SCardMainInfo>
        <SCardName variant={5} weight={700}>
          {`${getCardFunding(funding)} ${getCardBrandName(brand)}`}
        </SCardName>
        <SCardNumber variant={5} weight={700}>
          **** {lastFourDigits}
        </SCardNumber>
      </SCardMainInfo>
    </SCard>
  );
};

export default Card;

const SCard = styled.div<{
  background: string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 190px;
  flex-shrink: 0;
  padding: 16px !important;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ background }) => `url(${background})`};
  background-repeat: no-repeat;
  background-size: cover;
`;

const SLabel = styled.div`
  ${({ theme }) => theme.media.tablet} {
    padding: 0 16px;
    background-color: ${({ theme }) =>
      theme.name === 'light' ? 'rgba(255, 255, 255, 0.2)' : '#0b0a1333'};
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
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(11, 10, 19, 0.2)'};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background-color: ${({ theme }) => theme.colors.white};

    svg {
      fill: ${({ theme }) => theme.colors.darkGray};
    }
  }

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    top: -8px;
    right: -8px;
  }
`;
