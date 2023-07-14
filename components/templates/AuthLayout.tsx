import React, { useState, useMemo, createContext } from 'react';
import { useRouter } from 'next/router';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence } from 'framer-motion';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import HeroVisual from './components/HeroVisual';
import Container from '../atoms/Grid/Container';

import 'react-loading-skeleton/dist/skeleton.css';

import assets from '../../constants/assets';
import BaseLayout from './BaseLayout';

export const AuthLayoutContext = createContext({
  shouldHeroUnmount: false,
  setShouldHeroUnmount: (newValue: boolean) => {},
});

interface IAuthLayoutContextProvider {
  children: React.ReactNode;
}

const AuthLayoutContextProvider: React.FC<IAuthLayoutContextProvider> = ({
  children,
}) => {
  const [shouldHeroUnmount, setShouldHeroUnmount] = useState(false);

  const contextValue = useMemo(
    () => ({
      shouldHeroUnmount,
      setShouldHeroUnmount: (newValue: boolean) =>
        setShouldHeroUnmount(newValue),
    }),

    [shouldHeroUnmount]
  );

  return (
    <AuthLayoutContext.Provider value={contextValue}>
      {children}
    </AuthLayoutContext.Provider>
  );
};

export interface IAuthLayout {
  children: React.ReactNode;
}

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <BaseLayout>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <AuthLayoutContextProvider>
          <Container>
            <BackgroundVisual
              view={
                router.pathname.includes('verify-email') ||
                router.pathname.includes('verify-new-email') ||
                router.pathname.includes('unsubscribe')
                  ? 'floating-items'
                  : 'hero-visual'
              }
            />
            {!router.pathname.includes('verify-email') &&
            !router.pathname.includes('verify-new-email') ? (
              <HomeLogoButton />
            ) : null}
            <AnimatePresence>{children}</AnimatePresence>
          </Container>
        </AuthLayoutContextProvider>
      </SkeletonTheme>
    </BaseLayout>
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

const SHomeLogoButton = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  ${(props) => props.theme.media.laptop} {
    display: block;
    padding-top: 16px;
    padding-bottom: 16px;
  }
`;

// 3D Visuals

interface IBackgroundVisual {
  view: 'floating-items' | 'hero-visual';
}

const BackgroundVisual: React.FunctionComponent<IBackgroundVisual> = ({
  view,
}) => (
  <SBackgroundVisual>
    <AnimatePresence>
      {view === 'hero-visual' && (
        <HeroVisualContainer>
          <HeroVisual key='hero-visual' />
        </HeroVisualContainer>
      )}
      {view === 'floating-items' && <VerifyEmailVisual />}
    </AnimatePresence>
  </SBackgroundVisual>
);

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

const HeroVisualContainer = styled('div')`
  position: absolute;
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;

    right: 55%;
    top: 25%;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 50%;
    top: 100px;
  }
`;

const VerifyEmailVisual: React.FunctionComponent = () => {
  const theme = useTheme();

  return (
    <SVerifyEmailBgWrapper>
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkBottomGlassSphere
            : assets.floatingAssets.lightBottomGlassSphere
        }
        alt='background'
        className='email-bg-BottomGlassSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkBottomSphere
            : assets.floatingAssets.lightBottomSphere
        }
        alt='background'
        className='email-bg-BottomSphereImage'
      />
      {/* <img
        src={assets.floatingAssets.darkCrowdfunding}
        alt='background'
        className='email-bg-CrowdfundingImage'
      /> */}
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkLeftGlassSphere
            : assets.floatingAssets.lightLeftGlassSphere
        }
        alt='background'
        className='email-bg-LeftGlassSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        className={`email-bg-BulbImage ${theme.name}`}
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkMultipleChoice
            : assets.floatingAssets.lightMultipleChoice
        }
        alt='background'
        className='email-bg-ChoiceImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkRightGlassSphere
            : assets.floatingAssets.lightRightGlassSphere
        }
        alt='background'
        className='email-bg-RightGlassSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkTopGlassSphere
            : assets.floatingAssets.lightTopGlassSphere
        }
        alt='background'
        className='email-bg-TopGlassSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkTopMiddleSphere
            : assets.floatingAssets.lightTopMiddleSphere
        }
        alt='background'
        className='email-bg-TopMiddleSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkBottomSphere
            : assets.floatingAssets.lightBottomSphere
        }
        alt='background'
        className='email-bg-BottomMiddleSphereImage'
      />
      <img
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkVotes
            : assets.floatingAssets.lightVotes
        }
        alt='background'
        className='email-bg-VotesImage'
      />
    </SVerifyEmailBgWrapper>
  );
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

    animation: enter-CrowdfundingImage ease forwards 1.4s,
      floating-CrowdfundingImage infinite alternate linear 3.2s 1.4s;
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

    animation: enter-BulbImage ease forwards 1.4s,
      floating infinite alternate linear 3.6s 1.4s;

    &.light {
      @media (max-width: 1440px) {
        height: 135px;
      }

      height: 175px;
      top: 5px;
    }
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

    animation: enter-ChoiceImage ease forwards 1.4s,
      floating infinite alternate ease-out 3.8s 1.4s;
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

    animation: enter-VotesImage ease forwards 1.5s,
      floating infinite alternate ease-in 4s 1.5s;
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
