import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';

interface IPostEllipseMenuModeration {
  postType: string;
  isVisible: boolean;
  canDeletePost: boolean;
  handleClose: () => void;
  handleOpenDeletePostModal: () => void;
  anchorElement?: HTMLElement;
}

const PostEllipseMenuModeration: React.FunctionComponent<IPostEllipseMenuModeration> =
  React.memo(
    ({
      postType,
      isVisible,
      canDeletePost,
      handleClose,
      handleOpenDeletePostModal,
      anchorElement,
    }) => {
      const { t } = useTranslation('common');

      useEffect(() => {
        const postModal = document.getElementById('post-modal-container');
        if (isVisible && postModal) {
          postModal.style.overflow = 'hidden';
        } else if (postModal) {
          postModal.style.overflow = 'scroll';
        }
      }, [isVisible]);

      return (
        <SEllipseMenu
          isOpen={isVisible}
          onClose={handleClose}
          anchorElement={anchorElement}
        >
          <SEllipseMenuButton
            variant={3}
            disabled={!canDeletePost}
            onClick={() => {
              handleOpenDeletePostModal();
              handleClose();
            }}
          >
            {t('ellipse.deleteDecision', {
              postType: t(`postType.${postType}`),
            })}
          </SEllipseMenuButton>
        </SEllipseMenu>
      );
    }
  );

export default PostEllipseMenuModeration;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  min-width: max-content;

  ${({ theme }) =>
    theme.name === 'light'
      ? css`
          background: ${() => theme.colorsThemed.background.quaternary};
        `
      : null}
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  :hover {
    background: transparent;
  }
`;
