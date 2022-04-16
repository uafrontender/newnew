/* eslint-disable react/require-default-props */
import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

import GoldImage from '../../../public/images/decision/Gold.png';

const PostSuccessAnimationBackground: React.FunctionComponent = () => {
  const elements = useMemo(() => (
    new Array(3).fill('')
  ), []);

  return (
    <SContainer>
      {elements.map((el, i) => (
        <GoldCoin
          key={el}
          index={i}
          delay={0}
          top={-200 - i * 60}
          {...(
            i % 2 === 0 ? {
              left: i * 100,
            } : {
              right: 50 + i * 50,
            }
          )}
        />
      ))}
      {elements.map((el, i) => (
        <GoldCoin
          key={el}
          index={i}
          delay={2}
          top={-200 - i * 50}
          {...(
            i % 2 !== 0 ? {
              left: 50 + i * 200,
            } : {
              right: 100 + i * 200,
            }
          )}
        />
      ))}
      {elements.map((el, i) => (
        <GoldCoin
          key={el}
          index={i}
          delay={3}
          top={-200 - i * 50}
          {...(
            i % 2 === 0 ? {
              left: 100 + i * 100,
            } : {
              right: 50 + i * 200,
            }
          )}
        />
      ))}
      {elements.map((el, i) => (
        <GoldCoin
          key={el}
          index={i}
          delay={5}
          top={-200 - i * 50}
          {...(
            i % 2 !== 0 ? {
              left: 50 + i * 200,
            } : {
              right: 100 + i * 100,
            }
          )}
        />
      ))}
      {elements.map((el, i) => (
        <GoldCoin
          key={el}
          index={i}
          delay={8}
          top={-200 - i * 50}
          {...(
            i % 2 === 0 ? {
              left: 100 + i * 100,
            } : {
              right: 100 + i * 200,
            }
          )}
        />
      ))}
    </SContainer>
  );
}

export default PostSuccessAnimationBackground;

const SContainer = styled.div`
  position: absolute;
  /* background-color: blue; */
  width: 100vw;
  height: 100vh;
`;

interface IGoldCoin {
  index: number;
  top: number;
  left?: number;
  right?: number;
  delay: number;
}

const GoldCoin: React.FunctionComponent<IGoldCoin> = ({
  index,
  top,
  left,
  right,
  delay,
}) => {
  // const width = useMemo(() => Math.random() * 170, []);
  const width = useMemo(() => Math.random() * 170, []);
  const speed = useMemo(() => Math.random() * index + 1 * 8, [index]);

  return (
    <SGoldIcon
      index={index}
      delay={delay}
      speed={speed}
      transform={`scale(${index % 2 === 0 ? -1 : 1}, 1)`}
      style={{
        width,
        top,
        ...(left ? {
          left
        } : {
          right
        })
      }}
    >
      <img
        src={GoldImage.src}
        alt="coin"
        draggable={false}
      />
    </SGoldIcon>
  );
}


const RainingAnimation = (transform: string) => keyframes`
  0% {
    transform: ${transform} translateY(-100px);
  }
  100% {
    transform: ${transform} translateY(140vh);
  }
`;

const SGoldIcon = styled.div<{
  index: number;
  delay: number;
  transform: string;
  speed: number;
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

    filter: blur(4px);
  }
`;
