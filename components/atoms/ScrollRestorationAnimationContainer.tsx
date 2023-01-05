import React from 'react';
import styled from 'styled-components';

import Lottie from './Lottie';

import loadingAnimation from '../../public/animations/logo-loading-blue.json';

const ScrollRestorationAnimationContainer: React.FunctionComponent = () => (
  <SScrollRestorationAnimationContainer
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    <Lottie
      width={64}
      height={64}
      options={{
        loop: true,
        autoplay: true,
        animationData: loadingAnimation,
      }}
    />
  </SScrollRestorationAnimationContainer>
);

export default ScrollRestorationAnimationContainer;

const SScrollRestorationAnimationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  z-index: 10;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  background-color: ${({ theme }) => theme.colorsThemed.background.overlaydim};

  ::before {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    bottom: 0;
    height: 100vh;
    content: '';
    z-index: -1;
    position: absolute;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    background-color: ${({ theme }) =>
      theme.colorsThemed.background.overlaydim};
  }
`;
