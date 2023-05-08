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
} from '../../atoms/direct-messages/styles';
import DisplayName from '../../atoms/DisplayName';

interface IMessagingDisabled {
  user: newnewapi.IUser;
  variant?: 'primary' | 'secondary';
}

const MessagingDisabled: React.FC<IMessagingDisabled> = React.memo(
  ({ user, variant }) => {
    const { t } = useTranslation('page-Chat');
    return (
      <SBottomAction variant={variant}>
        <SBottomActionLeft>
          <SBottomActionIcon>🙊</SBottomActionIcon>
          <SBottomActionText>
            <SBottomActionTitle>
              {t('messagingDisabled.title')}
            </SBottomActionTitle>
            <SBottomActionMessage>
              <DisplayName user={user} /> {`${t('messagingDisabled.message')}`}
            </SBottomActionMessage>
          </SBottomActionText>
        </SBottomActionLeft>
      </SBottomAction>
    );
  }
);

export default MessagingDisabled;
