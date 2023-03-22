import React, { useRef } from 'react';
import styled, { useTheme } from 'styled-components';

import { TPostType } from '../../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import PostShareEllipseMenu from '../common/PostShareEllipseMenu';
import PostShareEllipseModal from '../common/PostShareEllipseModal';
import PostConfirmDeleteModal from './PostConfirmDeleteModal';
import PostEllipseModalModeration from './PostEllipseModalModeration';
import PostEllipseMenuModeration from './PostEllipseMenuModeration';

// Icons
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import ShareIcon from '../../../../public/images/svg/icons/filled/Share.svg';
import MoreIcon from '../../../../public/images/svg/icons/filled/More.svg';

interface IPostModerationControls {
  postStatus: TPostStatusStringified;
  typeOfPost: TPostType;
  ellipseMenuOpen: boolean;
  isMobile: boolean;
  postUuid: string;
  postShortId: string;
  shareMenuOpen: boolean;
  deletePostOpen: boolean;
  handleCloseAndGoBack: () => void;
  handleEllipseMenuClose: () => void;
  handleShareClose: () => void;
  handleOpenShareMenu: () => void;
  handleOpenEllipseMenu: () => void;
  handleOpenDeletePostModal: () => void;
  handleCloseDeletePostModal: () => void;
  isDeletingPost: boolean;
  handleDeletePost: () => Promise<void>;
}

const PostModerationControls: React.FunctionComponent<
  IPostModerationControls
> = ({
  postStatus,
  ellipseMenuOpen,
  isMobile,
  postUuid,
  postShortId,
  shareMenuOpen,
  typeOfPost,
  deletePostOpen,
  handleCloseAndGoBack,
  handleEllipseMenuClose,
  handleShareClose,
  isDeletingPost,
  handleDeletePost,
  handleOpenShareMenu,
  handleOpenEllipseMenu,
  handleOpenDeletePostModal,
  handleCloseDeletePostModal,
}) => {
  const theme = useTheme();

  const moreButtonRef: any = useRef();
  const shareButtonRef: any = useRef();

  return (
    <SPostSuccessWaitingControlsDiv
      variant='moderation'
      style={{
        ...(isMobile &&
        (postStatus === 'deleted_by_admin' ||
          postStatus === 'deleted_by_creator')
          ? {
              marginTop: 64,
            }
          : {}),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <SWaitingSuccessControlsBtn
        view='secondary'
        iconOnly
        onClick={handleCloseAndGoBack}
      >
        <InlineSvg
          svg={CancelIcon}
          fill={theme.name === 'light' ? theme.colors.dark : theme.colors.white}
          width='24px'
          height='24px'
        />
      </SWaitingSuccessControlsBtn>
      {postStatus !== 'deleted_by_admin' &&
        postStatus !== 'deleted_by_creator' && (
          <>
            <SWaitingSuccessControlsBtn
              view='secondary'
              iconOnly
              onClick={() => handleOpenShareMenu()}
              ref={shareButtonRef}
            >
              <InlineSvg
                svg={ShareIcon}
                fill={
                  theme.name === 'light'
                    ? theme.colors.dark
                    : theme.colors.white
                }
                width='24px'
                height='24px'
              />
            </SWaitingSuccessControlsBtn>
            <SWaitingSuccessControlsBtn
              view='secondary'
              iconOnly
              onClick={() => handleOpenEllipseMenu()}
              ref={moreButtonRef}
            >
              <InlineSvg
                svg={MoreIcon}
                fill={
                  theme.name === 'light'
                    ? theme.colors.dark
                    : theme.colors.white
                }
                width='24px'
                height='24px'
              />
            </SWaitingSuccessControlsBtn>
          </>
        )}
      {/* Share menu */}
      {!isMobile && postUuid && (
        <PostShareEllipseMenu
          postUuid={postUuid}
          postShortId={postShortId}
          isVisible={shareMenuOpen}
          onClose={handleShareClose}
          anchorElement={shareButtonRef.current as HTMLElement}
        />
      )}
      {isMobile && shareMenuOpen && postUuid && (
        <PostShareEllipseModal
          isOpen={shareMenuOpen}
          zIndex={11}
          postUuid={postUuid}
          postShortId={postShortId}
          onClose={handleShareClose}
        />
      )}
      {/* Ellipse menu */}
      {!isMobile && (
        <PostEllipseMenuModeration
          postUuid={postUuid}
          postType={typeOfPost as TPostType}
          isVisible={ellipseMenuOpen}
          canDeletePost={postStatus !== 'succeeded'}
          handleClose={handleEllipseMenuClose}
          handleOpenDeletePostModal={handleOpenDeletePostModal}
          anchorElement={moreButtonRef.current}
        />
      )}
      {isMobile && ellipseMenuOpen ? (
        <PostEllipseModalModeration
          postUuid={postUuid}
          postType={typeOfPost as TPostType}
          zIndex={11}
          canDeletePost={postStatus !== 'succeeded'}
          isOpen={ellipseMenuOpen}
          onClose={handleEllipseMenuClose}
          handleOpenDeletePostModal={handleOpenDeletePostModal}
        />
      ) : null}
      {/* Confirm delete post */}
      <PostConfirmDeleteModal
        postUuid={postUuid}
        postType={typeOfPost as TPostType}
        isVisible={deletePostOpen}
        closeModal={handleCloseDeletePostModal}
        isDeletingPost={isDeletingPost}
        handleConfirmDelete={handleDeletePost}
      />
    </SPostSuccessWaitingControlsDiv>
  );
};

export default PostModerationControls;

const SPostSuccessWaitingControlsDiv = styled.div<{
  variant: 'decision' | 'moderation';
}>`
  position: absolute;
  right: 16px;
  top: ${({ variant }) => (variant === 'moderation' ? '64px' : '16px')};

  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  z-index: 1000;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    top: 16px;
    flex-direction: row-reverse;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptopM} {
    flex-direction: column;
    gap: 8px;
    right: 24px;
    top: 32px;
  }
`;

const SWaitingSuccessControlsBtn = styled(Button)`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  background: #2d2d2d2e;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    background: #96949410;
  }
`;
