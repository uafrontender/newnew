/* eslint-disable react/jsx-props-no-spreading */

import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';

// Global CSS configurations
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import store, { persistor } from '../redux-store/store';

// Socket context
// import SocketContextProvider from '../contexts/socketContext';

function MyApp({
  Component,
  pageProps,
}: AppProps): ReactElement {
  return (
    <Provider store={store}>
      {/* <SocketContextProvider> */}
      <PersistGate loading={null} persistor={persistor}>
        <GlobalTheme>
          <Component {...pageProps} />
        </GlobalTheme>
      </PersistGate>
      {/* </SocketContextProvider> */}
    </Provider>
  );
}

export default appWithTranslation(MyApp);
