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
    const { t } = useTranslation('page-Chat');
    return (
      <SBottomAction>
        <SBottomActionLeft>
          <SBottomActionIcon>🙊</SBottomActionIcon>
          <SBottomActionText>
            <SBottomActionTitle>
              {t('messagingDisabled.title')}
            </SBottomActionTitle>
            <SBottomActionMessage>
              {user.username ? user.username : user.nickname}{' '}
              {t('messagingDisabled.message')}
            </SBottomActionMessage>
          </SBottomActionText>
        </SBottomActionLeft>
      </SBottomAction>
    );
  }
);

export default MessagingDisabled;
