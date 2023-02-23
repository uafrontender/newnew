/* eslint-disable react/require-default-props */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import isBrowser from '../../utils/isBrowser';

const AnimatedBackground: React.FunctionComponent<{
  className?: string;
  src: string;
  alt: string;
  noBlur?: boolean;
}> = React.memo(({ className, src, alt, noBlur }) => {
  const [delayed, setDelayed] = useState(true);
  const elements = useMemo(() => [1, 2, 3], []);

  const DELAY = 1500;
  useEffect(() => {
    setDelayed(true);
    setTimeout(() => setDelayed(false), DELAY);
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    if (isBrowser()) {
      setContainerHeight(containerRef.current?.clientHeight || 0);
    }
  }, [delayed]);

  if (delayed || !isBrowser()) {
    return null;
  }

  return (
    <SContainer className={className} ref={containerRef}>
      {containerHeight && (
        <>
          {elements.map((el, i) => (
            <FloatingAsset
              key={`1-${el}`}
              index={i}
              src={src}
              alt={alt}
              delay={0}
              top={-200 - i * 60}
              transformHeight={containerHeight}
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
            <FloatingAsset
              key={`2-${el}`}
              index={i}
              src={src}
              alt={alt}
              delay={2}
              top={-200 - i * 50}
              transformHeight={containerHeight}
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
            <FloatingAsset
              key={`3-${el}`}
              index={i}
              src={src}
              alt={alt}
              delay={3}
              top={-200 - i * 50}
              transformHeight={containerHeight}
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
            <FloatingAsset
              key={`4-${el}`}
              index={i}
              src={src}
              alt={alt}
              delay={5}
              top={-200 - i * 50}
              transformHeight={containerHeight}
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
            <FloatingAsset
              key={`5-${el}`}
              index={i}
              src={src}
              alt={alt}
              delay={8}
              top={-200 - i * 50}
              transformHeight={containerHeight}
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
        </>
      )}
    </SContainer>
  );
});

export default AnimatedBackground;

const SContainer = styled.div`
  position: absolute;
  width: 100vw;
  height: 100%;
`;

interface IFloatingAsset {
  index: number;
  alt: string;
  src: string;
  top: number;
  left?: number;
  right?: number;
  delay: number;
  noBlur?: boolean;
  transformHeight: number;
}

const FloatingAsset: React.FunctionComponent<IFloatingAsset> = ({
  index,
  alt,
  src,
  top,
  left,
  right,
  delay,
  noBlur,
  transformHeight,
}) => {
  // const width = useMemo(() => Math.random() * 170, []);
  const width = useMemo(() => Math.random() * 170, []);
  const speed = useMemo(() => Math.random() * index + 1 * 4, [index]);

  return (
    <SIcon
      index={index}
      delay={delay}
      speed={speed}
      $transform={`scale(${index % 2 === 0 ? -1 : 1}, 1)`}
      transformOffset={top}
      transformHeight={transformHeight}
      style={{
        width,
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
      <img src={src} alt={alt} draggable={false} />
    </SIcon>
  );
};

const RainingAnimation = (
  transform: string,
  transformHeight: number
) => keyframes`
  0% {
    opacity:0;
    transform: ${transform} translateY(-300px);// translateY(-100px);
  }
  10% {
    opacity:1;
  }
  90% {
    opacity:1;
  }
  100% {
    opacity:0;
    transform: ${transform} ${`translateY(${transformHeight}px)`};// translateY(140vh);
  }
`;

const SIcon = styled.div<{
  index: number;
  delay: number;
  $transform: string;
  speed: number;
  noBlur?: boolean;
  transformOffset: number;
  transformHeight: number;
}>`
  display: flex;

  position: absolute;

  transform: ${({ transformOffset, $transform }) =>
    `${$transform} translateY(${transformOffset}px)`};

  animation: ${({ $transform, transformHeight }) =>
      RainingAnimation($transform, transformHeight)}
    infinite;
  animation-timing-function: linear;
  animation-duration: ${({ speed }) => `${speed}s`};
  animation-delay: ${({ delay }) => `${delay}s`};

  img {
    width: 100%;
    object-fit: contain;

    filter: ${({ noBlur }) => (noBlur ? 'none' : 'blur(4px)')};
  }
`;
