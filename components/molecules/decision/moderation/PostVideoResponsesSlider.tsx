import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { useAppState } from '../../../../contexts/appStateContext';

interface IPostVideoResponsesSlider {
  videos: newnewapi.IVideoUrls[];
  dotsBottom?: number;
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
  dotsBottom,
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

  const { postParsed } = usePostInnerState();
  const { videoProcessing } = usePostModerationResponsesContext();
  const uploadedFile = useMemo(
    () => videoProcessing?.targetUrls,
    [videoProcessing]
  );

  const videosLength = useMemo(() => videos.length, [videos.length]);
  const containerRef = useRef<HTMLDivElement>();
  const [currentVideo, setCurrentVideo] = useState(0);

  const [hovered, setHovered] = useState(false);

  const scrollSliderTo = useCallback(
    (to: number) => {
      const containerWidth =
        containerRef.current?.getBoundingClientRect().width;
      let scrollTo = to;

      if (to < 0) {
        scrollTo = 0;
      } else if (scrollTo > (videosLength || 0) - 1) {
        scrollTo = (videosLength || 0) - 1;
      }

      if (containerWidth) {
        containerRef.current?.scrollTo({
          left: containerWidth * scrollTo,
          behavior: 'auto',
        });
      }
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

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const containerWidth =
        containerRef.current?.getBoundingClientRect().width;
      const containerScrollWidth = containerRef.current?.scrollWidth;
      const currentScrollLeft = containerRef.current?.scrollLeft;

      if (
        containerWidth &&
        containerScrollWidth &&
        currentScrollLeft !== undefined
      ) {
        const currentIndex = Math.floor(currentScrollLeft / containerWidth);

        setCurrentVideo(currentIndex);
      }
    };

    if (isBrowser()) {
      containerRef.current?.addEventListener('scroll', handleScroll);
    }

    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
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
            key={video?.uuid ?? i}
            video={video}
            index={i}
            isVisible={currentVideo === i}
            isMuted={isMuted}
            videoDurationWithTime={videoDurationWithTime}
            onPlaybackFinished={autoscroll ? handleScrollRight : undefined}
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
          offsetBottom={dotsBottom ?? 0}
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

  width: 75px;
  height: 200px;

  top: calc(50% - 100px);
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
    left: 24px;
    display: block;
    opacity: 0;
    transition: 0.3s linear;
  }
`;

const SScrollRight = styled(Button)`
  position: absolute;

  width: 75px;
  height: 200px;

  top: calc(50% - 100px);
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
    right: 24px;
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
