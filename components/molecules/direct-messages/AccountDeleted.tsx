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
} from '../../atoms/direct-messages/styles';

interface IAccountDeleted {
  variant?: 'primary' | 'secondary';
}
const AccountDeleted: React.FC<IAccountDeleted> = React.memo(({ variant }) => {
  const { t } = useTranslation('page-Chat');

  return (
    <SBottomAction variant={variant}>
      <SBottomActionLeft>
        <SBottomActionIcon>😞</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>{t('accountDeleted.title')}</SBottomActionTitle>
          <SBottomActionMessage>
            {t('accountDeleted.message')}
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
        {t('accountDeleted.buttonText')}
      </SBottomActionButton>
    </SBottomAction>
  );
});

export default AccountDeleted;
