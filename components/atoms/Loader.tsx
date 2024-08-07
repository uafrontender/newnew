import React from 'react';
import styled, { css } from 'styled-components';

import Lottie from './Lottie';
import logoAnimation from '../../public/animations/mobile_logo.json';
import logoAnimationWhite from '../../public/animations/mobile_logo_white.json';

type TSize = 'xs' | 'sm' | 'md';

interface ILoader {
  size?: TSize;
  color?: 'primary' | 'white';
  width?: number;
  height?: number;
  className?: string;
  isStatic?: boolean;
}

const animation = {
  primary: logoAnimation,
  white: logoAnimationWhite,
};

const sizes = {
  xs: 20,
  sm: 24,
  md: 64,
};

const Loader = ({
  size = 'sm',
  color = 'primary',
  width,
  height,
  className,
  isStatic,
}: ILoader) => (
  <SLoader
    size={size}
    className={className}
    width={width}
    height={height}
    isStatic={isStatic}
  >
    <Lottie
      width={width || sizes[size]}
      height={height || sizes[size]}
      options={{
        loop: true,
        autoplay: true,
        animationData: animation[color],
      }}
    />
  </SLoader>
);

export default Loader;

const SLoader = styled.div<{
  size: TSize;
  width?: number;
  height?: number;
  isStatic?: boolean;
}>`
  width: ${({ size, width }) => `${width || sizes[size]}px`};
  height: ${({ size, height }) => `${height || sizes[size]}px`};

  ${({ isStatic }) =>
    isStatic
      ? css`
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        `
      : null}
`;
