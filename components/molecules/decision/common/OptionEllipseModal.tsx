import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { checkCanDeleteAcOption } from '../../../../api/endpoints/auction';
import { checkCanDeleteMcOption } from '../../../../api/endpoints/multiple_choice';

import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';

interface IOptionModal {
  isOpen: boolean;
  zIndex: number;
  optionId?: number;
  optionCreatorUuid?: string;
  optionType?: 'ac' | 'mc';
  isMyOption?: boolean;
  onClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenRemoveOptionModal?: () => void;
}

const OptionEllipseModal: React.FunctionComponent<IOptionModal> = ({
  isOpen,
  zIndex,
  optionId,
  optionCreatorUuid,
  optionType,
  isMyOption,
  onClose,
  handleOpenReportOptionModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('common');

  const [canDeleteOption, setCanDeleteOption] = useState(false);
  const [isCanDeleteOptionLoading, setIsCanDeleteOptionLoading] =
    useState(isMyOption);

  useEffect(() => {
    async function fetchCanDelete() {
      setIsCanDeleteOptionLoading(true);
      try {
        let canDelete = false;
        if (optionType === 'ac') {
          const payload = new newnewapi.CanDeleteAcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteAcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        } else {
          const payload = new newnewapi.CanDeleteMcOptionRequest({
            optionId,
          });

          const res = await checkCanDeleteMcOption(payload);

          if (res.data) {
            canDelete = res.data.canDelete;
          }
        }

        setCanDeleteOption(canDelete);
      } catch (err) {
        console.error(err);
      }
      setIsCanDeleteOptionLoading(false);
    }

    if (isOpen && isMyOption) {
      fetchCanDelete();
    }
  }, [isOpen, isMyOption, optionType, optionId, optionCreatorUuid]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      {isMyOption && (
        <EllipseModalButton
          tone='error'
          disabled={!canDeleteOption || isCanDeleteOptionLoading}
          onClick={() => {
            handleOpenRemoveOptionModal?.();
            onClose();
          }}
        >
          {t('ellipse.delete')}
        </EllipseModalButton>
      )}
      {!isMyOption && (
        <EllipseModalButton
          tone='error'
          onClick={() => {
            handleOpenReportOptionModal();
            onClose();
          }}
        >
          {t('ellipse.report')}
        </EllipseModalButton>
      )}
    </EllipseModal>
  );
};

OptionEllipseModal.defaultProps = {
  optionId: undefined,
  optionCreatorUuid: undefined,
  optionType: undefined,
  isMyOption: undefined,
  handleOpenRemoveOptionModal: undefined,
};

export default OptionEllipseModal;
