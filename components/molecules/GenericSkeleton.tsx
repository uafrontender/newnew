/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Skeleton from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';

interface GenericSkeleton {
  className?: string;
  bgColor?: string;
  highlightColor?: string;
}

const GenericSkeleton: React.FunctionComponent<GenericSkeleton> = ({
  className,
  bgColor,
  highlightColor,
}) => (
  <Skeleton
    duration={2}
    {...{
      ...(bgColor
        ? {
            baseColor: bgColor,
          }
        : {}),
      ...(highlightColor
        ? {
            highlightColor,
          }
        : {}),
    }}
    wrapper={
      // eslint-disable-next-line react/no-unstable-nested-components
      (props) => (
        <SSingleSkeletonWrapper className={className}>
          {(props as any).children}
        </SSingleSkeletonWrapper>
      )
    }
  />
);

GenericSkeleton.defaultProps = {
  className: undefined,
};

export default GenericSkeleton;

const SkeletonDiagonal = keyframes`
  0% {
    transform: rotate(45deg) translateX(-600px);
  }
  100% {
    transform: rotate(45deg) translateX(200px);
  }
`;

const SSingleSkeletonWrapper = styled.div`
  display: flex;
  overflow: hidden;

  .skeletonSpan {
    &:after {
      width: 400%;
      height: 400%;
      top: 200%;

      animation-name: ${SkeletonDiagonal};
    }
  }
`;
