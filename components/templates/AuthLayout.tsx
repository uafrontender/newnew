/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';


import SignInIntro from '../../public/images/signup/hero-visual/sign-in-intro-fade.webp';
import SignInHold from '../../public/images/signup/hero-visual/Sign-In-Hold-Frame.png';
import SignInOutro from '../../public/images/signup/hero-visual/sign-in-outro.webp';

export const AuthLayoutContext = createContext({
  shouldHeroUnmount: false,
  setShouldHeroUnmount: (newValue: boolean) => {},
});

const AuthLayoutContextProvider: React.FC = ({ children }) => {
  const [shouldHeroUnmount, setShouldHeroUnmount] = useState(false);

  const contextValue = useMemo(
    () => ({
      shouldHeroUnmount,
      setShouldHeroUnmount: (newValue: boolean) => setShouldHeroUnmount(newValue),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldHeroUnmount]
  );

  return <AuthLayoutContext.Provider value={contextValue}>{children}</AuthLayoutContext.Provider>;
}

export interface IAuthLayout {}

const SAuthLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
`;

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <AuthLayoutContextProvider>
          <SAuthLayout>
            <BackgroundVisual
              view={router.pathname.includes('verify-email') ? 'verify-email' : 'sign-up'}
            />
            {
              !router.pathname.includes('verify-email') ? (
                <HomeLogoButton />
              ) : null
            }
            <AnimatePresence>
              {children}
            </AnimatePresence>
          </SAuthLayout>
        </AuthLayoutContextProvider>
      </SkeletonTheme>
    </ErrorBoundary>
  );
};

export default AuthLayout;

const HomeLogoButton: React.FunctionComponent = () => (
  <SHomeLogoButton>
    <Row>
      <Col>
        <Logo />
      </Col>
    </Row>
  </SHomeLogoButton>
);

const SHomeLogoButton = styled(Container)`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;

    position: relative;
    margin: 12px 0px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 16px 0;
  }
`;

// 3D Visuals

interface IBackgroundVisual {
  view: 'verify-email' | 'sign-up';
}

const BackgroundVisual:React.FunctionComponent<IBackgroundVisual> = ({
  view,
}) => {

  return (
    <SBackgroundVisual>
      {view === 'sign-up' && (
        <HeroVisual/>
      )}
    </SBackgroundVisual>
  )
};

const SBackgroundVisual = styled.div`
  display: none;

  ${({ theme }) => theme.media.laptop} {
    display: block;

    position: absolute;
    top: 0;
    left: 0px;
    z-index: -1;

    width: 100%;
    height: 90%;

    color: #000;
    text-align: center;
  }
`;

const HeroVisual: React.FunctionComponent = () => {
  const [currentState, setCurrentState] = useState<'intro' | 'hold' | 'outro'>('intro');

  const authLayoutContext = useContext(AuthLayoutContext);

  useEffect(() => {
    setTimeout(() => {
      setCurrentState('hold');
    }, 3000);
  }, []);

  useEffect(() => {
    if (authLayoutContext.shouldHeroUnmount) {
      setCurrentState('outro');
    }
  }, [authLayoutContext.shouldHeroUnmount]);

  return (
    <SHeroVisual
      style={{
        ...(authLayoutContext.shouldHeroUnmount ? {
          transform: 'translateX(-200px)',
          transition: '0.6s linear'
        } : {})
      }}
    >
      <SImageWrapper
        style={{
          opacity: currentState === 'intro' ? 1 : 0,
        }}
      >
        <Image
          src={SignInIntro}
          height={960}
          objectFit="contain"
          priority
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'hold' ? 1 : 0,
        }}
      >
        <Image
          src={SignInHold}
          height={960}
          objectFit="contain"
          priority
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'outro' ? 1 : 0,
        }}
      >
        <Image
          src={SignInOutro}
          height={960}
          objectFit="contain"
          priority
        />
      </SImageWrapper>
    </SHeroVisual>
  )
};

const SHeroVisual = styled.div`
  position: absolute;

  right: 50%;
  top: 180px;
`;

const SImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  width: 600px;
  height: 700px;
`;
