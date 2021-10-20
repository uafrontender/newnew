import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ReactElement } from 'react';
import type { AppProps } from 'next/app';

// Global CSS configurations
import GlobalStyle from '../styles/globalStyles';

// Redux store and provider
import store, { persistor } from '../redux-store/store';

function MyApp({
  Component,
  pageProps
}: AppProps): ReactElement {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalStyle />
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
