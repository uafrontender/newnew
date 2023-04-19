import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../atoms/EllipseModal';

interface IUserEllipseModal {
  isOpen: boolean;
  zIndex: number;
  isBlocked: boolean;
  loggedIn: boolean;
  onClose: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => Promise<void>;
}

const UserEllipseModal: React.FunctionComponent<IUserEllipseModal> = ({
  isOpen,
  zIndex,
  isBlocked,
  loggedIn,
  onClose,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('common');

  const blockHandler = useCallback(async () => {
    await handleClickBlock();
    onClose();
  }, [handleClickBlock, onClose]);

  const reportUserHandler = useCallback(() => {
    handleClickReport();
    onClose();
  }, [handleClickReport, onClose]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton tone='error' onClick={reportUserHandler}>
        {t('ellipse.report')}
      </EllipseModalButton>
      {loggedIn && (
        <EllipseModalButton onClick={blockHandler}>
          {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
        </EllipseModalButton>
      )}
    </EllipseModal>
  );
};

export default UserEllipseModal;
