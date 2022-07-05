/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Card from '../../molecules/settings/Card';

import addIconFilled from '../../../public/images/svg/icons/filled/Create.svg';

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
  const theme = useTheme();

  return (
    <SSettingsContainer>
      <SCardsContainer $isNoCards={CARDS.length === 0}>
        <Text variant={1} weight={600}>
          {t('Settings.sections.cards.myPaymentMethods')}
        </Text>
        {!!CARDS.length && (
          <SButtonSecondaryDesktop view='secondary'>
            {t('Settings.sections.cards.button.addCard')}
          </SButtonSecondaryDesktop>
        )}

        <SButtonSecondaryMobile view='secondary' iconOnly>
          <InlineSVG
            svg={addIconFilled}
            fill={theme.name === 'light' ?  theme.colors.darkGray : theme.colors.white }
            width='24px'
            height='24px'
          />
        </SButtonSecondaryMobile>

        {!CARDS.length && (
          <>
            <SSubText variant={3}>
              {t('Settings.sections.cards.hint')}
            </SSubText>
            <SButton size="sm">
              {t('Settings.sections.cards.button.addNewCard')}
            </SButton>
          </>
        )}
        <SCardList>
          {CARDS.map((card) => (
            <SCardListItem key={card.id}>
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

const SCardsContainer = styled.div<{
  $isNoCards: boolean;
}>`
  position: relative;
  padding: ${({ $isNoCards }) => $isNoCards ? '30px 16px' : '16px'};
  min-height: 243px;
  overflow: hidden;

  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ $isNoCards }) => 
    $isNoCards ?
      css`
        display: flex;
        flex-direction: column;
        align-items: center;
      `
      :
      css`
        display: block;
      `
  }

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ $isNoCards }) => $isNoCards ? '30px 24px' : '24px'};
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
  margin-top: auto;

  & > span {
    display: flex;
    align-items: center;
  }
`;

const SButtonSecondary = styled(Button)`
  position: absolute;
  right: 12px;
  top: 16px;
`;

const SButtonSecondaryDesktop = styled(SButtonSecondary)`
  display: none;
  padding: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

const SButtonSecondaryMobile = styled(Button)`
  position: absolute;
  right: 8px;
  top: 10px;
  padding: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }

  & path {
    fill: ${({ theme }) => theme.name === 'light' ? theme.colors.white: theme.colors.darkGray};
  }
`;

const SCardList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin-top: 24px;

  ${({ theme }) => theme.media.mobileL} {
    flex-direction: row;
    margin: 24px -24px 0;

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
    max-width: 320px;

    &:last-child {
      margin-right: 24px;
    }

    &:first-child {
      margin-left: 24px;
    }
  }
`;
