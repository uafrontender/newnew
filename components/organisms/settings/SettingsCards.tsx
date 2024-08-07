import React, { useState, useMemo } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Card from '../../molecules/settings/Card';
import AddCardModal from '../../molecules/settings/AddCardModal';
import Lottie from '../../atoms/Lottie';

import addIconFilled from '../../../public/images/svg/icons/filled/Create.svg';
import logoAnimation from '../../../public/animations/mobile_logo.json';
import assets from '../../../constants/assets';
import useCards from '../../../utils/hooks/useCards';
import { useUserData } from '../../../contexts/userDataContext';
import useHorizontalDraggableScroll from '../../../utils/hooks/useHorizontalDraggableScroll';
import { Mixpanel } from '../../../utils/mixpanel';

interface ISettingsCards {}

const SettingsCards: React.FunctionComponent<ISettingsCards> = () => {
  const { t } = useTranslation('page-Profile');
  const theme = useTheme();
  const { cards, isCardsLoading } = useCards();
  const { userData } = useUserData();

  const [isAddCardModal, setIsAddCardModal] = useState(false);

  const { scrollContainerRef, onMouseDown, onMouseMove, onMouseUp } =
    useHorizontalDraggableScroll<HTMLUListElement>();

  const openAddCardModal = () => {
    Mixpanel.track('Open Add Card Modal', {
      _stage: 'Settings',
    });
    setIsAddCardModal(true);
  };

  const cardsWithFirstPrimary = useMemo(
    () =>
      cards.sort((cardA, cardB) => {
        if (cardA.isPrimary) {
          return -1;
        }

        if (cardB.isPrimary) {
          return 1;
        }

        return 0;
      }),
    [cards]
  );

  // TODO: ideally store background for card in the DB
  const backgroundsByCardUuid = useMemo(
    () => {
      const obj: { [key: string]: string } = {};
      cards.forEach((card, index) => {
        obj[card.cardUuid! as string] =
          assets.cards.background[index % assets.cards.background.length];
      });

      return obj;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // cards, - prevents background updates on cards order change if primary card has changed, so cards has static backgrounds for one session
      cards.length, // update on number of cards changed
    ]
  );

  const notWhitelisted = useMemo(
    () => userData && !userData?.options?.isWhiteListed,
    [userData]
  );

  return (
    <SSettingsContainer>
      <SCardsContainer isNoCards={cards.length === 0}>
        <STitle variant={1} weight={600} isNoCards={cards.length === 0}>
          {t('Settings.sections.cards.myPaymentMethods')}
        </STitle>
        {/* TODO: make cards section look more real, handle WL creator adds aa card case */}
        {cards.length > 0 && (
          <>
            <SButtonSecondaryDesktop
              view='secondary'
              onClick={notWhitelisted ? openAddCardModal : () => {}}
            >
              {t('Settings.sections.cards.button.addCard')}
            </SButtonSecondaryDesktop>
            <SButtonSecondaryMobile
              view='secondary'
              iconOnly
              onClick={
                !userData?.options?.isWhiteListed ? openAddCardModal : () => {}
              }
            >
              <InlineSVG
                svg={addIconFilled}
                fill={
                  theme.name === 'light'
                    ? theme.colors.darkGray
                    : theme.colors.white
                }
                width='24px'
                height='24px'
              />
            </SButtonSecondaryMobile>
          </>
        )}

        {/* Empty cards view */}
        {cards.length === 0 && (
          <>
            {!isCardsLoading && (
              <>
                <SSubText variant={3} weight={600}>
                  {t('Settings.sections.cards.hint')}
                </SSubText>

                <SButton id='add-new-card' size='sm' onClick={openAddCardModal}>
                  {t('Settings.sections.cards.button.addNewCard')}
                </SButton>
              </>
            )}
            {isCardsLoading && (
              <SLoader>
                <Lottie
                  width={75}
                  height={75}
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: logoAnimation,
                  }}
                />
              </SLoader>
            )}
          </>
        )}

        {cards.length > 0 && (
          <SCardList
            ref={scrollContainerRef}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseUp}
          >
            {cardsWithFirstPrimary.map((card, index) => (
              <SCardListItem key={card.cardUuid}>
                <Card
                  cardId={card.cardUuid as string}
                  isPrimary={!!card.isPrimary}
                  brand={card.brand as newnewapi.Card.CardBrand}
                  funding={card.funding as newnewapi.Card.CardFunding}
                  lastFourDigits={card.last4 as string}
                  backgroundImg={
                    backgroundsByCardUuid[card.cardUuid! as string] ||
                    assets.cards.background[
                      index % assets.cards.background.length
                    ]
                  }
                  disabledForActions={!!userData?.options?.isWhiteListed}
                />
              </SCardListItem>
            ))}
          </SCardList>
        )}
      </SCardsContainer>

      <AddCardModal
        show={isAddCardModal}
        closeModal={() => {
          Mixpanel.track('Close Add Card Modal', {
            _stage: 'Settings',
          });
          setIsAddCardModal(false);
        }}
      />
    </SSettingsContainer>
  );
};

export default SettingsCards;

const SSettingsContainer = styled.div`
  padding-bottom: 24px;
`;

const STitle = styled(Text)<{
  isNoCards: boolean;
}>`
  ${({ isNoCards }) =>
    isNoCards
      ? css`
          font-size: 24px;
          line-height: 32px;
          font-weight: 700;
          text-align: center;

          ${({ theme }) => theme.media.tablet} {
            font-weight: 600;
          }
        `
      : css`
          margin-bottom: 24px;

          ${({ theme }) => theme.media.tablet} {
            margin-bottom: 32px;

            font-size: 24px;
            line-height: 32px;
          }
        `}
`;

const SCardsContainer = styled.div<{
  isNoCards: boolean;
}>`
  position: relative;
  padding: ${({ isNoCards }) =>
    isNoCards ? '30px 16px 32px' : '16px !important'};
  min-height: 243px;
  overflow: hidden;

  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ isNoCards }) =>
    isNoCards
      ? css`
          display: flex;
          flex-direction: column;
          align-items: center;
        `
      : css`
          display: block;
        `}

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ isNoCards }) =>
      isNoCards ? '30px 24px 31px' : '24px !important'};
  }
`;

const SSubText = styled(Text)`
  margin-top: 8px;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 400;
  text-align: center;

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

const SButtonSecondaryDesktop = styled(Button)`
  display: none;
  position: absolute;
  right: 12px;
  top: 16px;
  padding: 6px 12px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    display: block;
    top: 23px;
  }
`;

const SButtonSecondaryMobile = styled(Button)`
  position: absolute;
  right: 10px;
  top: 11px;
  padding: 5px;
  border-radius: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }

  & path {
    fill: ${({ theme }) =>
      theme.name === 'light' ? theme.colors.white : theme.colors.darkGray};
  }
`;

const SCardList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;

  ${({ theme }) => theme.media.mobileL} {
    flex-direction: row;
    margin: 0 -24px 0;

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
    margin-right: 8px;
    margin-bottom: 0;
    max-width: 320px;
    min-width: 320px;

    &:last-child {
      margin-right: 24px;
    }

    &:first-child {
      margin-left: 24px;
    }
  }
`;

const SLoader = styled.div`
  top: 50%;
  left: 50%;
  z-index: 20;
  position: absolute;
  transform: translate(-50%, -50%);
`;
