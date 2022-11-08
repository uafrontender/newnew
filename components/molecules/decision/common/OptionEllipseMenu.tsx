import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import isBrowser from '../../../../utils/isBrowser';
import { checkCanDeleteMcOption } from '../../../../api/endpoints/multiple_choice';
import { checkCanDeleteAcOption } from '../../../../api/endpoints/auction';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';

interface IOptionMenu {
  xy: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  optionId?: number;
  optionCreatorUuid?: string;
  optionType?: 'ac' | 'mc';
  isMyOption?: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenRemoveOptionModal?: () => void;
}

const OptionEllipseMenu: React.FunctionComponent<IOptionMenu> = ({
  xy,
  isVisible,
  isMyOption,
  optionType,
  optionId,
  optionCreatorUuid,
  handleClose,
  handleOpenReportOptionModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('common');

  const [canDeleteOption, setCanDeleteOption] = useState(false);
  const [isCanDeleteOptionLoading, setIsCanDeleteOptionLoading] =
    useState(false);

  useEffect(() => {
    if (isBrowser()) {
      const container = document.getElementById('post-modal-container');
      if (container)
        if (isVisible) {
          container.style.overflowY = 'hidden';
        } else {
          container.style.overflowY = '';
        }
    }
  }, [isVisible]);

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

    if (isVisible && isMyOption) {
      fetchCanDelete();
    }
  }, [isVisible, isMyOption, optionType, optionId, optionCreatorUuid]);

  if (!isVisible) return null;

  return (
    <>
      <SBgDiv />
      <SEllipseMenu
        isOpen={isVisible}
        onClose={handleClose}
        style={{
          left: `${xy.x}px`,
          top: `${xy.y}px`,
        }}
      >
        {isMyOption && (
          <SEllipseMenuButton
            variant={3}
            tone='error'
            onClick={() => {
              handleOpenRemoveOptionModal?.();
              handleClose();
            }}
            disabled={!canDeleteOption || isCanDeleteOptionLoading}
          >
            {t('ellipse.delete')}
          </SEllipseMenuButton>
        )}
        {!isMyOption && (
          <SEllipseMenuButton
            variant={3}
            tone='error'
            onClick={() => {
              handleOpenReportOptionModal();
              handleClose();
            }}
          >
            {t('ellipse.report')}
          </SEllipseMenuButton>
        )}
      </SEllipseMenu>
    </>
  );
};

export default OptionEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  width: 120px;
  min-width: 120px;
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  &:focus:enabled,
  &:hover:enabled {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SBgDiv = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
