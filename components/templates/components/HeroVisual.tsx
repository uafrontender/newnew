/* eslint-disable consistent-return */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { AuthLayoutContext } from '../AuthLayout';
import useImageLoaded from '../../../utils/hooks/useImageLoaded';
import assets from '../../../constants/assets';
// Cyclic dependency
import isSafari from '../../../utils/isSafari';

interface IHeroVisual {}

const HeroVisual: React.FunctionComponent<IHeroVisual> = React.memo(() => {
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
      const timer = setTimeout(() => {
        setCurrentState('hold');
      }, 2800);
      return () => {
        clearTimeout(timer);
      };
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
        exit={{
          x: -1000,
          y: 0,
          opacity: 0,
          transition: {
            duration: 0.8,
          },
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
                ? assets.signup.darkOutroAnimated
                : assets.signup.lightOutroAnimated
            }
          />
        </SImageWrapper>
      </SHeroVisual>
    );
  }

  return (
    <SHeroVisual
      exit={{
        x: -1000,
        y: 0,
        opacity: 0,
        transition: {
          duration: 0.8,
        },
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
              ? assets.signup.darkIntoAnimated
              : assets.signup.lightIntoAnimated
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
              ? assets.signup.darkOutroAnimated
              : assets.signup.lightOutroAnimated
          }
        />
      </SImageWrapper>
    </SHeroVisual>
  );
});

HeroVisual.defaultProps = {
  style: {},
};

export default HeroVisual;

const SHeroVisual = styled(motion.div)`
  position: relative;
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
