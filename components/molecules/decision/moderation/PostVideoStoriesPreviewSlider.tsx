/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import isBrowser from '../../../../utils/isBrowser';
import { useAppSelector } from '../../../../redux-store/store';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import PostVideoThumbnailItem from './PostVideoThumbnailItem';

interface IPostVideoStoriesPreviewSlider {
  videos: newnewapi.IVideoUrls[];
  currentActive: number;
  offsetBottom: number;
  canDeleteOnlyNonUploaded?: boolean;
  isDeletingAdditionalResponse: boolean;
  handleChangeCurrentActive: (idx: number) => void;
  handleDeleteAdditionalVideo?: (videoUuid: string) => void;
  handleDeleteUnuploadedAdditonalResponse?: () => void;
}

const PostVideoStoriesPreviewSlider: React.FunctionComponent<
  IPostVideoStoriesPreviewSlider
> = ({
  videos,
  currentActive,
  offsetBottom,
  isDeletingAdditionalResponse,
  handleChangeCurrentActive,
  handleDeleteAdditionalVideo,
  handleDeleteUnuploadedAdditonalResponse,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
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

  useEffect(() => {
    if (currentActive !== undefined && isBrowser()) {
      document
        ?.getElementById(`postVideoThumbnailItem_${currentActive}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
    }
  }, [currentActive]);

  return (
    <SWrapper
      style={{
        ...(offsetBottom && !isMobileOrTablet
          ? {
              bottom: offsetBottom + 48,
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
            handleDeleteUnuploadedAdditonalResponse={() =>
              handleDeleteUnuploadedAdditonalResponse?.()
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
`;
