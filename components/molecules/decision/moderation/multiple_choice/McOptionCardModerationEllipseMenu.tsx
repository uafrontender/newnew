import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { checkCanDeleteMcOption } from '../../../../../api/endpoints/multiple_choice';

import EllipseMenu, { EllipseMenuButton } from '../../../../atoms/EllipseMenu';

interface IMcOptionCardModerationEllipseMenu {
  isVisible: boolean;
  isBySubscriber: boolean;
  optionId: number;
  isUserBlocked: boolean;

  canDeleteOptionInitial: boolean;
  handleClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
  handleUnblockUser: () => void;

  anchorElement?: HTMLElement;
}

const McOptionCardModerationEllipseMenu: React.FunctionComponent<
  IMcOptionCardModerationEllipseMenu
> = ({
  isVisible,
  isBySubscriber,
  optionId,
  isUserBlocked,
  canDeleteOptionInitial,
  handleClose,
  handleOpenReportOptionModal,
  handleOpenBlockUserModal,
  handleOpenRemoveOptionModal,
  handleUnblockUser,
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
        const payload = new newnewapi.CanDeleteMcOptionRequest({
          optionId,
        });

        const res = await checkCanDeleteMcOption(payload);

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
              if (isUserBlocked) {
                handleUnblockUser();
                return;
              }
              handleOpenBlockUserModal();
              handleClose();
            }}
          >
            {!isUserBlocked ? t('ellipse.blockUser') : t('ellipse.unblockUser')}
          </EllipseMenuButton>
        </>
      ) : null}
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
