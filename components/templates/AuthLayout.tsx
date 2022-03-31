/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

// Sign in
import SignInIntro from '../../public/images/signup/hero-visual/Dark/sign-in-intro-fade.webp';
import SignInHold from '../../public/images/signup/hero-visual/Dark/Sign-In-Hold-Frame.png';
import SignInOutro from '../../public/images/signup/hero-visual/Dark/sign-in-outro.webp';
import SignInIntroLight from '../../public/images/signup/hero-visual/Light/sign-in-intro-fade-light.webp';
import SignInHoldLight from '../../public/images/signup/hero-visual/Light/Sign-In-Hold-Frame-Light.png';
import SignInOutroLight from '../../public/images/signup/hero-visual/Light/sign-in-outro-light.webp';

// Email verification
import BottomGlassSphereImage from '../../public/images/signup/floating-assets/Bottom-Glass-Sphere.png';
import BottomSphereImage from '../../public/images/signup/floating-assets/Bottom-Sphere.png';
import CrowdfundingImage from '../../public/images/signup/floating-assets/Crowdfunding.png';
import LeftGlassSphereImage from '../../public/images/signup/floating-assets/Left-Glass-Sphere.png';
// import BulbImage from '../../public/images/signup/floating-assets/Light-Bulb.png';
import BulbImage from '../../public/images/signup/floating-assets/Sub-MC.webp';
import ChoiceImage from '../../public/images/signup/floating-assets/Multiple-Choice.png';
import RightGlassSphereImage from '../../public/images/signup/floating-assets/Right-Glass-Sphere.png';
import TopGlassSphereImage from '../../public/images/signup/floating-assets/Top-Glass-Sphere.png';
import TopMiddleSphereImage from '../../public/images/signup/floating-assets/Top-Middle-Sphere.png';
import VotesImage from '../../public/images/signup/floating-assets/Votes.png';

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
      <AnimatePresence>
        {view === 'sign-up' && (
          <HeroVisual key="hero-visual"/>
        )}
        {view === 'verify-email' && (
          <VerifyEmailVisual/>
        )}
      </AnimatePresence>
    </SBackgroundVisual>
  )
};

const SBackgroundVisual = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
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
  const theme = useTheme();
  const [currentState, setCurrentState] = useState<'intro' | 'hold' | 'outro'>('intro');
  const [introLoaded, setIntroLoaded] = useState(false);

  const authLayoutContext = useContext(AuthLayoutContext);

  useEffect(() => {
    if (introLoaded) {
      setTimeout(() => {
        setCurrentState('hold');
      }, 3000);
    }
  }, [introLoaded]);

  useEffect(() => {
    if (authLayoutContext.shouldHeroUnmount) {
      setCurrentState('outro');
    }
  }, [authLayoutContext.shouldHeroUnmount]);

  return (
    <SHeroVisual
      exit={{
        x: -1000,
        y: 0,
        opacity: 0,
        transition: {
          duration: 0.8
        }
      }}
      onUnmount={() => {
        setCurrentState('outro');
      }}
    >
      <SImageWrapper
        style={{
          opacity: currentState === 'intro' ? 1 : 0,
        }}
      >
        <Image
          src={theme.name === 'dark' ? SignInIntro : SignInIntroLight}
          height={960}
          objectFit="contain"
          priority
          onLoad={() => {
            setIntroLoaded(true);
          }}
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'hold' ? 1 : 0,
        }}
      >
        <Image
          src={theme.name === 'dark' ? SignInHold : SignInHoldLight}
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
          src={theme.name === 'dark' ? SignInOutro : SignInOutroLight}
          height={960}
          objectFit="contain"
          priority
        />
      </SImageWrapper>
    </SHeroVisual>
  )
};

const SHeroVisual = styled(motion.div)`
  position: absolute;
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;

    right: 55%;
    top: 25%
  }

  ${({ theme }) => theme.media.laptop} {
    right: 50%;
    top: 180px;
  }
`;

const SImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  width: 400px;
  height: 600px;

  ${({ theme }) => theme.media.laptop} {
    width: 600px;
    height: 700px;
  }
`;

const VerifyEmailVisual: React.FunctionComponent = () => {

  return (
    <SVerifyEmailBgWrapper>
      <img
        src={BottomGlassSphereImage.src}
        alt="background"
        className="email-bg-BottomGlassSphereImage"
      />
      <img
        src={BottomSphereImage.src}
        alt="background"
        className="email-bg-BottomSphereImage"
      />
      <img
        src={CrowdfundingImage.src}
        alt="background"
        className="email-bg-CrowdfundingImage"
      />
      <img
        src={LeftGlassSphereImage.src}
        alt="background"
        className="email-bg-LeftGlassSphereImage"
      />
      <img
        src={BulbImage.src}
        alt="background"
        className="email-bg-BulbImage"
      />
      <img
        src={ChoiceImage.src}
        alt="background"
        className="email-bg-ChoiceImage"
      />
      <img
        src={RightGlassSphereImage.src}
        alt="background"
        className="email-bg-RightGlassSphereImage"
      />
      <img
        src={TopGlassSphereImage.src}
        alt="background"
        className="email-bg-TopGlassSphereImage"
      />
      <img
        src={TopMiddleSphereImage.src}
        alt="background"
        className="email-bg-TopMiddleSphereImage"
      />
      <img
        src={TopMiddleSphereImage.src}
        alt="background"
        className="email-bg-BottomMiddleSphereImage"
      />
      <img
        src={VotesImage.src}
        alt="background"
        className="email-bg-VotesImage"
      />
    </SVerifyEmailBgWrapper>
  )
};

const SVerifyEmailBgWrapper = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;

  overflow: hidden;

  @media (max-width: 1150px) {
    display: none;
  }

  .email-bg-BottomGlassSphereImage {
    position: absolute;
    left: 25vw;
    bottom: -75px;

    @media (max-width: 1440px) {
      height: 80px;
    }
    height: 140px;
    object-fit: contain;

    animation: enter-BottomSphereImage ease forwards 1.4s;
  }

  .email-bg-BottomSphereImage {
    position: absolute;
    left: 50%;
    bottom: 60px;

    @media (max-width: 1440px) {
      height: 80px;
    }
    height: 140px;
    object-fit: contain;

    animation: enter-BottomSphereImage ease forwards 1.4s;
  }

  .email-bg-CrowdfundingImage {
    position: absolute;
    left: 9vw;
    top: 140px;

    @media (max-width: 1440px) {
      height: 210px;
    }
    height: 280px;
    object-fit: contain;

    transform: rotate(-30deg);

    animation: enter-CrowdfundingImage ease forwards 1.4s, floating-CrowdfundingImage infinite alternate linear 3.2s 1.4s;
  }

  .email-bg-LeftGlassSphereImage {
    position: absolute;
    left: 8vw;
    top: 52vh;

    @media (max-width: 1440px) {
      height: 50px;
    }
    height: 80px;
    object-fit: contain;

    /* animation: enter-LeftGlassSphereImage ease forwards 1.4s, floating infinite alternate linear 1s 1.4s; */
    animation: enter-LeftGlassSphereImage ease forwards 1.4s;
  }

  .email-bg-BulbImage {
    position: absolute;
    right: 10vw;
    top: -40px;

    @media (max-width: 1440px) {
      height: 210px;
    }
    height: 280px;
    object-fit: contain;

    animation: enter-BulbImage ease forwards 1.4s, floating infinite alternate linear 3.6s 1.4s;
  }

  .email-bg-ChoiceImage {
    position: absolute;
    right: 15vw;
    bottom: -80px;

    @media (max-width: 1440px) {
      height: 210px;
    }
    height: 280px;
    object-fit: contain;

    animation: enter-ChoiceImage ease forwards 1.4s, floating infinite alternate ease-out 3.8s 1.4s;
  }

  .email-bg-RightGlassSphereImage {
    position: absolute;
    right: 9.5vw;
    top: 40vh;

    @media (max-width: 1440px) {
      height: 140px;
    }
    height: 180px;
    object-fit: contain;

    /* animation: enter-RightGlassSphereImage ease forwards 1.4s, floating infinite alternate linear 1s 1.4s; */
    animation: enter-RightGlassSphereImage ease forwards 1.4s;
  }

  .email-bg-TopGlassSphereImage {
    position: absolute;
    right: 35vw;
    top: -45px;

    @media (max-width: 1440px) {
      height: 80px;
    }
    height: 140px;
    object-fit: contain;

    /* animation: enter-TopGlassSphereImage ease forwards 1.4s, floating infinite alternate linear 1s 1.4s; */
    animation: enter-TopGlassSphereImage ease forwards 1.4s;
  }

  .email-bg-TopMiddleSphereImage {
    position: absolute;
    left: 35vw;
    top: 10vh;

    @media (max-width: 1440px) {
      height: 70px;
    }
    height: 100px;
    object-fit: contain;

    /* animation: enter-TopMiddleSphereImage ease forwards 1.2s, floating infinite alternate linear 1.2s 1.2s; */
    animation: enter-TopMiddleSphereImage ease forwards 1.2s;
  }

  .email-bg-BottomMiddleSphereImage {
    position: absolute;
    left: 40vw;
    bottom: 20vh;

    @media (max-width: 1440px) {
      height: 50px;
    }
    height: 80px;
    object-fit: contain;

    /* animation: enter-BottomMiddleSphereImage ease forwards 1.2s, floating infinite alternate linear 1.2s 1.2s; */
    animation: enter-BottomMiddleSphereImage ease forwards 1.2s;
  }

  .email-bg-VotesImage {
    position: absolute;
    left: 14vw;
    bottom: 8vh;

    @media (max-width: 1440px) {
      height: 180px;
    }
    height: 240px;

    object-fit: contain;

    animation: enter-VotesImage ease forwards 1.5s, floating infinite alternate ease-in 4s 1.5s;
  }


  @keyframes floating {
    0% {
      transform: translateY(0) translateX(0) rotate(0);
    }
    50% {
      transform: translateY(-2px) translateX(-3px) rotate(-3deg);
    }
    100% {
      transform: translateY(4px) translateX(3px) rotate(3deg);
    }
  }

  @keyframes enter-VotesImage {
    from {
      transform: translate(-200px, 500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-TopMiddleSphereImage {
    from {
      transform: translate(-300px, -500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-TopGlassSphereImage {
    from {
      transform: translate(-300px, -500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-RightGlassSphereImage {
    from {
      transform: translate(500px, 0px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-ChoiceImage {
    from {
      transform: translate(300px, 500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-BulbImage {
    from {
      transform: translate(300px, -500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-CrowdfundingImage {
    from {
      transform: translate(-300px, -200px);
    }
    to {
      transform: rotate(-30deg) translate(0px, 0px);
    }
  }

  @keyframes floating-CrowdfundingImage {
    0% {
      transform: translateY(0) translateX(0) rotate(-30deg);
    }
    50% {
      transform: translateY(-2px) translateX(-3px) rotate(-33deg);
    }
    100% {
      transform: translateY(4px) translateX(3px) rotate(-30deg);
    }
  }

  @keyframes enter-LeftGlassSphereImage {
    from {
      transform: translate(-300px, 0px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-BottomSphereImage {
    from {
      transform: translate(0px, 500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }

  @keyframes enter-BottomMiddleSphereImage {
    from {
      transform: translate(0px, 500px);
    }
    to {
      transform: translate(0px, 0px);
    }
  }
`;
