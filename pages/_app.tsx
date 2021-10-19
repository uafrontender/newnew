import type { AppProps } from 'next/app'

// Global CSS configurations
import GlobalStyle from "../styles/globalStyles";

// Redux store and provider
import store from '../redux-store/store'
import { Provider } from 'react-redux'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <GlobalStyle />
      <Component {...pageProps} />
    </Provider>
  );
}
export default MyApp
