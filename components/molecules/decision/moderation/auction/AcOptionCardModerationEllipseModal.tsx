import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { checkCanDeleteAcOption } from '../../../../../api/endpoints/auction';

import EllipseModal, {
  EllipseModalButton,
} from '../../../../atoms/EllipseModal';

interface IAcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  optionId: number;
  canDeleteOptionInitial: boolean;
  onClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const AcOptionCardModerationEllipseModal: React.FunctionComponent<
  IAcOptionCardModerationEllipseModal
> = ({
  isOpen,
  zIndex,
  optionId,
  canDeleteOptionInitial,
  onClose,
  handleOpenReportOptionModal,
  handleOpenBlockUserModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('common');

  const [canDeleteOption, setCanDeleteOption] = useState(false);
  const [isCanDeleteOptionLoading, setIsCanDeleteOptionLoading] =
    useState(false);

  useEffect(() => {
    async function fetchCanDelete() {
      setIsCanDeleteOptionLoading(true);
      try {
        let canDelete = false;
        const payload = new newnewapi.CanDeleteAcOptionRequest({
          optionId,
        });

        const res = await checkCanDeleteAcOption(payload);

        if (res.data) {
          canDelete = res.data.canDelete;
        }

        setCanDeleteOption(canDelete);
      } catch (err) {
        console.error(err);
      }
      setIsCanDeleteOptionLoading(false);
    }

    if (isOpen && canDeleteOption) {
      fetchCanDelete();
    }
  }, [isOpen, canDeleteOption, optionId]);

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
        disabled={
          !canDeleteOption ||
          isCanDeleteOptionLoading ||
          !canDeleteOptionInitial
        }
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
