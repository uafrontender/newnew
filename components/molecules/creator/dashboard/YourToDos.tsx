import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import { useAppSelector } from '../../../../redux-store/store';

import RadioIcon from '../../../../public/images/svg/icons/filled/Radio.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import { Mixpanel } from '../../../../utils/mixpanel';

interface ToDoItem {
  id: string;
  title: string;
  completed: boolean;
}

export const YourToDos = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);

  const collection: ToDoItem[] = useMemo(
    () => [
      {
        id: 'sign-up',
        title: t('dashboard.toDos.signUp'),
        completed: true,
      },
      {
        id: 'complete-profile',
        title: t('dashboard.toDos.completeProfile'),
        completed: !!user.userData?.bio && user.userData?.bio.length > 0,
      },
      {
        id: 'add-cash-out-method',
        title: t('dashboard.toDos.addCashOutMethod'),
        completed:
          user.creatorData?.options?.stripeConnectStatus ===
          newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
            .CONNECTED_ALL_GOOD,
      },
    ],
    [t, user.creatorData, user.userData]
  );

  const renderItem = useCallback(
    (item: ToDoItem, index: number) => (
      <SListItem key={item.id} completed={item.completed} isFirst={index === 0}>
        <SItemText>
          <SBullet completed={item.completed}>
            {item.completed ? (
              <InlineSvg svg={RadioIcon} width='8' height='8' fill='#fff' />
            ) : (
              <InlineSvg
                svg={RadioIcon}
                width='8'
                height='8'
                fill={theme.name === 'light' ? '#1B1C27' : '#fff'}
              />
            )}
          </SBullet>
          <SItemTitle>
            {item.title}
            {!item.completed && <SRequired>*</SRequired>}
          </SItemTitle>
        </SItemText>
        {!item.completed && item.id === 'complete-profile' && (
          <Link href='/creator-onboarding-about'>
            <a>
              <SBottomActionButton
                withDim
                withShrink
                view='primaryGrad'
                onClick={() => {
                  Mixpanel.track('Navigation Item Clicked', {
                    _button: 'Add',
                    _info: 'Add bio',
                    _stage: 'Dashboard',
                    _target: '/creator-onboarding-about',
                  });
                }}
              >
                {t('dashboard.toDos.completeProfileButton')}
              </SBottomActionButton>
            </a>
          </Link>
        )}
        {!item.completed && item.id === 'add-cash-out-method' && (
          <Link href='/creator/get-paid'>
            <a>
              <SBottomActionButton
                withDim
                withShrink
                view='primaryGrad'
                onClick={() => {
                  Mixpanel.track('Navigation Item Clicked', {
                    _button: 'Add',
                    _info: 'Add bank info',
                    _stage: 'Dashboard',
                    _target: '/creator/get-paid',
                  });
                }}
              >
                {t('dashboard.toDos.addCashOutMethodButton')}
              </SBottomActionButton>
            </a>
          </Link>
        )}
      </SListItem>
    ),
    [t, theme.name]
  );

  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.toDos.title')}</STitle>
      </SHeaderLine>
      <SDescription variant={3} weight={600}>
        {t('dashboard.toDos.subtitle')}
        <SList>{collection.map(renderItem)}</SList>
      </SDescription>
    </SContainer>
  );
};

export default YourToDos;

const SContainer = styled.div`
  left: -16px;
  width: calc(100% + 32px);
  padding: 16px;
  display: flex;
  position: relative;
  background: ${(props) =>
    props.theme.name === 'light'
      ? '#14151F'
      : props.theme.colorsThemed.background.quinary};
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    width: 100%;
    padding: 20px 32px 8px 25px;
    border-radius: 16px;
  }
`;

const STitle = styled(Headline)`
  color: ${(props) => props.theme.colors.white};
  font-weight: 600;
  margin-bottom: 8px;
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.tertiary
      : props.theme.colorsThemed.text.secondary};
`;

const SList = styled.div`
  font-size: 14px;
  padding-top: 16px;
  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;

interface ISListItem {
  completed: boolean;
  isFirst: boolean;
}
const SListItem = styled.div<ISListItem>`
  padding: 0 0 16px;
  display: flex;
  align-items: center;
  ${(props) => {
    if (props.completed) {
      return css`
          text-decoration:line-through;
          div{
            color: ${() =>
              props.theme.name === 'light' ? '#586070' : '#B3BBCA'};
          }
        }
      `;
    }
    return css`
      div {
        color: ${() => props.theme.colors.white};
      }
    `;
  }}
  a {
    margin-left: auto;
    flex-shrink: 0;
    display: block;
  }
`;

const SItemText = styled.div`
  padding: 12px 10px 12px 0;
  display: flex;
`;

interface ISBullet {
  completed: boolean;
}
const SBullet = styled.div<ISBullet>`
  border-radius: 50%;
  display: flex;
  width: 18px;
  height: 18px;
  justify-content: center;
  ${(props) => {
    if (props.completed) {
      return css`
          background: #12A573;
        }
      `;
    }
    return css`
      background: ${() =>
        props.theme.name === 'light' ? '#2C2C33' : '#B3BBCA'};
    `;
  }}
`;

const SRequired = styled.span`
  color: ${(props) => props.theme.colorsThemed.accent.error};
  font-size: 24px;
  margin: -20px 0 0 3px;
  display: inline-block;
`;

const SItemTitle = styled.div`
  margin-left: 11px;
  white-space: nowrap;
  ${(props) => props.theme.media.tablet} {
    margin-left: 15px;
  }
`;

const SBottomActionButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  margin-left: auto;
  flex-shrink: 0;
`;
