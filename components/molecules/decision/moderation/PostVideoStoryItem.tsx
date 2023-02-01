/* eslint-disable arrow-body-style */
import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoStoryItem {
  video: newnewapi.IVideoUrls;
  index: number;
  isVisible: boolean;
  isMuted?: boolean;
}

const PostVideoStoryItem: React.FunctionComponent<IPostVideoStoryItem> = ({
  video,
  index,
  isVisible,
  isMuted,
}) => {
  return (
    <SVideoStoryItem
      id={`storyItem_${index}`}
      key={`key_${video?.uuid}_${index}`}
    >
      {isVisible ? (
        <PostBitmovinPlayer
          id={`id_${video?.uuid ?? index}`}
          resources={video}
          muted={isMuted}
          showPlayButton
        />
      ) : (
        <SPlaceHolder>
          <SImg src={video.thumbnailImageUrl ?? ''} />
        </SPlaceHolder>
      )}
    </SVideoStoryItem>
  );
};

export default PostVideoStoryItem;

const SVideoStoryItem = styled.div`
  width: 100%;
  height: 100%;

  flex-shrink: 0;
  scroll-snap-align: start;
  // NB! Investigate if it would be worth it
  scroll-snap-stop: always;
`;

const SPlaceHolder = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 16px;
`;

const SImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;

  filter: blur(32px);
`;
