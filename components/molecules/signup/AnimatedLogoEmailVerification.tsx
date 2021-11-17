import React, { useEffect } from 'react';
import lottie from 'lottie-web';
import styled from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
// import NewnewLogoBlue from '../../../public/images/svg/auth/newnew-logo-blue.svg';

interface IAnimatedLogoEmailVerification {
  isLoading: boolean;
}

const AnimatedLogoEmailVerification: React.FunctionComponent<IAnimatedLogoEmailVerification> = ({
  isLoading,
}) => {
  useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector('#logo')!!,
      animationData: loadingAnimation,
      renderer: 'svg', // "canvas", "html"
      loop: true, // boolean
      autoplay: false, // boolean
    });
  }, []);

  useEffect(() => {
    if (isLoading) {
      lottie.play();
    } else {
      lottie.stop();
    }
  }, [isLoading]);

  return (
    <SAnimatedLogoEmailVerification
      id="logo"
      isLoading={isLoading}
    />
  );
};

export default AnimatedLogoEmailVerification;

type TSAnimatedLogoEmailVerification = typeof InlineSvg & {
  isLoading: boolean;
}

const SAnimatedLogoEmailVerification = styled.div<TSAnimatedLogoEmailVerification>`
  width: 64px;
  height: 64px;

  margin-top: 148px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 276px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-top: 60px;
  }
`;
