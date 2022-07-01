import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseModal, {
  EllipseModalButton,
} from '../../../../atoms/EllipseModal';

interface IAcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  canDeleteOption: boolean;
  onClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const AcOptionCardModerationEllipseModal: React.FunctionComponent<IAcOptionCardModerationEllipseModal> =
  ({
    isOpen,
    zIndex,
    canDeleteOption,
    onClose,
    handleOpenReportOptionModal,
    handleOpenBlockUserModal,
    handleOpenRemoveOptionModal,
  }) => {
    const { t } = useTranslation('common');

    return (
      <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
        <EllipseModalButton
          tone='error'
          onClick={() => {
            handleOpenReportOptionModal();
            onClose();
          }}
        >
          {t('ellipse.reportBid')}
        </EllipseModalButton>
        <EllipseModalButton
          onClick={() => {
            handleOpenBlockUserModal();
            onClose();
          }}
        >
          {t('ellipse.blockUser')}
        </EllipseModalButton>
        <EllipseModalButton
          disabled={!canDeleteOption}
          onClick={() => {
            handleOpenRemoveOptionModal();
            onClose();
          }}
        >
          {t('ellipse.removeBid')}
        </EllipseModalButton>
      </EllipseModal>
    );
  };

export default AcOptionCardModerationEllipseModal;
