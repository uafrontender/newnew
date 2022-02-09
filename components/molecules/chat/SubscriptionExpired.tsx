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

interface ISubscriptionExpired {
  userName: string;
}

const SubscriptionExpired: React.FC<ISubscriptionExpired> = ({ userName }) => {
  const { t } = useTranslation('chat');

  return (
    <SBottomAction>
      <SBottomActionLeft>
        <SBottomActionIcon>🤐</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>{t('subscription-expired.title')}</SBottomActionTitle>
          <SBottomActionMessage>
            {t('subscription-expired.message-first-part')} {userName} {t('subscription-expired.message-second-part')}
          </SBottomActionMessage>
        </SBottomActionText>
      </SBottomActionLeft>
      <SBottomActionButton
        withDim
        withShrink
        view="primaryGrad"
        onClick={() => {
          console.log('Renew subscription');
        }}
      >
        {t('subscription-expired.button-text')}
      </SBottomActionButton>
    </SBottomAction>
  );
};

export default SubscriptionExpired;
