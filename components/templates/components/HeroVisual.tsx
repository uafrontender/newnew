/* eslint-disable consistent-return */
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { AuthLayoutContext } from '../AuthLayout';
import useImageLoaded from '../../../utils/hooks/useImageLoaded';
import assets from '../../../constants/assets';

interface IHeroVisual {}

const HeroVisual: React.FunctionComponent<IHeroVisual> = React.memo(() => {
  const theme = useTheme();
  const authLayoutContext = useContext(AuthLayoutContext);

  const imageHash = useRef(Math.floor(Math.random() * 1000000));
  const [currentState, setCurrentState] = useState<'intro' | 'hold' | 'outro'>(
    'intro'
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
              ? `${assets.signup.darkIntoAnimated()}?${imageHash.current}`
              : `${assets.signup.lightIntoAnimated()}?${imageHash.current}`
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
              ? assets.signup.darkIntroStatic
              : assets.signup.lightIntroStatic
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
              ? assets.signup.darkOutroAnimated()
              : assets.signup.lightOutroAnimated()
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

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
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
