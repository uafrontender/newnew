import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';

import isBrowser from '../../../utils/isBrowser';

interface ICommentEllipseMenu {
  isVisible: boolean;
  canDeleteComment: boolean;
  isMyComment: boolean;
  handleClose: () => void;
  onDeleteComment: () => void;
  onUserReport: () => void;
  anchorElement: HTMLElement;
}

const CommentEllipseMenu: React.FC<ICommentEllipseMenu> = ({
  isVisible,
  isMyComment,
  canDeleteComment,
  handleClose,
  onDeleteComment,
  onUserReport,
  anchorElement,
}) => {
  const { t } = useTranslation('common');

  const reportUserHandler = () => {
    onUserReport();
    handleClose();
  };

  const deleteCommentHandler = () => {
    onDeleteComment();
    handleClose();
  };

  useEffect(() => {
    if (isBrowser()) {
      const postModal = document.getElementById('post-modal-container');
      if (isVisible && postModal) {
        postModal.style.overflow = 'hidden';
      } else if (postModal) {
        postModal.style.overflow = 'scroll';
      }
    }
  }, [isVisible]);

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
      zIndex={11}
    >
      {canDeleteComment && (
        <EllipseMenuButton onClick={deleteCommentHandler}>
          {t('ellipse.delete')}
        </EllipseMenuButton>
      )}
      {!isMyComment && (
        <EllipseMenuButton onClick={reportUserHandler} tone='error'>
          {t('ellipse.report')}
        </EllipseMenuButton>
      )}
    </SEllipseMenu>
  );
};

export default CommentEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  width: 216px;
`;
