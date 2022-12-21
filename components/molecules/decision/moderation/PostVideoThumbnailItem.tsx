/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../redux-store/store';

import InlineSvg from '../../../atoms/InlineSVG';
import DeleteVideoModal from './DeleteVideoModal';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import Tooltip from '../../../atoms/Tooltip';

interface IPostVideoThumbnailItem {
  index: number;
  video: newnewapi.IVideoUrls;
  isNonUploadedYet: boolean;
  handleClick: () => void;
  handleDeleteVideo: () => void;
  handleDeleteUnuploadedAdditonalResponse: () => void;
}

const PostVideoThumbnailItem: React.FunctionComponent<
  IPostVideoThumbnailItem
> = ({
  index,
  video,
  isNonUploadedYet,
  handleClick,
  handleDeleteVideo,
  handleDeleteUnuploadedAdditonalResponse,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const deleteButtonRef = useRef<HTMLButtonElement>();

  const [helperVisible, setHelperVisible] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <SContainer
        id={`postVideoThumbnailItem_${index}`}
        onClick={() => handleClick()}
      >
        <SWrapper>
          <SImg src={video.thumbnailImageUrl ?? ''} />
        </SWrapper>
        {index !== 0 ? (
          <SDeleteButton
            ref={(el) => {
              deleteButtonRef.current = el!!;
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            onMouseEnter={() => setHelperVisible(true)}
            onMouseLeave={() => setHelperVisible(false)}
          >
            <InlineSvg
              svg={CancelIcon}
              fill='#FFFFFF'
              width='24px'
              height='24px'
            />
          </SDeleteButton>
        ) : null}
        {helperVisible && !isMobileOrTablet && (
          <Tooltip target={deleteButtonRef} topGap={4}>
            {t('deleteVideoModal.title')}
          </Tooltip>
        )}
      </SContainer>
      <DeleteVideoModal
        isVisible={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        handleConfirmDelete={() => {
          if (isNonUploadedYet) {
            handleDeleteUnuploadedAdditonalResponse();
          } else {
            handleDeleteVideo();
          }
        }}
      />
    </>
  );
};

export default PostVideoThumbnailItem;

const SContainer = styled.div`
  width: 102px;
  height: 130px;
  border-radius: 4px;

  position: relative;

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
`;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  display: flex;
  justify-content: center;
`;

const SImg = styled.img`
  width: 100%;
  object-fit: cover;
`;

const SDeleteButton = styled.button`
  position: absolute;
  top: -12px;
  right: -12px;

  background: rgba(40, 41, 51, 1);

  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 10;

  cursor: pointer;

  &:active:enabled {
    outline: none;
  }
`;
