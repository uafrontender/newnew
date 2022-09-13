import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../../atoms/EllipseMenu';

import isBrowser from '../../../../../utils/isBrowser';

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
    if (isBrowser()) {
      const postModal = document.getElementById('post-modal-container');
      if (isVisible && postModal) {
        postModal.style.overflow = 'hidden';
      } else if (postModal) {
        postModal.style.overflow = 'scroll';
      }
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
          <EllipseMenuButton
            variant={3}
            tone='error'
            onClick={() => {
              handleOpenReportOptionModal();
              handleClose();
            }}
          >
            {t('ellipse.reportOption')}
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
        </>
      ) : null}
      <EllipseMenuButton
        variant={3}
        disabled={!canBeDeleted}
        onClick={() => {
          handleOpenRemoveOptionModal();
          handleClose();
        }}
      >
        {t('ellipse.removeOption')}
      </EllipseMenuButton>
    </SEllipseMenu>
  );
};

export default McOptionCardModerationEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 150px;
  min-width: 150px;
  position: fixed;

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
