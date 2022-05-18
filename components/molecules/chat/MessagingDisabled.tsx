import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import {
  SBottomAction,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';

interface IMessagingDisabled {
  user: newnewapi.IUser;
}

const MessagingDisabled: React.FC<IMessagingDisabled> = React.memo(
  ({ user }) => {
    const { t } = useTranslation('chat');
    return (
      <SBottomAction>
        <SBottomActionLeft>
          <SBottomActionIcon>🙊</SBottomActionIcon>
          <SBottomActionText>
            <SBottomActionTitle>
              {t('messaging-disabled.title')}
            </SBottomActionTitle>
            <SBottomActionMessage>
              {user.username ? user.username : user.nickname}{' '}
              {t('messaging-disabled.message')}
            </SBottomActionMessage>
          </SBottomActionText>
        </SBottomActionLeft>
      </SBottomAction>
    );
  }
);

export default MessagingDisabled;
