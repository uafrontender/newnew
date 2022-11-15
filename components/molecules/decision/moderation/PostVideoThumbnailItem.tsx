/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../redux-store/store';

import InlineSvg from '../../../atoms/InlineSVG';
import DeleteVideoModal from './DeleteVideoModal';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

interface IPostVideoThumbnailItemHelperModal {
  top: number;
  left: number;
}

const PostVideoThumbnailItemHelperModal: React.FunctionComponent<
  IPostVideoThumbnailItemHelperModal
> = ({ top, left }) => {
  const { t } = useTranslation('page-Post');

  return ReactDOM.createPortal(
    <AnimatePresence>
      <SHelperDiv
        key='helper-div'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: 'tween',
          duration: 0.15,
          delay: 0,
        }}
        style={{
          top: top - 48,
          left: left + 29.5,
        }}
      >
        <SHelperDivInner>{t('deleteVideoModal.title')}</SHelperDivInner>
        <SHelperDivPointer />
      </SHelperDiv>
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
};

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
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const containerRef = useRef<HTMLDivElement>();

  const [helperVisible, setHelperVisible] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <SContainer
        ref={(el) => {
          containerRef.current = el!!;
        }}
        id={`postVideoThumbnailItem_${index}`}
        onClick={() => handleClick()}
      >
        <SWrapper>
          <SImg src={video.thumbnailImageUrl ?? ''} />
        </SWrapper>
        {index !== 0 ? (
          <SDeleteButton
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
          <PostVideoThumbnailItemHelperModal
            top={containerRef.current?.getBoundingClientRect().top ?? 0}
            left={containerRef.current?.getBoundingClientRect().left ?? 0}
          />
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

// Helper div
const SHelperDiv = styled(motion.div)`
  position: fixed;

  z-index: 10;
`;

const SHelperDivInner = styled.div`
  z-index: 11;
  width: 100px;
  background: white;
  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.dark};

  padding: 6px 10px;

  border-radius: 8px;
`;

const SHelperDivPointer = styled.div`
  z-index: -1;
  position: absolute;
  bottom: -3px;
  left: calc(50% - 7px);

  width: 14px;
  height: 14px;
  border-radius: 3px;

  background: #ffffff;
  transform: matrix(0.71, -0.61, 0.82, 0.71, 0, 0);
`;
