import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { checkCanDeleteAcOption } from '../../../../../api/endpoints/auction';

import EllipseMenu, { EllipseMenuButton } from '../../../../atoms/EllipseMenu';

interface IAcOptionCardModerationEllipseMenu {
  isVisible: boolean;
  optionId: number;
  canDeleteOptionInitial: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
  anchorElement?: HTMLElement;
}

const AcOptionCardModerationEllipseMenu: React.FunctionComponent<
  IAcOptionCardModerationEllipseMenu
> = ({
  isVisible,
  optionId,
  canDeleteOptionInitial,
  handleClose,
  handleOpenReportOptionModal,
  handleOpenBlockUserModal,
  handleOpenRemoveOptionModal,
  anchorElement,
}) => {
  const { t } = useTranslation('common');

  const [canDeleteOption, setCanDeleteOption] = useState(
    canDeleteOptionInitial
  );
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

    if (isVisible && canDeleteOption) {
      fetchCanDelete();
    }
  }, [isVisible, canDeleteOption, optionId]);

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <EllipseMenuButton
        variant={3}
        tone='error'
        onClick={() => {
          handleOpenReportOptionModal();
          handleClose();
        }}
      >
        {t('ellipse.reportBid')}
      </EllipseMenuButton>
      <EllipseMenuButton
        variant={3}
        onClick={() => {
          handleOpenBlockUserModal();
          handleClose();
        }}
      >
        {t('ellipse.blockUser')}
      </EllipseMenuButton>
      <EllipseMenuButton
        variant={3}
        disabled={
          !canDeleteOption ||
          isCanDeleteOptionLoading ||
          !canDeleteOptionInitial
        }
        onClick={() => {
          handleOpenRemoveOptionModal();
          handleClose();
        }}
      >
        {t('ellipse.removeBid')}
      </EllipseMenuButton>
    </SEllipseMenu>
  );
};

export default AcOptionCardModerationEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  width: 176px;
  min-width: 176px;

  background: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colors.white
      : theme.colorsThemed.background.tertiary};

  ${({ theme }) =>
    theme.name === 'light' &&
    css`
      box-shadow: 0px 0px 35px 0px rgba(0, 0, 0, 0.25);
    `}
`;
