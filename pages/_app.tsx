import React, { ReactElement } from 'react';
import type { AppProps } from 'next/app';
import App from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { appWithTranslation } from 'next-i18next';
import { UserAgent, useUserAgent } from 'next-useragent';

// Global CSS configurations
import ResizeMode from '../HOC/ResizeMode';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import createStore from '../redux-store/store';
import { defaultUIState } from '../redux-store/slices/uiStateSlice';

import isBroswer from '../utils/isBrowser';

// Socket context
// import SocketContextProvider from '../contexts/socketContext';

interface IMyApp extends AppProps {
  uaString: string;
}

const MyApp = (props: IMyApp): ReactElement => {
  const {
    Component,
    pageProps,
    uaString,
  } = props;
  const ua: UserAgent = useUserAgent(uaString || (isBroswer() ? window?.navigator?.userAgent : ''));
  const getInitialResizeMode = () => {
    let resizeMode = 'mobile';

    if (ua.isTablet) {
      resizeMode = 'tablet';
    } else if (ua.isDesktop) {
      resizeMode = 'laptop';
    }

    return resizeMode;
  };

  const {
    store,
    persistor,
  } = createStore({
    ui: {
      ...defaultUIState,
      resizeMode: getInitialResizeMode(),
    },
  });

  return (
    <Provider store={store}>
      {/* <SocketContextProvider> */}
      <PersistGate loading={null} persistor={persistor}>
        <ResizeMode>
          <GlobalTheme>
            <Component {...pageProps} />
          </GlobalTheme>
        </ResizeMode>
      </PersistGate>
      {/* </SocketContextProvider> */}
    </Provider>
  );
};

// @ts-ignore
const MyAppWithTranslation = appWithTranslation(MyApp);

// @ts-ignore
MyAppWithTranslation.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    uaString: appContext.ctx?.req?.headers?.['user-agent'],
  };
};

export default MyAppWithTranslation;
