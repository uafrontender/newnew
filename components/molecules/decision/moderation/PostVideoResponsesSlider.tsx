import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import isBrowser from '../../../../utils/isBrowser';

import PostVideoStoryItem from './PostVideoStoryItem';
import Button from '../../../atoms/Button';

interface IPostVideoResponsesSlider {
  videos: newnewapi.IVideoUrls[];
  isMuted?: boolean;
}

const PostVideoResponsesSlider: React.FunctionComponent<
  IPostVideoResponsesSlider
> = ({ videos, isMuted }) => {
  const videosLength = useMemo(() => videos.length, [videos.length]);
  // const lengthMemo = useRef<number>(videosLength);
  const containerRef = useRef<HTMLDivElement>();
  const [currentVideo, setCurrentVideo] = useState(0);

  const [hovered, setHovered] = useState(false);

  console.log(videos);

  const scrollSliderTo = (to: number) => {
    const containerWidth = containerRef.current?.getBoundingClientRect().width;
    let scrollTo = to;

    if (to < 0) {
      scrollTo = 0;
    } else if (scrollTo > (videosLength || 0) - 1) {
      scrollTo = (videosLength || 0) - 1;
    }

    if (containerWidth) {
      containerRef.current?.scrollTo({
        left: containerWidth * scrollTo,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    let timeout: any;

    const handleScroll = (e: Event) => {
      clearTimeout(timeout);
      const containerWidth =
        containerRef.current?.getBoundingClientRect().width;
      const containerScrollWidth = containerRef.current?.scrollWidth;
      const currentScrollLeft = containerRef.current?.scrollLeft;

      console.log(containerWidth);
      console.log(currentScrollLeft);
      console.log(containerScrollWidth);

      if (
        containerWidth &&
        containerScrollWidth &&
        currentScrollLeft !== undefined
      ) {
        timeout = setTimeout(() => {
          console.log(
            `Current scroll left: ${currentScrollLeft + containerWidth}`
          );
          const currentIndex = Math.floor(currentScrollLeft / containerWidth);

          console.log(`Current index: ${currentIndex}`);

          setCurrentVideo(currentIndex);
        }, 1000);
      }
    };

    if (isBrowser()) {
      containerRef.current?.addEventListener('scroll', handleScroll);
    }

    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [videosLength]);

  return (
    <SWrapper
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SContainer
        id='responsesSlider'
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        {videos.map((video, i) => (
          <PostVideoStoryItem
            video={video}
            index={i}
            isVisible={currentVideo === i}
            isMuted={isMuted}
          />
        ))}
      </SContainer>
      <SDotsContainer>
        {videos.map((item, i) => (
          <SDot
            key={item.uuid ?? i}
            active={currentVideo === i}
            onClick={() => {
              if (currentVideo === i) return;
              scrollSliderTo(i);
            }}
          />
        ))}
      </SDotsContainer>
      <SScrollLeft
        disabled={currentVideo === 0}
        style={{
          ...(hovered
            ? {
                visibility: 'visible',
              }
            : {}),
        }}
        onClick={() => scrollSliderTo(currentVideo - 1)}
      >
        Left
      </SScrollLeft>
      <SScrollRight
        disabled={currentVideo === videosLength - 1}
        style={{
          ...(hovered
            ? {
                visibility: 'visible',
              }
            : {}),
        }}
        onClick={() => scrollSliderTo(currentVideo + 1)}
      >
        Right
      </SScrollRight>
    </SWrapper>
  );
};

export default PostVideoResponsesSlider;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const SContainer = styled.div`
  width: 100%;
  height: 100%;

  overflow-x: auto;
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  display: flex;

  position: relative;

  scroll-snap-type: x mandatory;
`;

const SScrollLeft = styled(Button)`
  position: absolute;

  top: calc(50%);
  left: 10px;

  display: none;
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    display: block;
  }
`;

const SScrollRight = styled(Button)`
  position: absolute;

  top: calc(50%);
  right: 10px;

  display: none;
  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    display: block;
  }
`;

const SDotsContainer = styled.div`
  position: absolute;

  width: 100%;
  bottom: 120px;

  display: flex;
  justify-content: center;
  gap: 4px;
`;

const SDot = styled.button<{
  active: boolean;
}>`
  width: 6px;
  height: 6px;

  background: ${({ active, theme }) =>
    active ? theme.colors.blue : '#FFFFFF'};
  border-radius: 50%;
  border: transparent;

  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  transition: 0.3s linear;

  &:active,
  &:focus {
    outline: none;
  }
`;
