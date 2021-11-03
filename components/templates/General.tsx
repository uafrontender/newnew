import React from 'react';
import styled from 'styled-components';

import TopNavigation from '../organisms/TopNavigation';
import BottomNavigation from '../organisms/BottomNavigation';

import { useAppSelector } from '../../redux-store/store';

interface IGeneral {
  children: React.ReactNode;
}

export const General: React.FC<IGeneral> = (props) => {
  const { children } = props;
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);

  let bottomNavigation = [
    {
      key: 'home',
      url: '/',
    },
  ];

  if (user.loggedIn) {
    if (user.role === 'creator') {
      bottomNavigation = [
        {
          key: 'home',
          url: '/',
        },
        {
          key: 'notifications',
          url: '/notifications',
        },
        {
          key: 'add',
          url: '/add',
        },
        {
          key: 'dashboard',
          url: '/dashboard',
        },
        {
          key: 'share',
          url: '/share',
        },
      ];
    } else {
      bottomNavigation = [
        {
          key: 'home',
          url: '/',
        },
        {
          key: 'add',
          url: '/add',
        },
        {
          key: 'notifications',
          url: '/notifications',
        },
      ];
    }
  }

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
`;

const SContent = styled.main`
  color: ${(props) => props.theme.colorsThemed.appTextColor};
  height: 100%;
  padding-top: 48px;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.background1};

  ${({ theme }) => theme.media.tablet} {
    padding-top: 74px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 88px;
  }
`;
