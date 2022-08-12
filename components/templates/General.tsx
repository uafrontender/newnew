/* eslint-disable no-unneeded-ternary */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import { useCookies } from 'react-cookie';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Row from '../atoms/Grid/Row';
import Col from '../atoms/Grid/Col';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import Cookie from '../molecules/Cookie';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';
import BottomNavigation from '../organisms/BottomNavigation';
import FloatingMessages from '../molecules/creator/dashboard/FloatingMessages';

import useScrollPosition from '../../utils/hooks/useScrollPosition';
import { useAppSelector } from '../../redux-store/store';
import useScrollDirection from '../../utils/hooks/useScrollDirection';
// import useRefreshOnScrollTop from '../../utils/hooks/useRefreshOnScrollTop';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';
import MobileDashBoardChat from '../organisms/MobileDashBoardChat';
import { useNotifications } from '../../contexts/notificationsContext';
import { useGetChats } from '../../contexts/chatContext';
import ReportBugButton from '../molecules/ReportBugButton';
import { usePostModalState } from '../../contexts/postModalContext';
import useHasMounted from '../../utils/hooks/useHasMounted';
import { useGetSubscriptions } from '../../contexts/subscriptionsContext';
import { useOverlayMode } from '../../contexts/overlayModeContext';

interface IGeneral {
  withChat?: boolean;
  specialStatusBarColor?: string;
  restrictMaxWidth?: boolean;
  children: React.ReactNode;
}

export const General: React.FC<IGeneral> = (props) => {
  const { withChat, specialStatusBarColor, restrictMaxWidth, children } = props;
  const user = useAppSelector((state) => state.user);
  const { banner, resizeMode, globalSearchActive } = useAppSelector(
    (state) => state.ui
  );
  const theme = useTheme();
  const [cookies] = useCookies();
  const router = useRouter();
  const { unreadNotificationCount } = useNotifications();
  const { overlayModeEnabled } = useOverlayMode();
  const { unreadCount, setMobileChatOpened, mobileChatOpened } = useGetChats();
  const { postOverlayOpen } = usePostModalState();
  const { creatorsImSubscribedTo, mySubscribersTotal } = useGetSubscriptions();

  const hasMounted = useHasMounted();

  const [moreMenuMobileOpen, setMoreMenuMobileOpen] = useState(false);

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
            counter: unreadNotificationCount,
          },
          {
            key: 'more',
            url: '/more',
            width: '20%',
            actionHandler: () => setMoreMenuMobileOpen(true),
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
            url: '/creator-onboarding',
            width: '33%',
          },
          {
            key: 'notifications',
            url: '/notifications',
            width: '33%',
            counter: unreadNotificationCount,
          },
        ].concat(
          (user.userData?.options?.isOfferingSubscription &&
            mySubscribersTotal > 0) ||
            creatorsImSubscribedTo.length > 0
            ? [
                {
                  key: 'dms',
                  url: '/direct-messages',
                  width: '33%',
                  counter: unreadCount,
                },
              ]
            : []
        );
      }
    }

    return bottomNavigationShadow;
  }, [
    user.loggedIn,
    unreadNotificationCount,
    user.userData?.options?.isCreator,
    user.userData?.options?.isOfferingSubscription,
    unreadCount,
    creatorsImSubscribedTo.length,
    mySubscribersTotal,
  ]);

  const savedScrollPosition = useRef(0);
  useEffect(() => {
    if (overlayModeEnabled) {
      savedScrollPosition.current = window ? window.scrollY : 0;

      // eslint-disable-next-line no-param-reassign
      wrapperRef.current.style.cssText = `
        overflow: hidden;
     `;
      document.body.style.cssText = `
        overflow: hidden;
      `;
    } else {
      // eslint-disable-next-line no-param-reassign
      wrapperRef.current.style.cssText = ``;
      document.body.style.cssText = '';
      window?.scroll(0, savedScrollPosition.current);
      savedScrollPosition.current = 0;
    }
  }, [wrapperRef, overlayModeEnabled]);

  useScrollPosition(wrapperRef);
  // useRefreshOnScrollTop();
  const { scrollDirection } = useScrollDirection(wrapperRef);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const openChat = () => {
    setMobileChatOpened(true);
  };

  const closeChat = () => {
    setMobileChatOpened(false);
  };

  const chatButtonVisible =
    isMobile && withChat && user.userData?.options?.isOfferingSubscription;

  const mobileNavigationVisible = isMobile && scrollDirection !== 'down';

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SWrapper
          id='generalContainer'
          ref={wrapperRef}
          withBanner={!!banner?.show}
          {...props}
        >
          <Head>
            <meta
              name='theme-color'
              content={
                specialStatusBarColor
                  ? specialStatusBarColor
                  : theme.colorsThemed.statusBar.background
              }
            />
          </Head>
          <Header
            visible={!isMobile || mobileNavigationVisible || globalSearchActive}
          />
          <SContent>
            <Container
              {...(restrictMaxWidth
                ? {}
                : {
                    noMaxContent: true,
                  })}
            >
              <Row>
                <Col>{children}</Col>
              </Row>
            </Container>
          </SContent>
          <Footer />
          {hasMounted && (
            <>
              <BottomNavigation
                collection={bottomNavigation}
                moreMenuMobileOpen={moreMenuMobileOpen}
                handleCloseMobileMenu={() => setMoreMenuMobileOpen(false)}
                visible={mobileNavigationVisible && !globalSearchActive}
              />
              <SortingContainer
                id='sorting-container'
                withCookie={cookies.accepted !== 'true'}
                bottomNavigationVisible={mobileNavigationVisible}
              />
              <CookieContainer
                bottomNavigationVisible={mobileNavigationVisible}
                zIndex={moreMenuMobileOpen ? 9 : 10}
              >
                <Cookie />
              </CookieContainer>
            </>
          )}
          {chatButtonVisible && (
            <ChatContainer
              bottomNavigationVisible={mobileNavigationVisible}
              zIndex={moreMenuMobileOpen ? 9 : 10}
            >
              {!mobileChatOpened ? (
                <FloatingMessages withCounter openChat={openChat} />
              ) : (
                <MobileDashBoardChat closeChat={closeChat} />
              )}
            </ChatContainer>
          )}
          {!isMobileOrTablet && !router.route.includes('direct-messages') && (
            <ReportBugButton
              bottom={
                (isMobile ? 24 : 16) +
                (isMobile &&
                (mobileNavigationVisible || postOverlayOpen) &&
                !mobileChatOpened
                  ? 56
                  : 0) +
                (chatButtonVisible && !mobileChatOpened ? 72 : 0)
              }
              right={4}
              zIndex={moreMenuMobileOpen ? 9 : undefined}
            />
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
  min-height: 100vh;
  min-height: -moz-available;
  min-height: -webkit-fill-available;
  min-height: fill-available;
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
  zIndex: number;
}

const CookieContainer = styled.div<ICookieContainer>`
  left: 50%;
  bottom: ${(props) => (props.bottomNavigationVisible ? 62 : 6)}px;
  z-index: ${(props) => props.zIndex};
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
  zIndex: number;
}

const ChatContainer = styled.div<IChatContainer>`
  right: 16px;
  bottom: ${(props) => (props.bottomNavigationVisible ? 72 : 16)}px;
  z-index: ${(props) => props.zIndex};
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
    props.bottomNavigationVisible
      ? `${props.withCookie ? 128 : 72}`
      : `${props.withCookie ? 72 : 16}`}px;
  z-index: 10;
  position: fixed;
  transform: translateX(-50%);
  transition: bottom ease 0.5s;
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    bottom: -100px;
  }
`;
