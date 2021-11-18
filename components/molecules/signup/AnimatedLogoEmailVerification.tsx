import React from 'react';
import Lottie from 'react-lottie';
import styled from 'styled-components';

import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
// import NewnewLogoBlue from '../../../public/images/svg/auth/newnew-logo-blue.svg';

interface IAnimatedLogoEmailVerification {
  isLoading: boolean;
}

const AnimatedLogoEmailVerification: React.FunctionComponent<IAnimatedLogoEmailVerification> = ({
  isLoading,
}) => (
  <SAnimatedLogoEmailVerification>
    <Lottie
      width={64}
      height={64}
      options={{
        loop: true,
        autoplay: true,
        animationData: loadingAnimation,
      }}
      isStopped={!isLoading}
    />
  </SAnimatedLogoEmailVerification>
);

export default AnimatedLogoEmailVerification;

const SAnimatedLogoEmailVerification = styled.div`
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
