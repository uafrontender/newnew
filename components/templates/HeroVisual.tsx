import React, { useContext, useEffect, useState } from "react"
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { AuthLayoutContext } from './AuthLayout';

// Sign in
import SignInIntro from '../../public/images/signup/hero-visual/Dark/sign-in-intro-fade.webp';
import SignInHold from '../../public/images/signup/hero-visual/Dark/Sign-In-Hold-Frame.png';
import SignInOutro from '../../public/images/signup/hero-visual/Dark/sign-in-outro.webp';
import SignInIntroLight from '../../public/images/signup/hero-visual/Light/sign-in-intro-fade-light.webp';
import SignInHoldLight from '../../public/images/signup/hero-visual/Light/Sign-In-Hold-Frame-Light.png';
import SignInOutroLight from '../../public/images/signup/hero-visual/Light/sign-in-outro-light.webp';

interface IHeroVisual {
  style?: React.CSSProperties;
}

const HeroVisual: React.FunctionComponent<IHeroVisual> = ({style}) => {
  const theme = useTheme();
  const [currentState, setCurrentState] = useState<'intro' | 'hold' | 'outro'>('intro');
  const [introLoaded, setIntroLoaded] = useState(false);

  const authLayoutContext = useContext(AuthLayoutContext);

  useEffect(() => {
    if (introLoaded) {
      setTimeout(() => {
        setCurrentState('hold');
      }, 2800);
    }
  }, [introLoaded]);

  useEffect(() => {
    if (authLayoutContext.shouldHeroUnmount) {
      setCurrentState('outro');
    }
  }, [authLayoutContext.shouldHeroUnmount]);

  return (
    <SHeroVisual
      style={style ?? {}}
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
        <SImage
          src={theme.name === 'dark' ? SignInIntro.src : SignInIntroLight.src}
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
        <SImage
          src={theme.name === 'dark' ? SignInHold.src : SignInHoldLight.src}
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'outro' ? 1 : 0,
        }}
      >
        <SImage
          src={theme.name === 'dark' ? SignInOutro.src : SignInOutroLight.src}
        />
      </SImageWrapper>
    </SHeroVisual>
  )
};

HeroVisual.defaultProps = {
  style: {},
};

export default HeroVisual;

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

const SImage = styled.img`
  object-fit: contain;

  max-height: 960px;
  max-width: 100%;
`;