import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  SBottomAction,
  SBottomActionButton,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';
import BlockUserModal from './BlockUserModal';

interface IBlockedUser {
  onUserBlock: () => void;
  closeModal: () => void;
  confirmBlockUser: boolean;
  isBlocked?: boolean;
  isAnnouncement?: boolean;
  userName: string;
}

const BlockedUser: React.FC<IBlockedUser> = ({
  onUserBlock,
  isBlocked,
  confirmBlockUser,
  userName,
  closeModal,
  isAnnouncement,
}) => {
  const { t } = useTranslation('chat');

  return (
    <>
      {isBlocked && (
        <SBottomAction>
          <SBottomActionLeft>
            <SBottomActionIcon>🤐</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>
                {isAnnouncement ? t('group-blocked.title') : t('user-blocked.title')}
              </SBottomActionTitle>
              <SBottomActionMessage>
                {isAnnouncement ? t('group-blocked.message') : t('user-blocked.message')}
              </SBottomActionMessage>
            </SBottomActionText>
          </SBottomActionLeft>
          <SBottomActionButton withDim withShrink view="quaternary" onClick={onUserBlock}>
            {isAnnouncement ? t('group-blocked.button-text') : t('user-blocked.button-text')}
          </SBottomActionButton>
        </SBottomAction>
      )}
      <BlockUserModal
        confirmBlockUser={confirmBlockUser}
        onUserBlock={onUserBlock}
        userName={userName}
        closeModal={closeModal}
        isAnnouncement={isAnnouncement}
      />
    </>
  );
};

export default BlockedUser;

BlockedUser.defaultProps = {
  isBlocked: false,
  isAnnouncement: false,
};
