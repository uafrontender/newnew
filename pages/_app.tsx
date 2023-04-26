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
import { appWithTranslation } from 'next-i18next';
import { hotjar } from 'react-hotjar';
import * as Sentry from '@sentry/browser';
import Router, { useRouter } from 'next/router';
import moment from 'moment-timezone';
import countries from 'i18n-iso-countries';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Custom error page
import Error from './_error';

// Global CSS configurations
import withRecaptchaProvider from '../HOC/withRecaptcha';
import GlobalTheme from '../styles/ThemeProvider';

// Redux store and provider
import { useAppSelector, wrapper } from '../redux-store/store';

// Socket context
import SocketContextProvider from '../contexts/socketContext';

// Global Cookies instance
import { cookiesInstance } from '../api/apiConfigs';

import 'react-toastify/dist/ReactToastify.css';
import ChannelsContextProvider from '../contexts/channelsContext';
import FollowingsContextProvider from '../contexts/followingContext';
import { BlockedUsersProvider } from '../contexts/blockedUsersContext';
import { ChatsUnreadMessagesProvider } from '../contexts/chatsUnreadMessagesContext';
import SyncUserWrapper from '../contexts/syncUserWrapper';
import LanguageWrapper from '../contexts/languageWrapper';
import AppConstantsContextProvider from '../contexts/appConstantsContext';
import VideoProcessingWrapper from '../contexts/videoProcessingWrapper';
import PushNotificationContextProvider from '../contexts/pushNotificationsContext';

// Images to be prefetched
import assets from '../constants/assets';

// Landing
import getColorMode from '../utils/getColorMode';
import { NotificationsProvider } from '../contexts/notificationsContext';
import PersistanceProvider from '../contexts/PersistenceProvider';
import ModalNotificationsContextProvider from '../contexts/modalNotificationsContext';
import { Mixpanel } from '../utils/mixpanel';

import { OverlayModeProvider } from '../contexts/overlayModeContext';
import ErrorBoundary from '../components/organisms/ErrorBoundary';
import PushNotificationModalContainer from '../components/organisms/PushNotificationsModalContainer';
import { BundlesContextProvider } from '../contexts/bundlesContext';
import MultipleBeforePopStateContextProvider from '../contexts/multipleBeforePopStateContext';
import AppStateContextProvider from '../contexts/appStateContext';
import PostCreationContextProvider from '../contexts/postCreationContext';

// interface for shared layouts
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface IMyApp extends AppProps {
  Component: NextPageWithLayout;
  uaString: string;
  colorMode: string;
  themeFromCookie?: 'light' | 'dark';
}

const queryClient = new QueryClient();

// Loader
const NO_LOADER_ROUTES = [
  '/creator/dashboard?tab=chat',
  '/creator/dashboard?tab=notifications',
];

NProgress.configure({ showSpinner: false, trickleSpeed: 300, speed: 500 });

Router.events.on('routeChangeStart', (url) => {
  if (!NO_LOADER_ROUTES.includes(url)) {
    NProgress.start();
  }
});
Router.events.on('routeChangeComplete', (url) => {
  if (!NO_LOADER_ROUTES.includes(url)) {
    NProgress.done();
  }

  Mixpanel.track('Route Change Complete', {
    _stage: 'Routing',
    _url: url,
  });
});
Router.events.on('routeChangeError', (err, url) => {
  if (!NO_LOADER_ROUTES.includes(url)) {
    NProgress.done();
  }
});

