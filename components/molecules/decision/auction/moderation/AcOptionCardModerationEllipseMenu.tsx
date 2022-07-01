import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../../atoms/EllipseMenu';

interface IAcOptionCardModerationEllipseMenu {
  isVisible: boolean;
  canDeleteOption: boolean;
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
  canDeleteOption,
  handleClose,
  handleOpenReportOptionModal,
  handleOpenBlockUserModal,
  handleOpenRemoveOptionModal,
  anchorElement,
}) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    const postModal = document.getElementById('post-modal-container');
    if (isVisible && postModal) {
      postModal.style.overflow = 'hidden';
    } else if (postModal) {
      postModal.style.overflow = 'scroll';
    }
  }, [isVisible]);

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
        disabled={!canDeleteOption}
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
  width: 120px;
  min-width: 120px;
`;
