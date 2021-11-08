/* eslint-disable no-underscore-dangle */
import React, { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useStore } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { appWithTranslation } from 'next-i18next';

// Global CSS configurations
import ResizeMode from '../HOC/ResizeMode';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import { EnhancedStoreWithPersistor, wrapper } from '../redux-store/store';

// Socket context
// import SocketContextProvider from '../contexts/socketContext';

// interface for shared layouts
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

interface IMyApp extends AppProps {
  Component: NextPageWithLayout;
}

const MyApp = (props: IMyApp): ReactElement => {
  const {
    Component,
    pageProps,
  } = props;

  const store = useStore();

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

export default wrapper.withRedux(MyAppWithTranslation);
