import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, {
  EllipseModalButton,
} from '../../../../atoms/EllipseModal';

interface IMcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  isBySubscriber: boolean;
  canBeDeleted: boolean;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const McOptionCardModerationEllipseModal: React.FunctionComponent<IMcOptionCardModerationEllipseModal> =
  ({
    isOpen,
    zIndex,
    onClose,
    isBySubscriber,
    canBeDeleted,
    handleOpenReportOptionModal,
    handleOpenBlockUserModal,
    handleOpenRemoveOptionModal,
  }) => {
    const { t } = useTranslation('common');

    return (
      <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
        {isBySubscriber && (
          <EllipseModalButton
            tone='error'
            onClick={() => {
              handleOpenReportOptionModal();
              onClose();
            }}
          >
            {t('ellipse.reportOption')}
          </EllipseModalButton>
        )}
        {isBySubscriber && (
          <EllipseModalButton
            onClick={() => {
              handleOpenBlockUserModal();
              onClose();
            }}
          >
            {t('ellipse.blockUser')}
          </EllipseModalButton>
        )}
        <EllipseModalButton
          disabled={!canBeDeleted}
          onClick={() => {
            handleOpenRemoveOptionModal();
            onClose();
          }}
        >
          {t('ellipse.removeOption')}
        </EllipseModalButton>
      </EllipseModal>
    );
  };

export default McOptionCardModerationEllipseModal;
