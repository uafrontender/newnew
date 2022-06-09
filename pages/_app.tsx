/* eslint-disable no-underscore-dangle */
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import App from 'next/app';
import Head from 'next/head';
import { useStore } from 'react-redux';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { CookiesProvider } from 'react-cookie';
import { parse } from 'next-useragent';
import { appWithTranslation } from 'next-i18next';
import { hotjar } from 'react-hotjar';
import * as Sentry from '@sentry/browser';

// Custom error page
import Error from './_error';

// Global CSS configurations
import ResizeMode from '../HOC/ResizeMode';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import { setResizeMode } from '../redux-store/slices/uiStateSlice';
import { useAppSelector, wrapper } from '../redux-store/store';

import isBrowser from '../utils/isBrowser';

// Socket context
import SocketContextProvider from '../contexts/socketContext';

// Global Cookies instance
import { cookiesInstance } from '../api/apiConfigs';

import 'react-toastify/dist/ReactToastify.css';
import ChannelsContextProvider from '../contexts/channelsContext';
import { SubscriptionsProvider } from '../contexts/subscriptionsContext';
import FollowingsContextProvider from '../contexts/followingContext';
// import WalletContextProvider from '../contexts/walletContext';
import { BlockedUsersProvider } from '../contexts/blockedUsersContext';
import { ChatsProvider } from '../contexts/chatContext';
import SyncUserWrapper from '../contexts/syncUserWrapper';
import AppConstantsContextProvider from '../contexts/appConstantsContext';
import VideoProcessingWrapper from '../contexts/videoProcessingWrapper';

// Images to be prefetched
import assets from '../constants/assets';

// Landing
import PostModalContextProvider from '../contexts/postModalContext';
import getColorMode from '../utils/getColorMode';
import { NotificationsProvider } from '../contexts/notificationsContext';
import PersistanceProvider from '../contexts/PersistenceProvider';

// interface for shared layouts
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface IMyApp extends AppProps {
  Component: NextPageWithLayout;
  uaString: string;
}

const MyApp = (props: IMyApp): ReactElement => {
  const { Component, pageProps, uaString } = props;
  const store = useStore();
  const user = useAppSelector((state) => state.user);

  // Shared layouts
  const getLayout = useMemo(
    () => Component.getLayout ?? ((page: any) => page),
    [Component.getLayout]
  );

  // Pre-fetch images after all loading for initial page is done
  const [preFetchImages, setPreFetchImages] = useState<string>('');
  const PRE_FETCHING_DELAY = 2500;
  useEffect(() => {
    setTimeout(() => {
      const currentTheme = getColorMode(
        // @ts-ignore:next-line
        store.getState()?.ui?.colorMode as string
      );
      setPreFetchImages(currentTheme);
    }, PRE_FETCHING_DELAY);
  }, [store]);

  useEffect(() => {
    const hotjarIdVariable = process.env.NEXT_PUBLIC_HOTJAR_ID;
    const hotjarSvVariable = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION;

    if (hotjarIdVariable && hotjarSvVariable) {
      const hotjarId = parseInt(hotjarIdVariable);
      const hotjarSv = parseInt(hotjarSvVariable);
      hotjar.initialize(hotjarId, hotjarSv);
    }
  }, []);

  useEffect(() => {
    // @ts-ignore:next-line
    const currentResizeMode = store.getState()?.ui?.resizeMode;

    let resizeMode = 'mobile';
    const ua = parse(
      uaString || (isBrowser() ? window?.navigator?.userAgent : '')
    );

    if (ua.isTablet) {
      resizeMode = 'tablet';
    } else if (ua.isDesktop) {
      resizeMode = 'laptop';

      if (['laptopL', 'desktop'].includes(currentResizeMode)) {
        // keep old mode in case laptop
        resizeMode = currentResizeMode;
      }
    } else if (['mobileL', 'mobileM', 'mobileS'].includes(currentResizeMode)) {
      // keep old mode in case mobile
      resizeMode = currentResizeMode;
    }

    if (resizeMode !== currentResizeMode) {
      store.dispatch(setResizeMode(resizeMode));
    }
  }, [store, uaString]);

  // TODO: move to the store logic
  useEffect(() => {
    if (user.userData?.username) {
      Sentry.setUser({ username: user.userData.username });
    }
  }, [user.userData?.username]);

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, user-scalable=no'
        />
        <meta property='og:type' content='website' />
        {preFetchImages !== '' && PRE_FETCH_LINKS_COMMON}
        {preFetchImages === 'dark' && PRE_FETCH_LINKS_DARK}
        {preFetchImages === 'light' && PRE_FETCH_LINKS_LIGHT}
      </Head>
      <CookiesProvider cookies={cookiesInstance}>
        <AppConstantsContextProvider>
          <SocketContextProvider>
            <ChannelsContextProvider>
              <PersistanceProvider store={store}>
                <SyncUserWrapper>
                  <NotificationsProvider>
                    <BlockedUsersProvider>
                      <FollowingsContextProvider>
                        {/* <WalletContextProvider> */}
                        <SubscriptionsProvider>
                          <ChatsProvider>
                            <ResizeMode>
                              <PostModalContextProvider>
                                <GlobalTheme>
                                  <>
                                    <ToastContainer />
                                    <VideoProcessingWrapper>
                                      {!pageProps.error ? (
                                        getLayout(<Component {...pageProps} />)
                                      ) : (
                                        <Error
                                          title={pageProps.error?.message}
                                          statusCode={
                                            pageProps.error?.statusCode ?? 500
                                          }
                                        />
                                      )}
                                    </VideoProcessingWrapper>
                                  </>
                                </GlobalTheme>
                              </PostModalContextProvider>
                            </ResizeMode>
                          </ChatsProvider>
                        </SubscriptionsProvider>
                        {/* </WalletContextProvider> */}
                      </FollowingsContextProvider>
                    </BlockedUsersProvider>
                  </NotificationsProvider>
                </SyncUserWrapper>
              </PersistanceProvider>
            </ChannelsContextProvider>
          </SocketContextProvider>
        </AppConstantsContextProvider>
      </CookiesProvider>
    </>
  );
};

