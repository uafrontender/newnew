import React, { useContext, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';

import useImageLoaded from '../../utils/hooks/useImageLoaded';

import assets from '../../constants/assets';
import { AuthLayoutContext } from './AuthLayout';

interface IHeroVisual {
  style?: React.CSSProperties;
}

const HeroVisual: React.FunctionComponent<IHeroVisual> = ({ style }) => {
  const theme = useTheme();
  const [currentState, setCurrentState] =
    useState<'intro' | 'hold' | 'outro'>('intro');
  const {
    ref: introRef,
    loaded: introLoaded,
    onLoad: onIntroLoaded,
  } = useImageLoaded();

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
