import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';

import isBrowser from '../../../../utils/isBrowser';

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
      const commentsContainer = document.getElementById(
        'comments-scrolling-container'
      );
      if (isVisible && commentsContainer) {
        commentsContainer.style.overflow = 'hidden';
        commentsContainer.style.width = 'calc(100% - 4px)';
      } else if (commentsContainer) {
        commentsContainer.style.overflow = 'auto';
        commentsContainer.style.width = '';
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
