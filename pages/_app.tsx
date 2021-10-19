import type { AppProps } from 'next/app'

import { PersistGate } from 'redux-persist/integration/react'

// Global CSS configurations
import GlobalStyle from "../styles/globalStyles";

// Redux store and provider
import store, { persistor } from '../redux-store/store'
import { Provider } from 'react-redux'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GlobalStyle />
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}
export default MyApp
