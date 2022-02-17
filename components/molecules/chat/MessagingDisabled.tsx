import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  SBottomAction,
  SBottomActionButton,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';

interface IMessagingDisabled {
  userName: string;
  userAlias: string;
}

const MessagingDisabled: React.FC<IMessagingDisabled> = ({ userName, userAlias }) => {
  const { t } = useTranslation('chat');
  const router = useRouter();

  return (
    <SBottomAction>
      <SBottomActionLeft>
        <SBottomActionIcon>🙊</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>{t('messaging-disabled.title')}</SBottomActionTitle>
          <SBottomActionMessage>
            {userName} {t('messaging-disabled.message')}
          </SBottomActionMessage>
        </SBottomActionText>
      </SBottomActionLeft>
      <SBottomActionButton
        withDim
        withShadow
        withShrink
        view="primaryGrad"
        onClick={() => {
          router.push(`/u/${userAlias}`);
        }}
      >
        {t('messaging-disabled.button-text')}
      </SBottomActionButton>
    </SBottomAction>
  );
};

export default MessagingDisabled;
