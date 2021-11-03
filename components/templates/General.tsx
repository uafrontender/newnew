import React, { useMemo } from 'react';
import styled from 'styled-components';

import TopNavigation from '../organisms/TopNavigation';
import BottomNavigation from '../organisms/BottomNavigation';

import { useAppSelector } from '../../redux-store/store';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IGeneral {
  children: React.ReactNode;
}

export const General: React.FC<IGeneral> = (props) => {
  const { children } = props;
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const bottomNavigation = useMemo(() => {
    let bottomNavigationShadow: TBottomNavigationItem[] = [
      {
        key: 'home',
        url: '/',
        width: '100%',
      },
    ];

    if (user.loggedIn) {
      if (user.role === 'creator') {
        bottomNavigationShadow = [
          {
            key: 'home',
            url: '/',
            width: '20%',
          },
          {
            key: 'notifications',
            url: '/notifications',
            width: '20%',
            counter: user.notificationsCount,
          },
          {
            key: 'add',
            url: '/add',
            width: '20%',
          },
          {
            key: 'dashboard',
            url: '/dashboard',
            width: '20%',
          },
          {
            key: 'share',
            url: '/share',
            width: '20%',
          },
        ];
      } else {
        bottomNavigationShadow = [
          {
            key: 'home',
            url: '/',
            width: '33%',
          },
          {
            key: 'add',
            url: '/add',
            width: '33%',
          },
          {
            key: 'notifications',
            url: '/notifications',
            width: '33%',
            counter: user.notificationsCount,
          },
        ];
      }
    }

    return bottomNavigationShadow;
  }, [user.loggedIn, user.notificationsCount, user.role]);

  return (
    <SContainer>
      <TopNavigation />
      <SContent>
        {children}
      </SContent>
      {resizeMode.includes('mobile') && (
        <BottomNavigation collection={bottomNavigation} />
      )}
    </SContainer>
  );
};

export default General;

const SContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin: auto;
  max-width: ${(props) => props.theme.width.maxContentWidth};
`;

const SContent = styled.main`
  color: ${(props) => props.theme.colorsThemed.appTextColor};
  height: 100%;
  padding-top: 56px;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.background1};

  ${({ theme }) => theme.media.tablet} {
    padding-top: 72px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 80px;
  }
`;
