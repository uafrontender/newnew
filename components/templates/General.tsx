import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import Row from '../atoms/Grid/Row';
import Col from '../atoms/Grid/Col';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import Container from '../atoms/Grid/Container';
import BottomNavigation from '../organisms/BottomNavigation';

import { useAppSelector } from '../../redux-store/store';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IGeneral {
  children: React.ReactNode;
}

let scrollPosition: number = 0;

export const General: React.FC<IGeneral> = (props) => {
  const { children } = props;
  const user = useAppSelector((state) => state.user);
  const {
    overlay,
    resizeMode,
  } = useAppSelector((state) => state.ui);
  const wrapperRef: any = useRef();

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

  useEffect(() => {
    wrapperRef.current.style.overflow = overlay ? 'hidden' : 'visible';

    if (overlay) {
      scrollPosition = window ? window.scrollY : 0;

      wrapperRef.current.style.cssText = `
          top: -${scrollPosition}px;
          left: 0px;
          right: 0px;
          position: fixed;
       `;
    } else {
      wrapperRef.current.style.cssText = '';
      window.scroll(0, scrollPosition || 0);
      scrollPosition = 0;
    }
  }, [overlay]);

  return (
    <SWrapper ref={wrapperRef}>
      <Header />
      <SContent>
        <Container>
          <Row>
            <Col>
              {children}
            </Col>
          </Row>
        </Container>
      </SContent>
      <Footer />
      {resizeMode.includes('mobile') && (
        <BottomNavigation collection={bottomNavigation} />
      )}
    </SWrapper>
  );
};

export default General;

const SWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow-y: auto;
  padding-top: 56px;
  padding-bottom: 56px;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 72px;
    padding-bottom: 0;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 80px;
  }
`;

const SContent = styled.main`
  padding: 40px 0;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;
