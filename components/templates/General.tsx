/* eslint-disable no-nested-ternary */
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
import { useUserData } from '../../contexts/userDataContext';
import useScrollDirection from '../../utils/hooks/useScrollDirection';

import { TBottomNavigationItem } from '../molecules/BottomNavigationItem';
import { useNotifications } from '../../contexts/notificationsContext';
import { ChatsProvider } from '../../contexts/chatContext';
import ReportBugButton from '../molecules/ReportBugButton';
import ModalNotifications from '../molecules/ModalNotifications';
import BaseLayout from './BaseLayout';
import { useBundles } from '../../contexts/bundlesContext';
import { useAppState } from '../../contexts/appStateContext';
import canBecomeCreator from '../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../contexts/appConstantsContext';
import { useChatsUnreadMessages } from '../../contexts/chatsUnreadMessagesContext';
import MobileChat from '../organisms/MobileChat';
import useHasMounted from '../../utils/hooks/useHasMounted';
import { useUiState } from '../../contexts/uiStateContext';

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
  const { userData } = useUserData();
  const { appConstants } = useGetAppConstants();
  const { userLoggedIn, userIsCreator, userDateOfBirth, resizeMode } =
    useAppState();
  const { globalSearchActive, banner } = useUiState();
  const theme = useTheme();
  const [cookies] = useCookies();
  const router = useRouter();

  const { unreadNotificationCount } = useNotifications();
  const { bundles, directMessagesAvailable } = useBundles();
  const { unreadCount } = useChatsUnreadMessages();
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

    if (userLoggedIn) {
      if (userIsCreator) {
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
          ] as TBottomNavigationItem[]
        )
          .concat(
            canBecomeCreator(
              userDateOfBirth ?? userData?.dateOfBirth,
              appConstants.minCreatorAgeYears
            )
              ? [
                  {
                    key: 'add',
                    url: '/creator-onboarding',
                  },
                ]
              : []
          )
          .concat(
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
    userLoggedIn,
    unreadNotificationCount,
    userDateOfBirth,
    userData?.dateOfBirth,
    appConstants.minCreatorAgeYears,
    userIsCreator,
    unreadCount,
    bundles,
  ]);

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

  useScrollPosition();
  const { scrollDirection } = useScrollDirection(isMobile);

  const openChat = useCallback(() => {
    router.push(`${router.pathname}?tab=chat`);
  }, [router]);

  const mobileChatOpen = useMemo(
    () =>
      (isMobile && router.query.tab === 'chat') ||
      router.query.tab === 'direct-messages',
    [isMobile, router.query.tab]
  );

  const chatButtonVisible = useMemo(
    () => isMobile && withChat && directMessagesAvailable,
    [isMobile, withChat, directMessagesAvailable]
  );

  const mobileNavigationVisible = useMemo(
    () => isMobile && scrollDirection !== 'down' && !noMobileNavigation,
    [isMobile, scrollDirection, noMobileNavigation]
  );

  const containerParams = useMemo(
    () =>
      restrictMaxWidth
        ? {}
        : {
            wideContainer: true,
          },
    [restrictMaxWidth]
  );


  const isBottomNavigationVisible =
    mobileNavigationVisible && !globalSearchActive;

  return (
    <>
      {/* header is sticky for Safari on mobile devices so padding isn't needed */}
      <SBaseLayout
        id='generalContainer'
        className={className}
        containerRef={wrapperRef}
        withBanner={!!banner?.show}
      >
        <SkeletonTheme
          baseColor={theme.colorsThemed.background.secondary}
          highlightColor={theme.colorsThemed.background.tertiary}
        >
          <Header
            visible={!isMobile || mobileNavigationVisible || globalSearchActive}
          />
          <SContent noPaddingTop={!!noMobileNavigation}>
            <Container {...containerParams}>
              <Row noPaddingMobile={noPaddingMobile}>
                <Col noPaddingMobile={noPaddingMobile}>{children}</Col>
              </Row>
            </Container>
          </SContent>
          <Footer />
          <BottomNavigation
            collection={bottomNavigation}
            moreMenuMobileOpen={moreMenuMobileOpen}
            handleCloseMobileMenu={() => setMoreMenuMobileOpen(false)}
            visible={isBottomNavigationVisible}
          />
          {hasMounted ? (
            <>
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
          ) : null}
          {chatButtonVisible && (
            <SChatContainer
              bottomNavigationVisible={mobileNavigationVisible}
              zIndex={mobileChatOpen ? 11 : moreMenuMobileOpen ? 9 : 10}
            >
              {!mobileChatOpen ? (
                <FloatingMessages withCounter openChat={openChat} />
              ) : (
                <ChatsProvider>
                  <MobileChat myRole={newnewapi.ChatRoom.MyRole.CREATOR} />
                </ChatsProvider>
              )}
            </SChatContainer>
          )}
          {!isMobileOrTablet && !router.route.includes('direct-messages') && (
            <ReportBugButton
              bottom={
                (isMobile ? 24 : 16) +
                (isMobile && mobileNavigationVisible && !mobileChatOpen
                  ? 56
                  : 0) +
                (chatButtonVisible && !mobileChatOpen ? 72 : 0)
              }
              right={4}
              zIndex={moreMenuMobileOpen ? 9 : undefined}
            />
          )}
          <ModalNotifications />
        </SkeletonTheme>
      </SBaseLayout>
    </>
  );
};

export default General;

General.defaultProps = {
  withChat: false,
  restrictMaxWidth: undefined,
};

interface ISWrapper {
  withBanner: boolean;
}

const SBaseLayout = styled(BaseLayout)<ISWrapper>`
  display: flex;
  transition: padding ease 0.5s;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
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
  z-index: 9;
  position: fixed;
  transform: translateX(-50%);
  transition: bottom ease 0.5s;
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    bottom: -100px;
  }
`;
