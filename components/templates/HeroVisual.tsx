import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { motion } from 'framer-motion';

import useImageLoaded from '../../utils/hooks/useImageLoaded';
import assets from '../../constants/assets';
// Cyclic dependency
import { AuthLayoutContext } from './AuthLayout';
import isSafari from '../../utils/isSafari';

interface IHeroVisual {
  style?: React.CSSProperties;
}

const HeroVisual: React.FunctionComponent<IHeroVisual> = ({ style }) => {
  const theme = useTheme();
  const authLayoutContext = useContext(AuthLayoutContext);

  const shouldUseCssFade = useMemo(() => isSafari(), []);

  const [currentState, setCurrentState] = useState<'intro' | 'hold' | 'outro'>(
    shouldUseCssFade ? 'hold' : 'intro'
  );
  const {
    ref: introRef,
    loaded: introLoaded,
    onLoad: onIntroLoaded,
  } = useImageLoaded();

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

  if (shouldUseCssFade) {
    return (
      <SHeroVisual
        style={style ?? {}}
        exit={{
          x: -1000,
          y: 0,
          opacity: 0,
          transition: {
            duration: 0.8,
          },
        }}
        onUnmount={() => {
          setCurrentState('outro');
        }}
      >
        <SImageWrapperAnimated
          style={{
            opacity: currentState === 'hold' ? 1 : 0,
          }}
        >
          <SImage
            src={
              theme.name === 'dark'
                ? assets.signup.darkStatic
                : assets.signup.lightStatic
            }
          />
        </SImageWrapperAnimated>
        <SImageWrapper
          style={{
            opacity: currentState === 'outro' ? 1 : 0,
          }}
        >
          <SImage
            src={
              theme.name === 'dark'
                ? assets.signup.darkOutro
                : assets.signup.lightOutro
            }
          />
        </SImageWrapper>
      </SHeroVisual>
    );
  }

  return (
    <SHeroVisual
      style={style ?? {}}
      exit={{
        x: -1000,
        y: 0,
        opacity: 0,
        transition: {
          duration: 0.8,
        },
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
          ref={(el) => {
            introRef.current = el!!;
          }}
          src={
            theme.name === 'dark'
              ? assets.signup.darkInto
              : assets.signup.lightInto
          }
          onLoad={onIntroLoaded}
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'hold' ? 1 : 0,
        }}
      >
        <SImage
          src={
            theme.name === 'dark'
              ? assets.signup.darkStatic
              : assets.signup.lightStatic
          }
        />
      </SImageWrapper>
      <SImageWrapper
        style={{
          opacity: currentState === 'outro' ? 1 : 0,
        }}
      >
        <SImage
          src={
            theme.name === 'dark'
              ? assets.signup.darkOutro
              : assets.signup.lightOutro
          }
        />
      </SImageWrapper>
    </SHeroVisual>
  );
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
    top: 25%;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 50%;
    top: 100px;
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

const FadeIn = keyframes`
  0% {
    transform: rotateX(30deg);
    perspective: 1000px;
    opacity: 0;
  }
  100% {
    transform: rotateX(0deg);
    perspective: 1000px;
    opacity: 1;
  }
`;

const SImageWrapperAnimated = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  width: 400px;
  height: 600px;

  animation: ${FadeIn} 2s forwards linear;

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
