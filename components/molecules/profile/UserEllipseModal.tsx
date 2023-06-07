import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, { EllipseModalButton } from '../../atoms/EllipseModal';
import { useAppState } from '../../../contexts/appStateContext';

interface IUserEllipseModal {
  isOpen: boolean;
  zIndex: number;
  isBlocked: boolean;
  onClose: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => Promise<void>;
}

const UserEllipseModal: React.FunctionComponent<IUserEllipseModal> = ({
  isOpen,
  zIndex,
  isBlocked,
  onClose,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('common');
  const { userLoggedIn } = useAppState();

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
      {userLoggedIn && (
        <EllipseModalButton onClick={blockHandler}>
          {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
        </EllipseModalButton>
      )}
    </EllipseModal>
  );
};

export default UserEllipseModal;
