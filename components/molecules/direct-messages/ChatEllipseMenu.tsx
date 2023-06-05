import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';
import Text from '../../atoms/Text';
import { Mixpanel } from '../../../utils/mixpanel';

interface IChatEllipseMenu {
  user: newnewapi.IVisavisUser;
  isVisible: boolean;
  handleClose: () => void;
  toggleUserBlock: () => Promise<void>;
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
  toggleUserBlock,
  onUserReport,
  isAnnouncement,
  user,
  myRole,
  anchorElement,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const toggleBlockUserHandler = useCallback(async () => {
    Mixpanel.track(
      userBlocked ? 'Unblock User Button Clicked' : 'Block User Button Clicked',
      {
        _stage: 'Direct Messages',
        _component: 'ChatEllipseMenu',
        _userUuid: user.user?.uuid,
      }
    );
    await toggleUserBlock();
    handleClose();
  }, [user.user?.uuid, userBlocked, toggleUserBlock, handleClose]);

  const reportUserHandler = () => {
    Mixpanel.track('Report Button Clicked', {
      _stage: 'Direct Messages',
      _component: 'ChatEllipseMenu',
      _userUuid: user.user?.uuid,
    });
    onUserReport();
    handleClose();
  };

  const viewUserProfile = () => {
    Mixpanel.track('View Profile Button Clicked', {
      _stage: 'Direct Messages',
      _component: 'ChatEllipseMenu',
      _target: `/${user.user?.username}`,
    });
    router.push(`/${user.user?.username}`);
  };

  return (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={handleClose}
      anchorElement={anchorElement}
      zIndex={21}
    >
      {myRole === newnewapi.ChatRoom.MyRole.CREATOR && !isAnnouncement && (
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
        <EllipseMenuButton onClick={toggleBlockUserHandler}>
          {userBlocked ? t('ellipse.unblockUser') : t('ellipse.blockUser')}
        </EllipseMenuButton>
      ) : (
        <EllipseMenuButton onClick={toggleBlockUserHandler}>
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
  background: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colors.white
      : theme.colorsThemed.background.tertiary};
`;
