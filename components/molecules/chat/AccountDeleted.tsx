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

const AccountDeleted: React.FC = React.memo(() => {
  const { t } = useTranslation('chat');

  return (
    <SBottomAction>
      <SBottomActionLeft>
        <SBottomActionIcon>😞</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>{t('account-deleted.title')}</SBottomActionTitle>
          <SBottomActionMessage>
            {t('account-deleted.message')}
          </SBottomActionMessage>
        </SBottomActionText>
      </SBottomActionLeft>
      <SBottomActionButton
        withDim
        withShrink
        view='quaternary'
        onClick={() => {
          console.log('Delete chat');
        }}
      >
        {t('account-deleted.button-text')}
      </SBottomActionButton>
    </SBottomAction>
  );
});

export default AccountDeleted;
