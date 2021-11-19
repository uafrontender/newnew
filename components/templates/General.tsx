import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';

import Row from '../atoms/Grid/Row';
import Col from '../atoms/Grid/Col';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import Container from '../atoms/Grid/Container';
import BottomNavigation from '../organisms/BottomNavigation';

import { useAppSelector } from '../../redux-store/store';
import useOverlay from '../../utils/hooks/useOverlay';
import useScrollPosition from '../../utils/hooks/useScrollPosition';
import useScrollDirection from '../../utils/hooks/useScrollDirection';
import useRefreshOnScrollTop from '../../utils/hooks/useRefreshOnScrollTop';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IGeneral {
  children: React.ReactNode;
}

export const General: React.FC<IGeneral> = (props) => {
  const { children } = props;
  const user = useAppSelector((state) => state.user);
  const {
    banner,
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

  useOverlay(wrapperRef);
  useScrollPosition(wrapperRef);
  useRefreshOnScrollTop();
  const { scrollDirection } = useScrollDirection(wrapperRef);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SWrapper
      id="generalScrollContainer"
      ref={wrapperRef}
      withBanner={!!banner?.show}
      {...props}
    >
      <Header visible={!isMobile || (isMobile && scrollDirection !== 'down')} />
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
      <BottomNavigation
        visible={isMobile && scrollDirection !== 'down'}
        collection={bottomNavigation}
      />
    </SWrapper>
  );
};

export default General;

interface ISWrapper {
  withBanner: boolean;
}

const SWrapper = styled.div<ISWrapper>`
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow-y: auto;
  transition: all ease 0.5s;
  padding-top: ${(props) => (props.withBanner ? 96 : 56)}px;
  padding-bottom: 56px;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    padding-top: ${(props) => (props.withBanner ? 112 : 72)}px;
    padding-bottom: 0;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: ${(props) => (props.withBanner ? 120 : 80)}px;
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
