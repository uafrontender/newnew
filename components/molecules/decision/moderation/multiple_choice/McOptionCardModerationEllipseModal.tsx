import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { checkCanDeleteMcOption } from '../../../../../api/endpoints/multiple_choice';

import EllipseModal, {
  EllipseModalButton,
} from '../../../../atoms/EllipseModal';

interface IMcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  isBySubscriber: boolean;
  optionId: number;
  canDeleteOptionInitial: boolean;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const McOptionCardModerationEllipseModal: React.FunctionComponent<
  IMcOptionCardModerationEllipseModal
> = ({
  isOpen,
  zIndex,
  onClose,
  isBySubscriber,
  optionId,
  canDeleteOptionInitial,
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
        const payload = new newnewapi.CanDeleteMcOptionRequest({
          optionId,
        });

        const res = await checkCanDeleteMcOption(payload);

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
        {t('ellipse.removeOption')}
      </EllipseModalButton>
    </EllipseModal>
  );
};

export default McOptionCardModerationEllipseModal;
