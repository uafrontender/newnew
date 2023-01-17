/* eslint-disable no-nested-ternary */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import Row from '../atoms/Grid/Row';
import Col from '../atoms/Grid/Col';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import Cookie from '../molecules/Cookie';
import Container from '../atoms/Grid/Container';
import BottomNavigation from '../organisms/BottomNavigation';
import FloatingMessages from '../molecules/creator/dashboard/FloatingMessages';

import useScrollPosition from '../../utils/hooks/useScrollPosition';
import { useAppSelector } from '../../redux-store/store';
import useScrollDirection from '../../utils/hooks/useScrollDirection';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';
import { useNotifications } from '../../contexts/notificationsContext';
import { useGetChats } from '../../contexts/chatContext';
import ReportBugButton from '../molecules/ReportBugButton';
import useHasMounted from '../../utils/hooks/useHasMounted';
import ModalNotifications from '../molecules/ModalNotifications';
import BaseLayout from './BaseLayout';
import { useBundles } from '../../contexts/bundlesContext';
import ChatContainer from '../organisms/direct-messages/ChatContainer';

interface IGeneral {
  className?: string;
  withChat?: boolean;
  restrictMaxWidth?: boolean;
  noMobileNavigation?: boolean;
  noPaddingMobile?: boolean;
  children: React.ReactNode;
}

export const General: React.FC<IGeneral> = (props) => {
  const {
    className,
    withChat,
    restrictMaxWidth,
    noMobileNavigation,
    noPaddingMobile,
    children,
  } = props;
  const user = useAppSelector((state) => state.user);
  const { banner, resizeMode, globalSearchActive } = useAppSelector(
    (state) => state.ui
  );
  const theme = useTheme();
  const [cookies] = useCookies();
  const router = useRouter();
  const { unreadNotificationCount } = useNotifications();
  const { bundles, hasSoldBundles } = useBundles();
  const {
    unreadCount,
    setMobileChatOpened,
    mobileChatOpened,
    activeTab,
    setActiveTab,
  } = useGetChats();

  const hasMounted = useHasMounted();

  const [moreMenuMobileOpen, setMoreMenuMobileOpen] = useState(false);

  // TODO: fix an issue when scroll position is set before resizing of the wrapper
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const bottomNavigation: TBottomNavigationItem[] = useMemo(() => {
    let bottomNavigationShadow: TBottomNavigationItem[] = [
      {
        key: 'home',
        url: '/',
      },
    ];

    if (user.loggedIn) {
      if (user.userData?.options?.isCreator) {
        bottomNavigationShadow = [
          {
            key: 'home',
            url: '/',
          },
          {
            key: 'dashboard',
            url: '/creator/dashboard',
          },
          {
            key: 'add',
            url: '/creation',
          },
          bundles && bundles.length > 0
            ? {
                key: 'bundles',
                url: '/bundles',
              }
            : {
                key: 'notifications',
                url: '/notifications',
                counter: unreadNotificationCount,
              },
          {
            key: 'more',
            url: '/more',
            actionHandler: () => setMoreMenuMobileOpen(true),
          },
        ];
      } else {
        bottomNavigationShadow = (
          [
            {
              key: 'home',
              url: '/',
            },
            {
              key: 'notifications',
              url: '/notifications',
              counter: unreadNotificationCount,
            },
            {
              key: 'add',
              url: '/creator-onboarding',
            },
          ] as TBottomNavigationItem[]
        ).concat(
          bundles && bundles.length > 0
            ? [
                {
                  key: 'bundles',
                  url: '/bundles',
                },
                {
                  key: 'dms',
                  url: '/direct-messages',
                  counter: unreadCount,
                } as TBottomNavigationItem,
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
    unreadCount,
    bundles,
  ]);

  useScrollPosition();
  // useRefreshOnScrollTop();
  const { scrollDirection } = useScrollDirection();
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

  const openChat = useCallback(() => {
    if (activeTab !== newnewapi.ChatRoom.MyRole.CREATOR) {
      setActiveTab(newnewapi.ChatRoom.MyRole.CREATOR);
    }
    router.push(`/creator/dashboard?tab=chat`);
    setMobileChatOpened(true);
  }, [activeTab, setActiveTab, setMobileChatOpened, router]);

  const chatButtonVisible = isMobile && withChat && hasSoldBundles;

  const mobileNavigationVisible = useMemo(
    () => isMobile && scrollDirection !== 'down' && !noMobileNavigation,
    [isMobile, scrollDirection, noMobileNavigation]
  );

  return (
    <SBaseLayout
      id='generalContainer'
      className={className}
      containerRef={wrapperRef}
      withBanner={!!banner?.show}
      noPaddingTop={!!noMobileNavigation}
    >
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <Header
          visible={!isMobile || mobileNavigationVisible || globalSearchActive}
        />
        <SContent noPaddingTop={!!noMobileNavigation}>
          <Container
            {...(restrictMaxWidth
              ? {}
              : {
                  noMaxContent: true,
                })}
          >
            <Row noPaddingMobile={noPaddingMobile}>
              <Col noPaddingMobile={noPaddingMobile}>{children}</Col>
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
          <SChatContainer
            bottomNavigationVisible={mobileNavigationVisible}
            zIndex={moreMenuMobileOpen ? 9 : 10}
          >
            {!mobileChatOpened ? (
              <FloatingMessages withCounter openChat={openChat} />
            ) : (
              <ChatContainer />
            )}
          </SChatContainer>
        )}
        {!isMobileOrTablet && !router.route.includes('direct-messages') && (
          <ReportBugButton
            bottom={
              (isMobile ? 24 : 16) +
              (isMobile && mobileNavigationVisible && !mobileChatOpened
                ? 56
                : 0) +
              (chatButtonVisible && !mobileChatOpened ? 72 : 0)
            }
            right={4}
            zIndex={moreMenuMobileOpen ? 9 : undefined}
          />
        )}
        <ModalNotifications />
      </SkeletonTheme>
    </SBaseLayout>
  );
};

export default General;

General.defaultProps = {
  withChat: false,
  restrictMaxWidth: undefined,
};

interface ISWrapper {
  withBanner: boolean;
  noPaddingTop: boolean;
}

const SBaseLayout = styled(BaseLayout)<ISWrapper>`
  display: flex;
  transition: padding ease 0.5s;
  padding-top: ${(props) =>
    !props.noPaddingTop ? (props.withBanner ? 96 : 56) : 0}px;
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
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: ${(props) => (props.withBanner ? 120 : 80)}px;
  }
`;

const SContent = styled.main<{
  noPaddingTop?: boolean;
}>`
  padding: 40px 0;

  ${({ noPaddingTop }) =>
    noPaddingTop
      ? css`
          padding-top: 0;
        `
      : null}

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

const SChatContainer = styled.div<IChatContainer>`
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
