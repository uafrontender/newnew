import React, { useRef } from 'react';
import styled, { useTheme } from 'styled-components';

import { TPostType } from '../../../../utils/switchPostType';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import PostEllipseMenu from './PostEllipseMenu';
import PostShareEllipseMenu from './PostShareEllipseMenu';
import PostEllipseModal from './PostEllipseModal';
import PostShareEllipseModal from './PostShareEllipseModal';

// Icons
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import ShareIcon from '../../../../public/images/svg/icons/filled/Share.svg';
import MoreIcon from '../../../../public/images/svg/icons/filled/More.svg';

interface IPostSuccessOrWaitingControls {
  typeOfPost: TPostType;
  ellipseMenuOpen: boolean;
  isFollowingDecision: boolean;
  isMobile: boolean;
  postUuid: string;
  shareMenuOpen: boolean;
  handleCloseAndGoBack: () => void;
  handleEllipseMenuClose: () => void;
  handleFollowDecision: () => void;
  handleReportOpen: () => void;
  handleShareClose: () => void;
  handleOpenShareMenu: () => void;
  handleOpenEllipseMenu: () => void;
}

const PostSuccessOrWaitingControls: React.FunctionComponent<
  IPostSuccessOrWaitingControls
> = ({
  ellipseMenuOpen,
  isFollowingDecision,
  isMobile,
  postUuid,
  shareMenuOpen,
  typeOfPost,
  handleCloseAndGoBack,
  handleEllipseMenuClose,
  handleFollowDecision,
  handleReportOpen,
  handleShareClose,
  handleOpenShareMenu,
  handleOpenEllipseMenu,
}) => {
  const theme = useTheme();

  const moreButtonRef: any = useRef();
  const shareButtonRef: any = useRef();

  return (
    <SPostSuccessWaitingControlsDiv
      variant='decision'
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
      <SWaitingSuccessControlsBtn
        view='secondary'
        iconOnly
        onClick={() => handleOpenShareMenu()}
        ref={shareButtonRef}
      >
        <InlineSvg
          svg={ShareIcon}
          fill={theme.name === 'light' ? theme.colors.dark : theme.colors.white}
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
          fill={theme.name === 'light' ? theme.colors.dark : theme.colors.white}
          width='24px'
          height='24px'
        />
      </SWaitingSuccessControlsBtn>
      {/* Share menu */}
      {!isMobile && postUuid && (
        <PostShareEllipseMenu
          postId={postUuid}
          isVisible={shareMenuOpen}
          onClose={handleShareClose}
          anchorElement={shareButtonRef.current as HTMLElement}
        />
      )}
      {isMobile && shareMenuOpen && postUuid && (
        <PostShareEllipseModal
          isOpen={shareMenuOpen}
          zIndex={11}
          postId={postUuid}
          onClose={handleShareClose}
        />
      )}
      {/* Ellipse menu */}
      {!isMobile && (
        <PostEllipseMenu
          postType={typeOfPost as TPostType}
          isFollowingDecision={isFollowingDecision}
          isVisible={ellipseMenuOpen}
          handleFollowDecision={handleFollowDecision}
          handleReportOpen={handleReportOpen}
          onClose={handleEllipseMenuClose}
          anchorElement={moreButtonRef.current as HTMLElement}
        />
      )}
      {isMobile && ellipseMenuOpen ? (
        <PostEllipseModal
          postType={typeOfPost as TPostType}
          isFollowingDecision={isFollowingDecision}
          zIndex={11}
          isOpen={ellipseMenuOpen}
          handleFollowDecision={handleFollowDecision}
          handleReportOpen={handleReportOpen}
          onClose={handleEllipseMenuClose}
        />
      ) : null}
    </SPostSuccessWaitingControlsDiv>
  );
};

export default PostSuccessOrWaitingControls;

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
