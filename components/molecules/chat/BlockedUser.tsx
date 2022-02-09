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
  userName: string;
}

const BlockedUser: React.FC<IBlockedUser> = ({ onUserBlock, isBlocked, confirmBlockUser, userName, closeModal }) => {
  const { t } = useTranslation('chat');

  return (
    <>
      {isBlocked && (
        <SBottomAction>
          <SBottomActionLeft>
            <SBottomActionIcon>🤐</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>{t('user-blocked.title')}</SBottomActionTitle>
              <SBottomActionMessage>{t('user-blocked.message')}</SBottomActionMessage>
            </SBottomActionText>
          </SBottomActionLeft>
          <SBottomActionButton withDim withShrink view="quaternary" onClick={onUserBlock}>
            {t('user-blocked.button-text')}
          </SBottomActionButton>
        </SBottomAction>
      )}
      <BlockUserModal
        confirmBlockUser={confirmBlockUser}
        onUserBlock={onUserBlock}
        userName={userName}
        closeModal={closeModal}
      />
    </>
  );
};

export default BlockedUser;

BlockedUser.defaultProps = {
  isBlocked: false,
};
