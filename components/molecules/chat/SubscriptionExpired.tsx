import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import {
  SBottomAction,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';

const SubscriptionExpired: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Chat');
  return (
    <SBottomActionContainer>
      <SBottomActionLeft>
        <SBottomActionIcon>🙊</SBottomActionIcon>
        <SBottomActionText>
          <SBottomActionTitle>
            {t('subscriptionExpired.title')}
          </SBottomActionTitle>
        </SBottomActionText>
      </SBottomActionLeft>
    </SBottomActionContainer>
  );
});

export default SubscriptionExpired;

const SBottomActionContainer = styled(SBottomAction)`
  margin-bottom: 16px;
`;
