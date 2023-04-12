import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import PostVideoStoryItem from './PostVideoStoryItem';
import Button from '../../../atoms/Button';

import arrowIconLeft from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowIconRight from '../../../../public/images/svg/icons/outlined/ChevronRight.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import PostVideoStoriesPreviewSlider from './PostVideoStoriesPreviewSlider';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { useAppState } from '../../../../contexts/appStateContext';
import SimplifiedSlider from '../../../atoms/SimplifiedSlider';

interface IPostVideoResponsesSlider {
  videos: newnewapi.IVideoUrls[];
  uiOffset?: number;
  isMuted?: boolean;
  isEditingStories?: boolean;
  isDeletingAdditionalResponse: boolean;
  videoDurationWithTime?: boolean;
  handleDeleteAdditionalVideo?: (videoUuid: string) => void;
  handleDeleteUnuploadedAdditonalResponse?: () => void;
  autoscroll?: boolean;
}

const PostVideoResponsesSlider: React.FunctionComponent<
  IPostVideoResponsesSlider
> = ({
  videos,
  uiOffset,
  isMuted,
  isEditingStories,
  isDeletingAdditionalResponse,
  videoDurationWithTime,
  handleDeleteAdditionalVideo,
  handleDeleteUnuploadedAdditonalResponse,
  autoscroll,
}) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const wrapperRef = useRef<HTMLDivElement>();

  const { postParsed } = usePostInnerState();
  const { videoProcessing } = usePostModerationResponsesContext();
  const uploadedFile = useMemo(
    () => videoProcessing?.targetUrls,
    [videoProcessing]
  );

  const videosLength = useMemo(() => videos.length, [videos.length]);

  const [currentVideo, setCurrentVideo] = useState(0);

  const [hovered, setHovered] = useState(false);

  const scrollSliderTo = useCallback(
    (to: number) => {
      let scrollTo = to;
      if (to < 0) {
        scrollTo = 0;
      } else if (scrollTo > (videosLength || 0) - 1) {
        scrollTo = (videosLength || 0) - 1;
      }

      setCurrentVideo(scrollTo);
    },
    [videosLength]
  );

  const handleClickDotScroll = useCallback(
    (i: number) => {
      Mixpanel.track('Click Video Responses Slider Dot', {
        _stage: 'Post',
        _postUuid: postParsed?.postUuid,
        _videoIndex: `postVideoThumbnailItem_${i}`,
        _component: 'PostVideoResponsesSlider',
      });
      if (currentVideo === i) return;
      scrollSliderTo(i);
    },
    [currentVideo, postParsed?.postUuid, scrollSliderTo]
  );

  const handleScrollLeft = useCallback(() => {
    Mixpanel.track('Click scroll left arrow', {
      _stage: 'Post',
      _postUuid: postParsed?.postUuid,
      _component: 'PostVideoResponsesSlider',
    });
    scrollSliderTo(currentVideo - 1);
  }, [currentVideo, postParsed?.postUuid, scrollSliderTo]);

  const handleScrollRight = useCallback(() => {
    Mixpanel.track('Click scroll right arrow', {
      _stage: 'Post',
      _postUuid: postParsed?.postUuid,
      _component: 'PostVideoResponsesSlider',
    });
    scrollSliderTo(currentVideo + 1);
  }, [currentVideo, postParsed?.postUuid, scrollSliderTo]);

  const handleMapVideoStoryItems = useCallback(
    () =>
      videos.map((video, i, arr) => (
        <PostVideoStoryItem
          key={video?.uuid ?? i}
          video={video}
          index={i}
          isActive={currentVideo === i}
          shouldPrefetch
          isMuted={isMuted}
          videoDurationWithTime={videoDurationWithTime}
          onPlaybackFinished={
            // If the last video in story mode, continue loop
            autoscroll && i !== arr.length - 1
              ? () => scrollSliderTo(i + 1)
              : undefined
          }
        />
      )),
    [
      autoscroll,
      currentVideo,
      isMuted,
      scrollSliderTo,
      videoDurationWithTime,
      videos,
    ]
  );

  useEffect(() => {
    if (uploadedFile?.hlsStreamUrl) {
      scrollSliderTo(videosLength - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

  return (
    <SWrapper
      id='responsesSlider'
      ref={(el) => {
        wrapperRef.current = el!!;
      }}
      videosLength={videosLength}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SimplifiedSlider currentSlide={currentVideo} wrapperRef={wrapperRef}>
        {handleMapVideoStoryItems()}
      </SimplifiedSlider>
      <SDotsContainer
        isEditingStories={isEditingStories}
        style={{
          ...(uiOffset
            ? {
                transform: `translateY(-${uiOffset}px)`,
              }
            : {}),
        }}
      >
        {videos.map((item, i) => (
          <SDot
            key={item?.uuid ?? i}
            active={currentVideo === i}
            onClick={() => handleClickDotScroll(i)}
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
          ...(isMobileOrTablet
            ? {
                background: 'transparent',
              }
            : {}),
        }}
        onClick={handleScrollLeft}
      >
        {!isMobileOrTablet ? (
          <InlineSvg
            svg={arrowIconLeft}
            fill='#FFFFFF'
            width='24px'
            height='24px'
          />
        ) : null}
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
          ...(isMobileOrTablet
            ? {
                background: 'transparent',
              }
            : {}),
        }}
        onClick={handleScrollRight}
      >
        {!isMobileOrTablet ? (
          <InlineSvg
            svg={arrowIconRight}
            fill='#FFFFFF'
            width='24px'
            height='24px'
          />
        ) : null}
      </SScrollRight>
      {isEditingStories ? (
        <PostVideoStoriesPreviewSlider
          videos={videos}
          currentActive={currentVideo}
          uiOffset={uiOffset ?? 0}
          handleChangeCurrentActive={scrollSliderTo}
          isDeletingAdditionalResponse={isDeletingAdditionalResponse}
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

const SWrapper = styled.div<{
  videosLength: number;
}>`
  width: 100%;
  height: 100%;

  .slick-track {
    height: 100%;
    // Fixes desktop Safari fullscreen width bug
    max-width: ${({ videosLength }) => `${videosLength * 768}px`} !important;
  }

  .sSlider {
    width: 100%;
    height: 100%;
    display: flex;

    .slick-slide {
      height: 100%;
      // Fixes slider initialization problem
      min-width: 200px !important;
      // Fixes desktop Safari fullscreen width bug
      max-width: 768px !important;

      & > div {
        height: 100%;
      }
    }
  }
`;

const SScrollLeft = styled(Button)`
  position: absolute;

  width: 35%;
  height: 70%;

  top: 64px;
  left: 0px;

  @media (max-width: 1024px) {
    &:disabled:after {
      background: transparent;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    width: initial;
    height: initial;
    top: calc(50% - 24px);
    left: 16px;
    display: block;
    opacity: 0;
    transition: 0.3s linear;
  }
`;

const SScrollRight = styled(Button)`
  position: absolute;

  width: 35%;
  height: 70%;

  top: 64px;
  right: 0px;

  @media (max-width: 1024px) {
    &:disabled:after {
      background: transparent;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    width: initial;
    height: initial;
    top: calc(50% - 24px);
    right: 16px;
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
  bottom: ${({ isEditingStories }) => (isEditingStories ? '56px' : '102px')};

  display: flex;
  justify-content: center;
  gap: 4px;

  transition: 0.1s linear;
  transition: bottom 0s linear;

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
