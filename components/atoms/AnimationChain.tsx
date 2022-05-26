import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface ReactChainI {
  className?: string;
  placeholderSrc: string;
  videoSrcList: string[];
}

const AnimationChain: React.FC<ReactChainI> = React.memo(
  ({ className, placeholderSrc, videoSrcList }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [maxLoadedSrc, setMaxLoadedSrc] = useState(1);

    function getPreviousIndex(index: number) {
      return index > 0 ? index - 1 : videoSrcList.length - 1;
    }

    function getNextIndex(index: number) {
      return index < videoSrcList.length - 1 ? index + 1 : 0;
    }

    function getVideoZIndex(index: number) {
      const previousIndex = getPreviousIndex(currentVideoIndex);
      if (index === currentVideoIndex) {
        return 2;
      }

      if (index === previousIndex) {
        return 1;
      }

      return 0;
    }

    useEffect(() => {
      const currentElement = document.getElementById(
        videoSrcList[currentVideoIndex]
      ) as HTMLVideoElement;

      if (currentElement) {
        currentElement.currentTime = 0;
        currentElement.play();
      }
    }, [videoSrcList, currentVideoIndex]);

    return (
      <Container className={className}>
        <Placeholder src={placeholderSrc} />
        {videoSrcList.slice(0, maxLoadedSrc).map((videoSrc, index) => (
          <Video
            id={videoSrc}
            key={videoSrc}
            muted
            autoPlay={index === 0}
            preload='auto'
            style={{
              zIndex: getVideoZIndex(index),
            }}
            playsInline
            onPlay={() => {
              setMaxLoadedSrc((curr) => (curr === 1 ? 2 : curr));
            }}
            onEnded={() => {
              const nextIndex = getNextIndex(index);
              setCurrentVideoIndex(nextIndex);
              setMaxLoadedSrc((curr) =>
                nextIndex + 1 > curr ? nextIndex + 1 : curr
              );
            }}
          >
            <source src={videoSrc} type='video/mp4' />
          </Video>
        ))}
      </Container>
    );
  },
  (prev, next) => isEqual(prev, next)
);

AnimationChain.defaultProps = {
  className: undefined,
};

export default AnimationChain;

const Container = styled.div`
  position: relative;
`;

const Placeholder = styled.img`
  width: 100%;
  height: 100%;
`;

const Video = styled.video<{ visibility?: 'play' | 'hold' }>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  // Chrome can't show white background, needs brightness fix
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    -webkit-filter: brightness(101%);
  }
`;
