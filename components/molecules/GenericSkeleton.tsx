/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Skeleton from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';

interface GenericSkeleton {
  className?: string;
}

const GenericSkeleton: React.FunctionComponent<GenericSkeleton> = ({
  className,
}) => (
  <Skeleton
    duration={2}
    className='skeletonSpan'
    containerClassName='skeletonsContainer'
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
      width: 200%;
      height: 200%;

      animation-name: ${SkeletonDiagonal};
    }
  }
`;