const MyApp = (props: IMyApp): ReactElement => {
  const { Component, pageProps, uaString, colorMode, themeFromCookie } = props;
  const store = useStore();
  const user = useAppSelector((state) => state.user);
  const { locale } = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentLocale, setCurrentLocale] = useState(locale);

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
    // Imported one by one not to break import\no-dynamic-require rule
    if (locale === 'zh') {
      // eslint-disable-next-line global-require
      require('moment/locale/zh-tw');
      moment.locale('zh-tw');
      // eslint-disable-next-line global-require
      countries.registerLocale(require('i18n-iso-countries/langs/zh.json'));
    } else if (locale === 'es') {
      // eslint-disable-next-line global-require
      require('moment/locale/es');
      moment.locale('es');
      // eslint-disable-next-line global-require
      countries.registerLocale(require('i18n-iso-countries/langs/es.json'));
    } else if (locale === 'en-US') {
      moment.locale('en-US');
      // eslint-disable-next-line global-require
      countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
    }

    // Force update is needed as new locale applies only to new moments
    // This makes components which use moment not pure and this not optimizable
    // Solutions: force re-render of the whole tree, reload page,
    // Expand router to handle moment.locale before setting state and force dependencies to locale where moment is used
    setCurrentLocale(locale);
  }, [locale]);

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
      Mixpanel.identify(user.userData.userUuid);
      Mixpanel.people.set({
        $name: user.userData.username,
        $email: user.userData.email,
        newnewId: user.userData.userUuid,
        isCreator: user.userData.options?.isCreator,
      });
      Mixpanel.register({
        isCreator: user.userData.options?.isCreator,
        username: user.userData.username,
      });
      Mixpanel.track('Session started!');
    } else {
      Mixpanel.track('Guest Session started!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

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
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppStateContextProvider uaString={uaString}>
              <GlobalTheme
                initialTheme={colorMode}
                themeFromCookie={themeFromCookie}
              >
                <LanguageWrapper>
                  <AppConstantsContextProvider>
                    <SocketContextProvider>
                      <ChannelsContextProvider>
                        <PersistanceProvider store={store}>
                          <SyncUserWrapper>
                            <NotificationsProvider>
                              <ModalNotificationsContextProvider>
                                <PushNotificationContextProvider>
                                  <BlockedUsersProvider>
                                    <FollowingsContextProvider>
                                      <BundlesContextProvider>
                                        <ChatsUnreadMessagesProvider>
                                          <OverlayModeProvider>
                                            <MultipleBeforePopStateContextProvider>
                                              <PostCreationContextProvider>
                                                <>
                                                  <ToastContainer containerId='toast-container' />
                                                  <VideoProcessingWrapper>
                                                    {!pageProps.error ? (
                                                      getLayout(
                                                        <Component
                                                          {...pageProps}
                                                        />
                                                      )
                                                    ) : (
                                                      <Error
                                                        title={
                                                          pageProps.error
                                                            ?.message
                                                        }
                                                        statusCode={
                                                          pageProps.error
                                                            ?.statusCode ?? 500
                                                        }
                                                      />
                                                    )}
                                                    <PushNotificationModalContainer />
                                                  </VideoProcessingWrapper>
                                                </>
                                              </PostCreationContextProvider>
                                            </MultipleBeforePopStateContextProvider>
                                          </OverlayModeProvider>
                                        </ChatsUnreadMessagesProvider>
                                      </BundlesContextProvider>
                                    </FollowingsContextProvider>
                                  </BlockedUsersProvider>
                                </PushNotificationContextProvider>
                              </ModalNotificationsContextProvider>
                            </NotificationsProvider>
                          </SyncUserWrapper>
                        </PersistanceProvider>
                      </ChannelsContextProvider>
                    </SocketContextProvider>
                  </AppConstantsContextProvider>
                </LanguageWrapper>
              </GlobalTheme>
            </AppStateContextProvider>
          </ErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </CookiesProvider>
    </>
  );
};

const MyAppWithTranslation = appWithTranslation(MyApp);

const MyAppWithTranslationAndRecaptchaProvider = withRecaptchaProvider(
  MyAppWithTranslation as React.FunctionComponent
);

const MyAppWithTranslationAndRecaptchaProviderAndRedux = wrapper.withRedux(
  MyAppWithTranslationAndRecaptchaProvider
);

MyAppWithTranslationAndRecaptchaProviderAndRedux.getInitialProps = async (
  appContext: any
) => {
  const appProps = await App.getInitialProps(appContext);

  if (appContext.ctx?.req.cookies?.timezone) {
    const timezoneFromClient = appContext.ctx?.req.cookies?.timezone;
    const hoursClient = moment().tz(timezoneFromClient).hours();

    const isDayTime = hoursClient > 7 && hoursClient < 18;

    return {
      ...appProps,
      colorMode: appContext.ctx?.req.cookies?.colorMode ?? 'auto',
      uaString: appContext.ctx?.req?.headers?.['user-agent'],
      themeFromCookie: isDayTime ? 'light' : 'dark',
    };
  }

  return {
    ...appProps,
    colorMode: appContext.ctx?.req.cookies?.colorMode || 'light',
    uaString: appContext.ctx?.req?.headers?.['user-agent'],
  };
};