// @ts-ignore
const MyAppWithTranslation = appWithTranslation(MyApp);

// @ts-ignore
const MyAppWithTranslationAndRedux = wrapper.withRedux(MyAppWithTranslation);

// @ts-ignore
MyAppWithTranslationAndRedux.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    uaString: appContext.ctx?.req?.headers?.['user-agent'],
  };
};

export default MyAppWithTranslationAndRedux;

// Preload assets
const PRE_FETCH_LINKS_COMMON = (
  <>
    {/* Email verification screen */}
    {/* Sign up screen hero */}
    <link
      rel='prefetch'
      href={assets.floatingAssets.bottomGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.bottomSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.crowdfunding}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.leftGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.subMC}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.multipleChoice}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.rightGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.topGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.topMiddleSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.votes}
      as='image'
      media='(min-width: 760px)'
    />
  </>
);

const PRE_FETCH_LINKS_DARK = (
  <>
    <link
      rel='prefetch'
      href={assets.signup.darkStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.darkInto}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.darkOutro}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.decision.darkHourglassAnimated}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.decision.darkHourglassStatic}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.home.darkLandingStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.home.darkMobileLandingStatic}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.info.darkQuestionMarkAnimated}
      as='image'
    />
    <link rel='prefetch' href={assets.info.darkQuestionMarkStatic} as='image' />
    {/* Creation screen */}
    <link rel='prefetch' href={assets.creation.darkAcAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.darkMcAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.darkCfAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.darkAcStatic} as='image' />
    <link rel='prefetch' href={assets.creation.darkMcStatic} as='image' />
    <link rel='prefetch' href={assets.creation.darkCfStatic} as='image' />
  </>
);

const PRE_FETCH_LINKS_LIGHT = (
  <>
    <link
      rel='prefetch'
      href={assets.signup.lightStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.lightInto}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.lightOutro}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.decision.lightHourglassAnimated}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.decision.lightHourglassStatic}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.home.lightLandingStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.home.lightMobileLandingStatic}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.info.lightQuestionMarkAnimated}
      as='image'
    />
    <link
      rel='prefetch'
      href={assets.info.lightQuestionMarkStatic}
      as='image'
    />
    {/* Creation screen */}
    <link rel='prefetch' href={assets.creation.lightAcAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.lightMcAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.lightCfAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.lightAcStatic} as='image' />
    <link rel='prefetch' href={assets.creation.lightMcStatic} as='image' />
    <link rel='prefetch' href={assets.creation.lightCfStatic} as='image' />
  </>
);
