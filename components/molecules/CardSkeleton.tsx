/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Skeleton from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';
import { useAppState } from '../../contexts/appStateContext';

interface ICardSkeleton {
  count: number;
  cardWidth?: string;
  cardHeight?: string;
  bgColor?: string;
  highlightColor?: string;
}

const CardSkeleton: React.FunctionComponent<ICardSkeleton> = ({
  count,
  cardWidth,
  cardHeight,
  bgColor,
  highlightColor,
}) => (
  <Skeleton
    count={count}
    borderRadius={16}
    duration={2}
    className='skeletonSpan'
    containerClassName='skeletonsContainer'
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
        <SSingleSkeletonWrapper
          width={cardWidth ?? undefined}
          height={cardHeight ?? undefined}
        >
          {(props as any).children}
        </SSingleSkeletonWrapper>
      )
    }
  />
);

CardSkeleton.defaultProps = {
  cardHeight: undefined,
  cardWidth: undefined,
  bgColor: undefined,
  highlightColor: undefined,
};

export default CardSkeleton;

const SkeletonDiagonal = keyframes`
  0% {
    transform: rotate(45deg) translateX(-600px);
  }
  100% {
    transform: rotate(45deg) translateX(200px);
  }
`;

const SSingleSkeletonWrapper = styled.div<{
  width?: string;
  height?: string;
}>`
  display: flex;
  height: ${({ height }) => height ?? '562px'};
  width: ${({ width }) => width ?? '100%'};

  .skeletonSpan {
    &:after {
      width: 200%;
      height: 200%;

      animation-name: ${SkeletonDiagonal};
    }
  }

  ${({ theme }) => theme.media.mobileL} {
    height: ${({ height }) => height ?? '224px'};
    width: ${({ width }) => width ?? '336px'};
  }
`;

// To fade in smoothly
const SkeletonWrapperAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

// <CardSection /> Skeleton
interface ICardSkeletonSection {
  count: number;
  width?: string;
  height?: string;
}

export const CardSkeletonSection: React.FunctionComponent<
  ICardSkeletonSection
> = ({ count, width, height, ...restProps }) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isLaptop = ['laptop'].includes(resizeMode);
  const isDesktop = ['laptopL'].includes(resizeMode);
  return (
    <SCardSkeletonSectionWrapper {...restProps}>
      <CardSkeleton
        count={count}
        cardWidth={
          width ?? isMobile
            ? 'calc(100vw - 64px)'
            : isTablet
            ? '200px'
            : isLaptop
            ? '224px'
            : isDesktop
            ? '15vw'
            : '13vw'
        }
        cardHeight={height ?? isMobile ? '564px' : isTablet ? '300px' : '336px'}
      />
    </SCardSkeletonSectionWrapper>
  );
};

CardSkeletonSection.defaultProps = {
  width: undefined,
  height: undefined,
};

const SCardSkeletonSectionWrapper = styled.div`
  width: 100%;
  overflow-y: hidden;

  opacity: 0;
  animation: ${SkeletonWrapperAnimation} 0.1s forwards;

  .skeletonsContainer {
    display: flex;
    width: fit-content;
    flex-wrap: nowrap;
    gap: 32px;

    position: relative;
    left: 16px;
  }
`;

// <List /> Skeleton
interface ICardSkeletonList {
  count: number;
  wrapperStyle?: React.CSSProperties;
}

export const CardSkeletonList: React.FunctionComponent<ICardSkeletonList> = ({
  count,
  wrapperStyle,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  return (
    <SCardSkeletonListWrapper style={wrapperStyle ? { ...wrapperStyle } : {}}>
      <CardSkeleton
        count={count}
        cardWidth='100%'
        cardHeight={isMobile ? '564px' : '336px'}
      />
    </SCardSkeletonListWrapper>
  );
};

CardSkeletonList.defaultProps = {
  wrapperStyle: {},
};

const SCardSkeletonListWrapper = styled.div`
  opacity: 0;
  animation: ${SkeletonWrapperAnimation} 0.3s forwards;

  .skeletonsContainer {
    left: -16px;
    width: 100vw;
    cursor: default;
    display: flex;
    padding: 8px 0 0 0;
    position: relative;
    flex-wrap: wrap;
    flex-direction: row;

    ${(props) => props.theme.media.tablet} {
      left: -8px;
      width: calc(100% + 26px);
      padding: 24px 0 0 0;
    }

    ${(props) => props.theme.media.laptop} {
      left: -16px;
      width: calc(100% + 32px);
      padding: 32px 0 0 0;
    }

    div {
      width: 100vw;
      margin: 16px 0;

      ${(props) => props.theme.media.tablet} {
        width: calc(33% - 16px);
        margin: 0 8px 56px 8px;
      }

      ${(props) => props.theme.media.laptop} {
        width: calc(25% - 32px);
        margin: 0 16px 96px 16px;
      }

      ${(props) => props.theme.media.laptopL} {
        width: calc(20% - 32px);
      }
    }
  }
`;
