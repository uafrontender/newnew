import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';
import Text from '../../atoms/Text';

interface IChatEllipseMenu {
  user: newnewapi.IUser;
  isVisible: boolean;
  handleClose: () => void;
  onUserBlock: () => void;
  onUserReport: () => void;
  userBlocked?: boolean;
  isAnnouncement?: boolean;
  myRole: newnewapi.ChatRoom.MyRole;
  anchorElement?: HTMLElement;
}

const ChatEllipseMenu: React.FC<IChatEllipseMenu> = ({
  isVisible,
  handleClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  isAnnouncement,
  user,
  myRole,
  anchorElement,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const blockUserHandler = () => {
    onUserBlock();
    handleClose();
  };

  const reportUserHandler = () => {
    onUserReport();
    handleClose();
  };

  const viewUserProfile = () => {
    router.push(`/${user.username}`);
  };

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
    >
      {myRole === 2 && !isAnnouncement && (
        <EllipseMenuButton onClick={viewUserProfile}>
          <Text variant={2}>{t('ellipse.view')}</Text>
        </EllipseMenuButton>
      )}
      <EllipseMenuButton onClick={reportUserHandler}>
        <Text variant={2} tone='error'>
          {!isAnnouncement ? t('ellipse.reportUser') : t('ellipse.reportGroup')}
        </Text>
      </EllipseMenuButton>
      {!isAnnouncement ? (
        <EllipseMenuButton onClick={blockUserHandler}>
          {userBlocked ? t('ellipse.unblockUser') : t('ellipse.blockUser')}
        </EllipseMenuButton>
      ) : (
        <EllipseMenuButton onClick={blockUserHandler}>
          {userBlocked ? t('ellipse.unblockGroup') : t('ellipse.blockGroup')}
        </EllipseMenuButton>
      )}
    </SEllipseMenu>
  );
};

ChatEllipseMenu.defaultProps = {
  userBlocked: false,
  isAnnouncement: false,
};

export default ChatEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 216px;
`;
