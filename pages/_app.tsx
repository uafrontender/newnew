/* eslint-disable no-underscore-dangle */
import React, { ReactElement, ReactNode } from 'react';
import App from 'next/app';
import Head from 'next/head';
import { useStore } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { parse, UserAgent } from 'next-useragent';
import { appWithTranslation } from 'next-i18next';

// Global CSS configurations
import ResizeMode from '../HOC/ResizeMode';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import { setResizeMode } from '../redux-store/slices/uiStateSlice';
import { EnhancedStoreWithPersistor, wrapper } from '../redux-store/store';

import isBroswer from '../utils/isBrowser';

// Socket context
// import SocketContextProvider from '../contexts/socketContext';

// interface for shared layouts
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

interface IMyApp extends AppProps {
  Component: NextPageWithLayout;
  uaString: string;
}

const MyApp = (props: IMyApp): ReactElement => {
  const {
    Component,
    pageProps,
    uaString,
  } = props;
  const ua: UserAgent = parse(uaString || (isBroswer() ? window?.navigator?.userAgent : ''));
  const getInitialResizeMode = () => {
    let resizeMode = 'mobile';

    if (ua.isTablet) {
      resizeMode = 'tablet';
    } else if (ua.isDesktop) {
      resizeMode = 'laptop';
    }

    return resizeMode;
  };
  const store = useStore();

  store.dispatch(setResizeMode(getInitialResizeMode()));

  // Shared layouts
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </Head>
      {/* <SocketContextProvider> */}
      <PersistGate loading={null} persistor={(store as EnhancedStoreWithPersistor).__persistor}>
        <ResizeMode>
          <GlobalTheme>
            { getLayout(<Component {...pageProps} />) }
          </GlobalTheme>
        </ResizeMode>
      </PersistGate>
      {/* </SocketContextProvider> */}
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
