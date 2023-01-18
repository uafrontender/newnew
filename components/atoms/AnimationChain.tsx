import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

interface ReactChainI {
  className?: string;
  placeholderSrc: string;
  videoSrcList: string[];
}

const AnimationChain: React.FC<ReactChainI> = React.memo(
  ({ className, placeholderSrc, videoSrcList }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [maxLoadedSrcIndex, setMaxLoadedSrcIndex] = useState(0);
    const [placeholderLoaded, setPlaceholderLoaded] = useState(false);

    const getPreviousIndex = useCallback(
      (index: number) => (index > 0 ? index - 1 : videoSrcList.length - 1),
      [videoSrcList]
    );

    const getNextIndex = useCallback(
      (index: number) => (index < videoSrcList.length - 1 ? index + 1 : 0),
      [videoSrcList]
    );

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

    // Clear state on data changed
    useEffect(() => {
      setCurrentVideoIndex(0);
      setMaxLoadedSrcIndex(0);
      setPlaceholderLoaded(false);
    }, [placeholderSrc, videoSrcList]);

    useEffect(() => {
      const previousVideoIndex = getPreviousIndex(currentVideoIndex);

      const previousVideo = document.getElementById(
        videoSrcList[previousVideoIndex]
      ) as HTMLVideoElement;

      if (previousVideo) {
        // A timeout can help to prevent blinking
        setTimeout(() => {
          previousVideo.autoplay = false;
          previousVideo.currentTime = 0;
        }, 3000);
      }

      const currentVideo = document.getElementById(
        videoSrcList[currentVideoIndex]
      ) as HTMLVideoElement;

      if (currentVideo) {
        currentVideo.play().catch((e) => {
          // NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
          console.log(e);
        });
      }
    }, [videoSrcList, currentVideoIndex, getPreviousIndex]);

    return (
      <Container className={className}>
        <Placeholder
          key={placeholderSrc}
          src={placeholderSrc}
          visible={placeholderLoaded}
          onLoad={() => {
            setPlaceholderLoaded(true);
          }}
        />
        {videoSrcList.slice(0, maxLoadedSrcIndex + 1).map((videoSrc, index) => (
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
              setMaxLoadedSrcIndex((curr) => (curr === 0 ? 1 : curr));
            }}
            onEnded={() => {
              const nextIndex = getNextIndex(index);
              setCurrentVideoIndex(nextIndex);
              setMaxLoadedSrcIndex((curr) =>
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

const Placeholder = styled.img<{ visible: boolean }>`
  width: 100%;
  height: 100%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity ease;
  transition-duration: ${({ visible }) => (visible ? '1s' : '0s')}; ;
`;

const Video = styled.video<{ visibility?: 'play' | 'hold' }>`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

  // Chrome can't show white background, needs brightness fix
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    -webkit-filter: ${({ theme }) =>
      theme.name === 'light' ? 'brightness(101%)' : undefined};
  }
`;
