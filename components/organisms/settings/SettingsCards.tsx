/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Card from '../../molecules/settings/Card';

import assets from '../../../constants/assets';
import addIcon from '../../../public/images/svg/icons/filled/Add.svg';

const CARDS = [
  {
    id: 1,
    isPrimary: true,
    name: 'Debit Mastercard',
    lastFourDigits: '9005',
  },
  {
    id: 2,
    isPrimary: false,
    name: 'Debit Mastercard',
    lastFourDigits: '4003',
  },
  {
    id: 3,
    isPrimary: false,
    name: 'Debit Mastercard',
    lastFourDigits: '9905',
  },
];

interface ISettingsCards {}

const SettingsCards: React.FunctionComponent<ISettingsCards> = () => {
  const { t } = useTranslation('page-Profile');

  return (
    <SSettingsContainer>
      {/* To prevent styles override for SCardsContainer */}
      <div />
      <SCardsContainer>
        <Text variant={1} weight={600}>
          {t('Settings.sections.cards.myPaymentMethods')}
        </Text>
        <SButtonSecondaryDesktop view='secondary'>
          {t('Settings.sections.cards.button.addCard')}
        </SButtonSecondaryDesktop>

        <SButtonSecondaryMobile view='secondary' iconOnly>
          <InlineSVG
            svg={addIcon}
            // fill={theme.colors.white}
            width='20px'
            height='20px'
          />
        </SButtonSecondaryMobile>

        <SSubText variant={3}>
          {t('Settings.sections.cards.saveUpCards', { numbersOfCards: 5 })}
        </SSubText>
        {!CARDS.length && (
          <SButton view='quaternary'>
            <SCoinIcon
              src={assets.decision.gold}
              alt='coin'
              draggable={false}
            />
            {t('Settings.sections.cards.button.addPaymentMethod')}
          </SButton>
        )}
        <SCardList>
          {CARDS.map((card) => (
            <SCardListItem>
              <Card
                isPrimary={card.isPrimary}
                name={card.name}
                lastFourDigits={card.lastFourDigits}
              />
            </SCardListItem>
          ))}
        </SCardList>
      </SCardsContainer>
    </SSettingsContainer>
  );
};

export default SettingsCards;

const SSettingsContainer = styled.div`
  padding-bottom: 24px;
`;

const SCardsContainer = styled.div`
  position: relative;
  padding: 16px;
  padding-top: 40px;
  overflow: hidden;

  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    padding: 40px 24px 24px;
  }
`;

const SSubText = styled(Text)`
  margin-top: 8px;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 400;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
  }
`;

const SButton = styled(Button)`
  padding: 24px;
  margin-top: 24px;

  & > span {
    display: flex;
    align-items: center;
  }
`;

const SButtonSecondary = styled(Button)`
  position: absolute;
  right: 12px;
  top: 30px;
`;

const SButtonSecondaryDesktop = styled(SButtonSecondary)`
  display: none;
  padding: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

const SButtonSecondaryMobile = styled(SButtonSecondary)`
  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;

const SCoinIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 20px;
`;

const SCardList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;

  ${({ theme }) => theme.media.mobileL} {
    flex-direction: row;
    margin: 0 -24px;

    overflow-y: scroll;

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

const SCardListItem = styled.li`
  margin-bottom: 16px;
  flex: 1;

  &:last-child {
    margin-bottom: 0;
  }

  ${({ theme }) => theme.media.mobileL} {
    margin-right: 16px;
    margin-bottom: 0;
    max-width: 311px;

    &:last-child {
      margin-right: 24px;
    }

    &:first-child {
      margin-left: 24px;
    }
  }
`;
