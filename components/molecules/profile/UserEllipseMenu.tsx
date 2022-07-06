import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';

interface IUserEllipseMenu {
  isVisible: boolean;
  isSubscribed: boolean;
  isBlocked: boolean;
  loggedIn: boolean;
  top?: string;
  right?: string;
  handleClose: () => void;
  handleClickUnsubscribe: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => void;
  anchorElement?: HTMLElement;
  offsetTop?: string;
}

const UserEllipseMenu: React.FC<IUserEllipseMenu> = ({
  isVisible,
  isSubscribed,
  isBlocked,
  loggedIn,
  anchorElement,
  offsetTop,
  handleClose,
  handleClickUnsubscribe,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('common');

  return (
    <EllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
      offsetTop={offsetTop}
    >
      {isSubscribed && (
        <EllipseMenuButton onClick={() => {
          handleClickUnsubscribe();
          handleClose();
        }}>
          {t('ellipse.unsubscribe')}
        </EllipseMenuButton>
      )}
      <EllipseMenuButton
        onClick={() => {
          handleClickReport();
          handleClose();
        }}
        tone='error'
      >
        {t('ellipse.report')}
      </EllipseMenuButton>
      {loggedIn && (
        <EllipseMenuButton 
          onClick={() => {
            handleClickBlock();
            handleClose();
          }}
        >
          {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
        </EllipseMenuButton>
      )}
    </EllipseMenu>
  );
};

export default UserEllipseMenu;
