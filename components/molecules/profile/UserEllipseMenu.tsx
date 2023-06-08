import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';
import { useAppState } from '../../../contexts/appStateContext';

interface IUserEllipseMenu {
  isVisible: boolean;
  isBlocked: boolean;
  top?: string;
  right?: string;
  handleClose: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => Promise<void>;
  anchorElement?: HTMLElement;
  offsetTop?: string;
}

const UserEllipseMenu: React.FC<IUserEllipseMenu> = ({
  isVisible,
  isBlocked,
  anchorElement,
  offsetTop,
  handleClose,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('common');
  const { userLoggedIn } = useAppState();

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
      offsetTop={offsetTop}
    >
      <EllipseMenuButton
        onClick={() => {
          handleClickReport();
          handleClose();
        }}
        tone='error'
      >
        {t('ellipse.report')}
      </EllipseMenuButton>
      {userLoggedIn && (
        <EllipseMenuButton
          onClick={async () => {
            await handleClickBlock();
            handleClose();
          }}
        >
          {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
        </EllipseMenuButton>
      )}
    </SEllipseMenu>
  );
};

const SEllipseMenu = styled(EllipseMenu)`
  ${({ theme }) =>
    theme.name === 'light' &&
    css`
      box-shadow: 0px 0px 35px 0px rgba(0, 0, 0, 0.25);
    `}
`;

export default UserEllipseMenu;
