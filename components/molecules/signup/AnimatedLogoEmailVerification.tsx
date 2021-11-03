import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';
import NewnewLogoBlue from '../../../public/images/svg/auth/newnew-logo-blue.svg';

interface IAnimatedLogoEmailVerification {
  isLoading: boolean;
}

const AnimatedLogoEmailVerification: React.FunctionComponent<IAnimatedLogoEmailVerification> = ({
  isLoading,
}) => (
  <SAnimatedLogoEmailVerification
    svg={NewnewLogoBlue}
    width="64px"
    height="64px"
    isLoading={isLoading}
  />
);

export default AnimatedLogoEmailVerification;

type TSAnimatedLogoEmailVerification = typeof InlineSvg & {
  isLoading: boolean;
}

// NB! Temp
const LogoLoaderAnimation = keyframes`
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
`;

const SAnimatedLogoEmailVerification = styled(InlineSvg)<TSAnimatedLogoEmailVerification>`
  margin-top: 148px;

  ${({ isLoading }) => {
    if (isLoading) {
      return css`animation: ${LogoLoaderAnimation} 1s infinite;`;
    } return null;
  }}

  ${({ theme }) => theme.media.tablet} {
    margin-top: 276px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-top: 60px;
  }
`;
