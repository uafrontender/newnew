/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import PostVideoThumbnailItem from './PostVideoThumbnailItem';
import isBrowser from '../../../../utils/isBrowser';

interface IPostVideoStoriesPreviewSlider {
  videos: newnewapi.IVideoUrls[];
  currentActive: number;
  offsetBottom: number;
  handleChangeCurrentActive: (idx: number) => void;
  handleDeleteAdditionalVideo: (videoUuid: string) => void;
}

const PostVideoStoriesPreviewSlider: React.FunctionComponent<
  IPostVideoStoriesPreviewSlider
> = ({
  videos,
  currentActive,
  offsetBottom,
  handleChangeCurrentActive,
  handleDeleteAdditionalVideo,
}) => {
  const containerRef = useRef<HTMLDivElement>();

  console.log(offsetBottom);

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
        ...(offsetBottom
          ? {
              bottom: offsetBottom + 64,
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
        {videos.map((video, i) => (
          <PostVideoThumbnailItem
            key={video.uuid ?? i}
            index={i}
            video={video}
            handleClick={() => handleChangeCurrentActive(i)}
            handleDeleteVideo={() => handleDeleteAdditionalVideo(video.uuid!!)}
          />
        ))}
      </SContainer>
    </SWrapper>
  );
};

export default PostVideoStoriesPreviewSlider;

const SWrapper = styled.div`
  position: absolute;
  height: 146px;
  width: calc(100% - 48px);
  left: 24px;
  bottom: 82px;

  padding: 8px 8px;

  background-color: rgba(11, 10, 19, 0.2);
  border-radius: 10px;

  ${({ theme }) => theme.media.tablet} {
    height: 84px;

    bottom: 56px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 116px;

    bottom: 72px;
  }
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
  gap: 8px;

  position: relative;

  scroll-snap-type: x mandatory;
`;
