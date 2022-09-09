/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import React, { useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../../../atoms/InlineSVG';

interface IPostVideoThumbnailItem {
  index: number;
  video: newnewapi.IVideoUrls;
  handleClick: () => void;
  handleDeleteVideo: () => void;
}

const PostVideoThumbnailItem: React.FunctionComponent<
  IPostVideoThumbnailItem
> = ({ index, video, handleClick, handleDeleteVideo }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <SContainer
      id={`postVideoThumbnailItem_${index}`}
      onClick={() => handleClick()}
    >
      <SImg src={video.thumbnailImageUrl ?? ''} />
      <STest>{index + 1}</STest>
      {index !== 0 ? (
        <SDeleteButton onClick={() => setIsDeleteModalOpen(true)}>
          <InlineSvg
            svg={CancelIcon}
            fill='#FFFFFF'
            width='24px'
            height='24px'
          />
        </SDeleteButton>
      ) : null}
    </SContainer>
  );
};

export default PostVideoThumbnailItem;

const SContainer = styled.div`
  width: 102px;
  height: 130px;
  border-radius: 4px;

  flex-shrink: 0;
  scroll-snap-align: start;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    height: 68px;
    width: 50px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 100px;
    width: 80px;
  }

  // TEMP
  background-color: blue;
`;

const SImg = styled.img``;

const SDeleteButton = styled.button`
  position: absolute;
`;

const STest = styled.div`
  position: absolute;
  bottom: 0;

  font-size: 32px;
  color: white;
`;
