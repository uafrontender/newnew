/* eslint-disable no-underscore-dangle */
import React, { ReactElement, ReactNode, useEffect } from 'react';
import App from 'next/app';
import Head from 'next/head';
import { useStore } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { CookiesProvider } from 'react-cookie';
import { parse, UserAgent } from 'next-useragent';
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
import WalletContextProvider from '../contexts/walletContext';
import { BlockedUsersProvider } from '../contexts/blockedUsersContext';
import { ChatsProvider } from '../contexts/chatContext';
import SyncUserWrapper from '../contexts/syncUserWrapper';
import AppConstantsContextProvider from '../contexts/appConstantsContext';

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
  const ua: UserAgent = parse(
    uaString || (isBrowser() ? window?.navigator?.userAgent : '')
  );
  const store = useStore();
  const currentResizeMode = store.getState()?.ui?.resizeMode;
  const getInitialResizeMode = () => {
    let resizeMode = 'mobile';

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

    return resizeMode;
  };

  useEffect(() => {
    const hotjarIdVariable = process.env.NEXT_PUBLIC_HOTJAR_ID;
    const hotjarSvVariable = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION;

    if (hotjarIdVariable && hotjarSvVariable) {
      const hotjarId = parseInt(hotjarIdVariable);
      const hotjarSv = parseInt(hotjarSvVariable);
      hotjar.initialize(hotjarId, hotjarSv);
    }
  }, []);

  store.dispatch(setResizeMode(getInitialResizeMode()));

  // Shared layouts
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="robots" content="noindex" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
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
                  <BlockedUsersProvider>
                    <FollowingsContextProvider>
                      <WalletContextProvider>
                        <SubscriptionsProvider>
                          <ChatsProvider>
                            <ResizeMode>
                              <GlobalTheme>
                                <div>
                                  <ToastContainer />
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
                                </div>
                              </GlobalTheme>
                            </ResizeMode>
                          </ChatsProvider>
                        </SubscriptionsProvider>
                      </WalletContextProvider>
                    </FollowingsContextProvider>
                  </BlockedUsersProvider>
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
