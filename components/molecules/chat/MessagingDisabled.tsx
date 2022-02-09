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

const MessagingDisabled: React.FC = () => {
  const { t } = useTranslation('chat');

  return (
    <SBottomAction>
      <SBottomActionLeft>
        <SBottomActionIcon>🤐</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>{t('messaging-disabled.title')}</SBottomActionTitle>
          <SBottomActionMessage>{t('messaging-disabled.message')}</SBottomActionMessage>
        </SBottomActionText>
      </SBottomActionLeft>
      <SBottomActionButton
        withDim
        withShadow
        withShrink
        view="primaryGrad"
        onClick={() => {
          console.log('Check user’s profile');
        }}
      >
        {t('messaging-disabled.button-text')}
      </SBottomActionButton>
    </SBottomAction>
  );
};

export default MessagingDisabled;
