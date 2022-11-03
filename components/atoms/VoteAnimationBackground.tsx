/* eslint-disable react/require-default-props */
import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import assets from '../../constants/assets';

// TODO: Unify with PostSuccessAnimationBackground.tsx
const VoteAnimationBackground: React.FunctionComponent<{
  className?: string;
  noBlur?: boolean;
}> = React.memo(({ className, noBlur }) => {
  const elements = useMemo(() => [1, 2, 3], []);

  return (
    <SContainer className={className}>
      {elements.map((el, i) => (
        <Vote
          key={el + 1}
          index={i}
          delay={0}
          top={-200 - i * 60}
          {...(i % 2 === 0
            ? {
                left: i * 100,
              }
            : {
                right: 50 + i * 50,
              })}
          noBlur={noBlur}
        />
      ))}
      {elements.map((el, i) => (
        <Vote
          key={el + 2}
          index={i}
          delay={2}
          top={-200 - i * 50}
          {...(i % 2 !== 0
            ? {
                left: 50 + i * 200,
              }
            : {
                right: 100 + i * 200,
              })}
          noBlur={noBlur}
        />
      ))}
      {elements.map((el, i) => (
        <Vote
          key={el + 3}
          index={i}
          delay={3}
          top={-200 - i * 50}
          {...(i % 2 === 0
            ? {
                left: 100 + i * 100,
              }
            : {
                right: 50 + i * 200,
              })}
          noBlur={noBlur}
        />
      ))}
      {elements.map((el, i) => (
        <Vote
          key={el + 4}
          index={i}
          delay={5}
          top={-200 - i * 50}
          {...(i % 2 !== 0
            ? {
                left: 50 + i * 200,
              }
            : {
                right: 100 + i * 100,
              })}
          noBlur={noBlur}
        />
      ))}
      {elements.map((el, i) => (
        <Vote
          key={el + 5}
          index={i}
          delay={8}
          top={-200 - i * 50}
          {...(i % 2 === 0
            ? {
                left: 100 + i * 100,
              }
            : {
                right: 100 + i * 200,
              })}
          noBlur={noBlur}
        />
      ))}
    </SContainer>
  );
});

export default VoteAnimationBackground;

const SContainer = styled.div`
  position: absolute;
  /* background-color: blue; */
  width: 100vw;
  height: 100%;
  min-height: 100vh;
`;

interface IVote {
  index: number;
  top: number;
  left?: number;
  right?: number;
  delay: number;
  noBlur?: boolean;
}

const Vote: React.FunctionComponent<IVote> = ({
  index,
  top,
  left,
  right,
  delay,
  noBlur,
}) => {
  // const width = useMemo(() => Math.random() * 170, []);
  const width = useMemo(() => Math.random() * 170, []);
  const speed = useMemo(() => Math.random() * index + 1 * 8, [index]);

  return (
    <SVoteIcon
      index={index}
      delay={delay}
      speed={speed}
      transform={`scale(${index % 2 === 0 ? -1 : 1}, 1)`}
      style={{
        width,
        top,
        ...(left
          ? {
              left,
            }
          : {
              right,
            }),
      }}
      noBlur={noBlur}
    >
      <img src={assets.common.vote} alt='vote' draggable={false} />
    </SVoteIcon>
  );
};

const RainingAnimation = (transform: string) => keyframes`
  0% {
    top: -300px;
    transform: ${transform};// translateY(-100px);
  }
  100% {
    top: 100%;
    transform: ${transform};// translateY(140vh);
  }
`;

const SVoteIcon = styled.div<{
  index: number;
  delay: number;
  transform: string;
  speed: number;
  noBlur?: boolean;
}>`
  display: flex;

  position: absolute;

  animation: ${({ transform }) => RainingAnimation(transform)} infinite;
  animation-timing-function: linear;
  animation-duration: ${({ speed }) => `${speed}s`};
  animation-delay: ${({ delay }) => `${delay}s`};

  img {
    width: 100%;
    object-fit: contain;

    filter: ${({ noBlur }) => (noBlur ? 'none' : 'blur(4px)')};
  }
`;
