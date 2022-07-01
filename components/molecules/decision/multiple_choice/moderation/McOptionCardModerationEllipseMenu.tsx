import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../../atoms/EllipseMenu';

interface IMcOptionCardModerationEllipseMenu {
  isVisible: boolean;
  isBySubscriber: boolean;
  canBeDeleted: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
  anchorElement?: HTMLElement;
}

const McOptionCardModerationEllipseMenu: React.FunctionComponent<
  IMcOptionCardModerationEllipseMenu
> = ({
  isVisible,
  isBySubscriber,
  canBeDeleted,
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
      {isBySubscriber ? (
        <>
          <SEllipseMenuButton
            variant={3}
            tone='error'
            onClick={() => {
              handleOpenReportOptionModal();
              handleClose();
            }}
          >
            {t('ellipse.reportOption')}
          </SEllipseMenuButton>
          <SEllipseMenuButton
            variant={3}
            onClick={() => {
              handleOpenBlockUserModal();
              handleClose();
            }}
          >
            {t('ellipse.blockUser')}
          </SEllipseMenuButton>
        </>
      ) : null}
      <SEllipseMenuButton
        variant={3}
        disabled={!canBeDeleted}
        onClick={() => {
          handleOpenRemoveOptionModal();
          handleClose();
        }}
      >
        {t('ellipse.removeOption')}
      </SEllipseMenuButton>
    </SEllipseMenu>
  );
};

export default McOptionCardModerationEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 150px;
  min-width: 150px;
  position: fixed;
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  :hover {
    background: transparent;
  }
`;
