/* eslint-disable no-nested-ternary */
import React, { useRef } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import PostVideoThumbnailItem from './PostVideoThumbnailItem';
import { useAppState } from '../../../../contexts/appStateContext';

interface IPostVideoStoriesPreviewSlider {
  videos: newnewapi.IVideoUrls[];
  currentActive: number;
  uiOffset: number;
  canDeleteOnlyNonUploaded?: boolean;
  isDeletingAdditionalResponse: boolean;
  handleChangeCurrentActive: (idx: number) => void;
  handleDeleteAdditionalVideo?: (videoUuid: string) => void;
  handleDeleteUnUploadedAdditionalResponse?: () => void;
}

const PostVideoStoriesPreviewSlider: React.FunctionComponent<
  IPostVideoStoriesPreviewSlider
> = ({
  videos,
  currentActive,
  uiOffset,
  isDeletingAdditionalResponse,
  handleChangeCurrentActive,
  handleDeleteAdditionalVideo,
  handleDeleteUnUploadedAdditionalResponse,
}) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { readyToUploadAdditionalResponse } =
    usePostModerationResponsesContext();

  const containerRef = useRef<HTMLDivElement>();

  return (
    <SWrapper
      style={{
        ...(uiOffset && !isMobileOrTablet
          ? {
              transform: `translateY(-${uiOffset}px)`,
            }
          : {}),
      }}
    >
      <SContainer
        id='responsesThumbnailsSlider'
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        {videos.map((video, i, arr) => (
          <PostVideoThumbnailItem
            key={video?.uuid ?? i}
            index={i}
            video={video}
            isNonUploadedYet={
              i === arr.length - 1 && readyToUploadAdditionalResponse
            }
            handleClick={() => handleChangeCurrentActive(i)}
            isDeletingAdditionalResponse={isDeletingAdditionalResponse}
            handleDeleteVideo={() =>
              handleDeleteAdditionalVideo?.(video?.uuid!!)
            }
            handleDeleteUnUploadedAdditionalResponse={() =>
              handleDeleteUnUploadedAdditionalResponse?.()
            }
          />
        ))}
      </SContainer>
    </SWrapper>
  );
};

export default PostVideoStoriesPreviewSlider;

const SWrapper = styled.div`
  position: absolute;
  left: 24px;
  bottom: 82px;

  height: 146px;
  width: calc(100% - 48px);

  overflow: visible;

  background-color: rgba(11, 10, 19, 0.2);
  border-radius: 10px;

  ${({ theme }) => theme.media.tablet} {
    height: 84px;

    bottom: 64px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 116px;

    bottom: 72px;
  }
`;

const SContainer = styled.div`
  position: relative;
  top: -12px;

  width: 100%;
  height: calc(100% + 12px);

  padding: 8px 8px;
  padding-top: 20px;

  overflow: visible;
  overflow-x: auto;
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  display: flex;
  gap: 8px;

  position: relative;

  scroll-snap-type: x mandatory;
  scroll-padding: 8px;
`;
