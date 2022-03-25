/* eslint-disable no-unneeded-ternary */
import React, { useRef, useMemo } from 'react';
import Head from 'next/head';
import { useCookies } from 'react-cookie';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';

import Row from '../atoms/Grid/Row';
import Col from '../atoms/Grid/Col';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import Cookie from '../molecules/Cookie';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';
import BottomNavigation from '../organisms/BottomNavigation';
import FloatingMessages from '../molecules/creator/dashboard/FloatingMessages';

import useOverlay from '../../utils/hooks/useOverlay';
import useScrollPosition from '../../utils/hooks/useScrollPosition';
import { useAppSelector } from '../../redux-store/store';
import useScrollDirection from '../../utils/hooks/useScrollDirection';
import useRefreshOnScrollTop from '../../utils/hooks/useRefreshOnScrollTop';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IGeneral {
  children: React.ReactNode;
  withChat?: boolean;
  specialStatusBarColor?: string;
  restrictMaxWidth?: boolean;
}

export const General: React.FC<IGeneral> = (props) => {
  const { children, withChat, specialStatusBarColor, restrictMaxWidth } = props;
  const user = useAppSelector((state) => state.user);
  const { banner, resizeMode } = useAppSelector((state) => state.ui);
  const theme = useTheme();
  const [cookies] = useCookies();
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
      if (user.userData?.options?.isCreator) {
        bottomNavigationShadow = [
          {
            key: 'home',
            url: '/',
            width: '20%',
          },
          {
            key: 'dashboard',
            url: '/creator/dashboard',
            width: '20%',
          },
          {
            key: 'add',
            url: '/creation',
            width: '20%',
          },
          {
            key: 'notifications',
            url: '/notifications',
            width: '20%',
            counter: user.notificationsCount,
          },
          {
            key: 'more',
            url: '/more',
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
            url: '/creator-onboarding-stage-1',
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
  }, [user.loggedIn, user.notificationsCount, user.userData?.options?.isCreator]);

  useOverlay(wrapperRef);
  useScrollPosition(wrapperRef);
  useRefreshOnScrollTop();
  const { scrollDirection } = useScrollDirection(wrapperRef);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SWrapper id="generalScrollContainer" ref={wrapperRef} withBanner={!!banner?.show} {...props}>
          <Head>
            <meta
              name="theme-color"
              content={specialStatusBarColor ? specialStatusBarColor : theme.colorsThemed.statusBar.background}
            />
          </Head>
          <Header visible={!isMobile || (isMobile && scrollDirection !== 'down')} />
          <SContent>
            <Container
              {...(
                restrictMaxWidth ? {
                } : {
                  noMaxContent: true,
                }
              )}
            >
              <Row>
                <Col>{children}</Col>
              </Row>
            </Container>
          </SContent>
          <Footer />
          <BottomNavigation visible={isMobile && scrollDirection !== 'down'} collection={bottomNavigation} />
          <SortingContainer
            id="sorting-container"
            withCookie={cookies.accepted !== 'true'}
            bottomNavigationVisible={isMobile && scrollDirection !== 'down'}
          />
          <CookieContainer bottomNavigationVisible={isMobile && scrollDirection !== 'down'}>
            <Cookie />
          </CookieContainer>
          {withChat && isMobile && (
            <ChatContainer bottomNavigationVisible={isMobile && scrollDirection !== 'down'}>
              <FloatingMessages withCounter />
            </ChatContainer>
          )}
        </SWrapper>
      </SkeletonTheme>
    </ErrorBoundary>
  );
};

export default General;

General.defaultProps = {
  withChat: false,
  specialStatusBarColor: undefined,
  restrictMaxWidth: undefined,
};

interface ISWrapper {
  withBanner: boolean;
}

const SWrapper = styled.div<ISWrapper>`
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow-y: auto;
  transition: padding ease 0.5s;
  padding-top: ${(props) => (props.withBanner ? 96 : 56)}px;
  padding-bottom: 56px;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    padding-top: ${(props) => (props.withBanner ? 112 : 72)}px;
    padding-bottom: 0;

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
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

interface ICookieContainer {
  bottomNavigationVisible: boolean;
}

const CookieContainer = styled.div<ICookieContainer>`
  left: 50%;
  bottom: ${(props) => (props.bottomNavigationVisible ? 62 : 6)}px;
  z-index: 10;
  position: fixed;
  transform: translateX(-50%);
  transition: bottom ease 0.5s;
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    bottom: ${(props) => (props.bottomNavigationVisible ? 80 : 24)}px;
  }
`;

interface IChatContainer {
  bottomNavigationVisible: boolean;
}

const ChatContainer = styled.div<IChatContainer>`
  right: 16px;
  bottom: ${(props) => (props.bottomNavigationVisible ? 72 : 16)}px;
  z-index: 10;
  position: fixed;
  transition: bottom ease 0.5s;
`;

interface ISortingContainer {
  withCookie: boolean;
  bottomNavigationVisible: boolean;
}

const SortingContainer = styled.div<ISortingContainer>`
  left: 50%;
  bottom: ${(props) =>
    props.bottomNavigationVisible ? `${props.withCookie ? 128 : 72}` : `${props.withCookie ? 72 : 16}`}px;
  z-index: 10;
  position: fixed;
  transform: translateX(-50%);
  transition: bottom ease 0.5s;
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    bottom: -100px;
  }
`;
