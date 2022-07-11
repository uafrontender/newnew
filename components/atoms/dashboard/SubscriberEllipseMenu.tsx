import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import EllipseMenu, { EllipseMenuButton } from '../EllipseMenu';

interface ISubscriberEllipseMenu {
  user: newnewapi.IUser;
  isVisible: boolean;
  handleClose: () => void;
  onUserBlock: () => void;
  onUserReport: () => void;
  userBlocked?: boolean;
  anchorElement?: HTMLElement;
}

const SubscriberEllipseMenu: React.FC<ISubscriberEllipseMenu> = ({
  isVisible,
  handleClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  user,
  anchorElement,
}) => {
  const { t } = useTranslation('common');

  const blockUserHandler = () => {
    onUserBlock();
    handleClose();
  };

  const reportUserHandler = () => {
    onUserReport();
    handleClose();
  };

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
    >
      <Link href={`/${user.username}`}>
        <a style={{ width: '100%' }}>
          <EllipseMenuButton>{t('ellipse.view')}</EllipseMenuButton>
        </a>
      </Link>
      <EllipseMenuButton onClick={reportUserHandler}>
        {t('ellipse.report')}
      </EllipseMenuButton>
      <EllipseMenuButton onClick={blockUserHandler}>
        {userBlocked ? t('ellipse.unblock') : t('ellipse.block')}
      </EllipseMenuButton>
    </SEllipseMenu>
  );
};

SubscriberEllipseMenu.defaultProps = {
  userBlocked: false,
};

export default SubscriberEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 216px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);
`;
