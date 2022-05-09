/* eslint-disable no-underscore-dangle */
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import App from 'next/app';
import Head from 'next/head';
import { useStore } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { CookiesProvider } from 'react-cookie';
import { parse } from 'next-useragent';
import { appWithTranslation } from 'next-i18next';
import { hotjar } from 'react-hotjar';

// Custom error page
import Error from './_error';

// Global CSS configurations
import ResizeMode from '../HOC/ResizeMode';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import { setResizeMode } from '../redux-store/slices/uiStateSlice';
import { EnhancedStoreWithPersistor, wrapper } from '../redux-store/store';

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

  // Pre-fetch images after all loading for initial page is done
  const [preFetchImages, setPreFetchImages] = useState<string>('');
  const PRE_FETCHING_DELAY = 2500;
  useEffect(() => {
    setTimeout(() => {
      const currentTheme = getColorMode(store.getState()?.ui?.colorMode);
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

  // Shared layouts
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta name='robots' content='noindex' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, user-scalable=no'
        />
        {preFetchImages !== '' && PRE_FETCH_LINKS_COMMON}
        {preFetchImages === 'dark' && PRE_FETCH_LINKS_DARK}
        {preFetchImages === 'light' && PRE_FETCH_LINKS_LIGHT}
      </Head>
      <CookiesProvider cookies={cookiesInstance}>
        <AppConstantsContextProvider>
          <SocketContextProvider>
            <ChannelsContextProvider>
              <PersistGate
                loading={null}
                persistor={(store as EnhancedStoreWithPersistor).__persistor}
              >
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
                                  <div>
                                    <ToastContainer />
                                    <VideoProcessingWrapper>
                                      {!pageProps.error ? (
                                        getLayout(<Component {...pageProps} />)
                                      ) : (
                                        <Error
                                          errorMsg={pageProps.error?.message}
                                          statusCode={
                                            pageProps.error?.statusCode ?? 500
                                          }
                                        />
                                      )}
                                    </VideoProcessingWrapper>
                                  </div>
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
              </PersistGate>
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
    {/* Creation screen */}
    <link rel='prefetch' href={assets.creation.AcAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.McAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.CfAnimated} as='image' />
    <link rel='prefetch' href={assets.creation.AcStatic} as='image' />
    <link rel='prefetch' href={assets.creation.McStatic} as='image' />
    <link rel='prefetch' href={assets.creation.CfStatic} as='image' />
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
      href={assets.home.darkLandingStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.home.darkMobileLandingStatic}
      as='image'
    />
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
      href={assets.home.lightLandingStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.home.lightMobileLandingStatic}
      as='image'
    />
  </>
);
