import React from 'react';
import { useTranslation } from 'next-i18next';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';
import { useAppSelector } from '../../../redux-store/store';

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
}

const UserEllipseMenu: React.FC<IUserEllipseMenu> = ({
  isVisible,
  isSubscribed,
  isBlocked,
  loggedIn,
  anchorElement,
  handleClose,
  handleClickUnsubscribe,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('common');

  const { resizeMode } = useAppSelector((state) => state.ui);

  const isDesktop = ['laptop', 'laptopM', 'laptopL', 'desktop'].includes(
    resizeMode
  );

  return (
    <EllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      isCloseOnItemClick
      anchorElement={anchorElement}
      offsetTop={isDesktop ? '-25px' : '0'}
    >
      {isSubscribed && (
        <EllipseMenuButton onClick={handleClickUnsubscribe}>
          {t('ellipse.unsubscribe')}
        </EllipseMenuButton>
      )}
      <EllipseMenuButton onClick={handleClickReport} tone='error'>
        {t('ellipse.report')}
      </EllipseMenuButton>
      {loggedIn && (
        <EllipseMenuButton onClick={handleClickBlock}>
          {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
        </EllipseMenuButton>
      )}
    </EllipseMenu>
  );
};

export default UserEllipseMenu;
