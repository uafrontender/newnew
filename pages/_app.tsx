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
import VideoProcessingWrapper from '../contexts/videoProcessingWrapper';

// Images to be prefetched
// Sign in
import SignInIntro from '../public/images/signup/hero-visual/Dark/sign-in-intro-fade.webp';
import SignInHold from '../public/images/signup/hero-visual/Dark/Sign-In-Hold-Frame.png';
import SignInOutro from '../public/images/signup/hero-visual/Dark/sign-in-outro.webp';
import SignInIntroLight from '../public/images/signup/hero-visual/Light/sign-in-intro-fade-light.webp';
import SignInHoldLight from '../public/images/signup/hero-visual/Light/Sign-In-Hold-Frame-Light.png';
import SignInOutroLight from '../public/images/signup/hero-visual/Light/sign-in-outro-light.webp';
// Email verification
import BottomGlassSphereImage from '../public/images/signup/floating-assets/Bottom-Glass-Sphere.png';
import BottomSphereImage from '../public/images/signup/floating-assets/Bottom-Sphere.png';
import CrowdfundingImage from '../public/images/signup/floating-assets/Crowdfunding.png';
import LeftGlassSphereImage from '../public/images/signup/floating-assets/Left-Glass-Sphere.png';
import BulbImage from '../public/images/signup/floating-assets/Sub-MC.webp';
import ChoiceImage from '../public/images/signup/floating-assets/Multiple-Choice.png';
import RightGlassSphereImage from '../public/images/signup/floating-assets/Right-Glass-Sphere.png';
import TopGlassSphereImage from '../public/images/signup/floating-assets/Top-Glass-Sphere.png';
import TopMiddleSphereImage from '../public/images/signup/floating-assets/Top-Middle-Sphere.png';
import VotesImage from '../public/images/signup/floating-assets/Votes.png';
// Posts
import acImage from '../public/images/creation/AC.webp';
import mcImage from '../public/images/creation/MC.webp';
import cfImage from '../public/images/creation/CF.webp';
import acImageStatic from '../public/images/creation/AC-static.png';
import mcImageStatic from '../public/images/creation/MC-static.png';
import cfImageStatic from '../public/images/creation/CF-static.png';
// Landing
import HeroDarkPlaceholder from '../public/images/home/Landing-Page-Hold-Frame-Dark.webp';
import HeroLightPlaceholder from '../public/images/home/Landing-Page-Hold-Frame-Light.webp';
import HeroDarkMobilePlaceholder from '../public/images/home/Landing-Page-Mobile-Dark-Hold-Frame.webp';
import HeroLightMobilePlaceholder from '../public/images/home/Landing-Page-Mobile-Light-Hold-Frame.webp';

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
        <meta charSet='utf-8' />
        <meta name='robots' content='noindex' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, user-scalable=no'
        />
        {/* Preload assets */}
        {/* Sign up screen hero */}
        {/* Dark */}
        <link
          rel='prefetch'
          href={SignInHold.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={SignInIntro.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={SignInOutro.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        {/* Light */}
        <link
          rel='prefetch'
          href={SignInHoldLight.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={SignInIntroLight.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={SignInOutroLight.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        {/* Email verification screen */}
        <link
          rel='prefetch'
          href={BottomGlassSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={BottomSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={CrowdfundingImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={LeftGlassSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={BulbImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={ChoiceImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={RightGlassSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={TopGlassSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={TopMiddleSphereImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        <link
          rel='prefetch'
          href={VotesImage.src}
          as='image'
          crossOrigin='anonymous'
          media='(min-width: 760px)'
        />
        {/* Landing page */}
        {/* NB! Video is not supported, so preload placeholders */}
        {/* Dark */}
        {/* <link rel="preload" href="/images/home/Landing-Page-Dark.mp4" as="video" crossOrigin="anonymous" /> */}
        <link
          rel='prefetch'
          href={HeroDarkPlaceholder.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={HeroLightPlaceholder.src}
          as='image'
          crossOrigin='anonymous'
        />
        {/* Light */}
        <link
          rel='prefetch'
          href={HeroDarkMobilePlaceholder.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={HeroLightMobilePlaceholder.src}
          as='image'
          crossOrigin='anonymous'
        />
        {/* Creation screen */}
        <link
          rel='prefetch'
          href={acImage.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={mcImage.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={cfImage.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={acImageStatic.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={mcImageStatic.src}
          as='image'
          crossOrigin='anonymous'
        />
        <link
          rel='prefetch'
          href={cfImageStatic.src}
          as='image'
          crossOrigin='anonymous'
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
                                  <VideoProcessingWrapper>
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
                                  </VideoProcessingWrapper>
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