export default MyAppWithTranslationAndRecaptchaProviderAndRedux;

// Preload assets
const PRE_FETCH_LINKS_COMMON = (
  <>
    {/* Email verification screen */}
    {/* Sign up screen hero */}
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkBottomGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkBottomSphere}
      as='image'
      media='(min-width: 760px)'
    />
    {/* <link
      rel='prefetch'
      href={assets.floatingAssets.darkCrowdfunding}
      as='image'
      media='(min-width: 760px)'
    /> */}
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkLeftGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkSubMC}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkMultipleChoice}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkRightGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkTopGlassSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkTopMiddleSphere}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.floatingAssets.darkVotes}
      as='image'
      media='(min-width: 760px)'
    />
    {/* Common */}
    <link rel='prefetch' href={assets.common.vote} as='image' />
    <link rel='prefetch' href={assets.decision.votes} as='image' />
  </>
);

const PRE_FETCH_LINKS_DARK = (
  <>
    <link
      rel='prefetch'
      href={assets.signup.darkIntroStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.darkIntoAnimated()}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.darkIntroStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.darkOutroAnimated()}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.decision.darkHourglassAnimated()}
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
    <link rel='prefetch' href={assets.info.darkQuestionMarkVideo} as='image' />
    <link rel='prefetch' href={assets.info.darkQuestionMarkStatic} as='image' />
    {/* Creation screen */}
    <link rel='prefetch' href={assets.common.ac.darkAcAnimated()} as='image' />
    <link rel='prefetch' href={assets.common.mc.darkMcAnimated()} as='image' />
    {/* <link rel='prefetch' href={assets.creation.darkCfAnimated()} as='image' /> */}
    <link rel='prefetch' href={assets.common.ac.darkAcStatic} as='image' />
    <link rel='prefetch' href={assets.common.mc.darkMcStatic} as='image' />
    {/* <link rel='prefetch' href={assets.creation.darkCfStatic} as='image' /> */}
    {/* Bundle assets (static is not used yet, preload when used) */}
    <link rel='prefetch' href={assets.bundles.darkBundles} as='image' />
    {assets.bundles.darkVotes.map((asset) => (
      <link
        key={asset.static}
        rel='prefetch'
        href={asset.animated()}
        as='image'
      />
    ))}
  </>
);

const PRE_FETCH_LINKS_LIGHT = (
  <>
    <link
      rel='prefetch'
      href={assets.signup.lightIntroStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.lightIntoAnimated()}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.lightIntroStatic}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.signup.lightOutroAnimated()}
      as='image'
      media='(min-width: 760px)'
    />
    <link
      rel='prefetch'
      href={assets.decision.lightHourglassAnimated()}
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
    <link rel='prefetch' href={assets.info.lightQuestionMarkVideo} as='image' />
    <link
      rel='prefetch'
      href={assets.info.lightQuestionMarkStatic}
      as='image'
    />
    {/* Creation screen */}
    <link rel='prefetch' href={assets.common.ac.lightAcAnimated()} as='image' />
    <link rel='prefetch' href={assets.common.mc.lightMcAnimated()} as='image' />
    {/* <link rel='prefetch' href={assets.creation.lightCfAnimated()} as='image' /> */}
    <link rel='prefetch' href={assets.common.ac.lightAcStatic} as='image' />
    <link rel='prefetch' href={assets.common.mc.lightMcStatic} as='image' />
    {/* <link rel='prefetch' href={assets.creation.lightCfStatic} as='image' /> */}
    {/* Bundle assets (static is not used yet, preload when used) */}
    <link rel='prefetch' href={assets.bundles.lightBundles} as='image' />
    {assets.bundles.lightVotes.map((asset, i) => (
      <link
        key={asset.static}
        rel='prefetch'
        href={asset.animated()}
        as='image'
      />
    ))}
  </>
);
