import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import isBrowser from '../../../../utils/isBrowser';

import PostVideoStoryItem from './PostVideoStoryItem';
import Button from '../../../atoms/Button';

import arrowIconLeft from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowIconRight from '../../../../public/images/svg/icons/outlined/ChevronRight.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import PostVideoStoriesPreviewSlider from './PostVideoStoriesPreviewSlider';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

interface IPostVideoResponsesSlider {
  videos: newnewapi.IVideoUrls[];
  dotsBottom?: number;
  isMuted?: boolean;
  isEditingStories?: boolean;
  handleDeleteAdditionalVideo?: (videoUuid: string) => void;
  handleDeleteUnuploadedAdditonalResponse?: () => void;
}

const PostVideoResponsesSlider: React.FunctionComponent<
  IPostVideoResponsesSlider
> = ({
  videos,
  dotsBottom,
  isMuted,
  isEditingStories,
  handleDeleteAdditionalVideo,
  handleDeleteUnuploadedAdditonalResponse,
}) => {
  const { videoProcessing } = usePostModerationResponsesContext();
  const uploadedFile = useMemo(
    () => videoProcessing?.targetUrls,
    [videoProcessing]
  );

  const videosLength = useMemo(() => videos.length, [videos.length]);
  const containerRef = useRef<HTMLDivElement>();
  const [currentVideo, setCurrentVideo] = useState(0);

  const [hovered, setHovered] = useState(false);

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

      if (
        containerWidth &&
        containerScrollWidth &&
        currentScrollLeft !== undefined
      ) {
        timeout = setTimeout(() => {
          const currentIndex = Math.floor(currentScrollLeft / containerWidth);

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

  useEffect(() => {
    if (uploadedFile?.hlsStreamUrl) {
      scrollSliderTo(videosLength - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

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
            key={video.uuid ?? i}
            video={video}
            index={i}
            isVisible={currentVideo === i}
            isMuted={isMuted}
          />
        ))}
      </SContainer>
      <SDotsContainer
        isEditingStories={isEditingStories}
        style={{
          ...(dotsBottom
            ? {
                bottom: `${dotsBottom}px`,
              }
            : {}),
        }}
      >
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
        view='transparent'
        iconOnly
        disabled={currentVideo === 0}
        style={{
          ...(hovered
            ? {
                opacity: 1,
              }
            : {}),
        }}
        onClick={() => scrollSliderTo(currentVideo - 1)}
      >
        <InlineSvg
          svg={arrowIconLeft}
          fill='#FFFFFF'
          width='24px'
          height='24px'
        />
      </SScrollLeft>
      <SScrollRight
        view='transparent'
        iconOnly
        disabled={currentVideo === videosLength - 1}
        style={{
          ...(hovered
            ? {
                opacity: 1,
              }
            : {}),
        }}
        onClick={() => scrollSliderTo(currentVideo + 1)}
      >
        <InlineSvg
          svg={arrowIconRight}
          fill='#FFFFFF'
          width='24px'
          height='24px'
        />
      </SScrollRight>
      {isEditingStories ? (
        <PostVideoStoriesPreviewSlider
          videos={videos}
          currentActive={currentVideo}
          offsetBottom={dotsBottom ?? 0}
          handleChangeCurrentActive={scrollSliderTo}
          handleDeleteAdditionalVideo={handleDeleteAdditionalVideo}
          handleDeleteUnuploadedAdditonalResponse={
            handleDeleteUnuploadedAdditonalResponse
          }
        />
      ) : null}
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

  top: calc(50% - 24px);
  left: 24px;

  display: none;

  ${({ theme }) => theme.media.laptop} {
    display: block;
    opacity: 0;
    transition: 0.3s linear;
  }
`;

const SScrollRight = styled(Button)`
  position: absolute;

  top: calc(50% - 24px);
  right: 24px;

  display: none;

  ${({ theme }) => theme.media.laptop} {
    display: block;
    opacity: 0;
    transition: 0.3s linear;
  }
`;

const SDotsContainer = styled.div<{
  isEditingStories?: boolean;
}>`
  position: absolute;

  width: 100%;
  bottom: ${({ isEditingStories }) => (isEditingStories ? '56px' : '86px')};

  display: flex;
  justify-content: center;
  gap: 4px;

  transition: 0.1s linear;

  ${({ theme }) => theme.media.tablet} {
    bottom: 45px;
  }

  ${({ theme }) => theme.media.laptop} {
    bottom: ${({ isEditingStories }) => (isEditingStories ? '56px' : '86px')};
  }
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
