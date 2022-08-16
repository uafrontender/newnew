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
import { useRouter } from 'next/router';
import moment from 'moment';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

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
import CardsContextProvider from '../contexts/cardsContext';

// Images to be prefetched
import assets from '../constants/assets';

// Landing
import PostModalContextProvider from '../contexts/postModalContext';
import getColorMode from '../utils/getColorMode';
import { NotificationsProvider } from '../contexts/notificationsContext';
import PersistanceProvider from '../contexts/PersistenceProvider';
import { Mixpanel } from '../utils/mixpanel';
import ReCaptchaBadgeModal from '../components/organisms/ReCaptchaBadgeModal';
import { OverlayModeProvider } from '../contexts/overlayModeContext';

// interface for shared layouts
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface IMyApp extends AppProps {
  Component: NextPageWithLayout;
  uaString: string;
  colorMode: string;
}

const MyApp = (props: IMyApp): ReactElement => {
  const { Component, pageProps, uaString, colorMode } = props;
  const store = useStore();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const { locale } = useRouter();

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
    // Imported one by one not to reak import\no-dynamic-require
    if (locale === 'zh') {
      // eslint-disable-next-line global-require
      require('moment/locale/zh-tw');
      moment.locale('zh-tw');
    } else if (locale === 'es') {
      // eslint-disable-next-line global-require
      require('moment/locale/es');
      moment.locale('es');
    } else if (locale === 'en-US') {
      moment.locale('en-US');
    }
  });

  useEffect(() => {
    const hotjarIdVariable = process.env.NEXT_PUBLIC_HOTJAR_ID;
    const hotjarSvVariable = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION;

    if (hotjarIdVariable && hotjarSvVariable) {
      const hotjarId = parseInt(hotjarIdVariable);
      const hotjarSv = parseInt(hotjarSvVariable);
      try {
        hotjar.initialize(hotjarId, hotjarSv);
      } catch (err) {
        // NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
        // This is expected to happen from time to time, no need to react
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    if (user.loggedIn && user.userData?.username) {
      Mixpanel.identify(user.userData.username);
      Mixpanel.people.set({
        $name: user.userData.username,
        $email: user.userData.email,
        newnewId: user.userData.userUuid,
      });
      Mixpanel.track('Session started!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    let newResizeMode = 'mobile';
    const ua = parse(
      uaString || (isBrowser() ? window?.navigator?.userAgent : '')
    );

    if (ua.isTablet) {
      newResizeMode = 'tablet';
    } else if (ua.isDesktop) {
      newResizeMode = 'laptop';

      if (['laptopL', 'desktop'].includes(resizeMode)) {
        // keep old mode in case laptop
        newResizeMode = resizeMode;
      }
    } else if (['mobileL', 'mobileM', 'mobileS'].includes(resizeMode)) {
      // keep old mode in case mobile
      newResizeMode = resizeMode;
    }
    if (newResizeMode !== resizeMode) {
      store.dispatch(setResizeMode(resizeMode));
    }
  }, [resizeMode, uaString, store]);

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
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}
          language={locale}
          scriptProps={{
            async: false,
            defer: false,
            appendTo: 'head',
            nonce: undefined,
          }}
          container={{
            element: 'recaptchaBadge',
            parameters: {
              badge: 'bottomleft',
              theme: 'dark',
            },
          }}
        >
          <AppConstantsContextProvider>
            <SocketContextProvider>
              <ChannelsContextProvider>
                <PersistanceProvider store={store}>
                  <SyncUserWrapper>
                    <NotificationsProvider>
                      <BlockedUsersProvider>
                        <FollowingsContextProvider>
                          {/* <WalletContextProvider> */}
                          <CardsContextProvider>
                            <SubscriptionsProvider>
                              <ChatsProvider>
                                <OverlayModeProvider>
                                  <ResizeMode>
                                    <PostModalContextProvider>
                                      <GlobalTheme initialTheme={colorMode}>
                                        <>
                                          <ToastContainer />
                                          <VideoProcessingWrapper>
                                            {!pageProps.error ? (
                                              getLayout(
                                                <Component {...pageProps} />
                                              )
                                            ) : (
                                              <Error
                                                title={pageProps.error?.message}
                                                statusCode={
                                                  pageProps.error?.statusCode ??
                                                  500
                                                }
                                              />
                                            )}
                                          </VideoProcessingWrapper>
                                          <ReCaptchaBadgeModal />
                                        </>
                                      </GlobalTheme>
                                    </PostModalContextProvider>
                                  </ResizeMode>
                                </OverlayModeProvider>
                              </ChatsProvider>
                            </SubscriptionsProvider>
                          </CardsContextProvider>
                          {/* </WalletContextProvider> */}
                        </FollowingsContextProvider>
                      </BlockedUsersProvider>
                    </NotificationsProvider>
                  </SyncUserWrapper>
                </PersistanceProvider>
              </ChannelsContextProvider>
            </SocketContextProvider>
          </AppConstantsContextProvider>
        </GoogleReCaptchaProvider>
      </CookiesProvider>
    </>
  );
};

const MyAppWithTranslation = appWithTranslation(MyApp);

const MyAppWithTranslationAndRedux = wrapper.withRedux(MyAppWithTranslation);

MyAppWithTranslationAndRedux.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    colorMode: appContext.ctx?.req.cookies?.colorMode ?? 'auto',
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
