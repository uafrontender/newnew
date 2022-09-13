import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';

interface ICommentEllipseModal {
  isOpen: boolean;
  zIndex: number;
  canDeleteComment: boolean;
  isMyComment: boolean;
  onClose: () => void;
  onDeleteComment: () => void;
  onUserReport: () => void;
}

const CommentEllipseModal: React.FunctionComponent<ICommentEllipseModal> = ({
  isOpen,
  zIndex,
  isMyComment,
  canDeleteComment,
  onClose,
  onDeleteComment,
  onUserReport,
}) => {
  const { t } = useTranslation('common');

  const reportUserHandler = () => {
    onUserReport();
    onClose();
  };

  const deleteCommentHandler = () => {
    onDeleteComment();
    onClose();
  };

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      {canDeleteComment && (
        <EllipseModalButton onClick={deleteCommentHandler}>
          {t('ellipse.delete')}
        </EllipseModalButton>
      )}
      {!isMyComment && (
        <EllipseModalButton tone='error' onClick={reportUserHandler}>
          {t('ellipse.report')}
        </EllipseModalButton>
      )}
    </EllipseModal>
  );
};

export default CommentEllipseModal;
