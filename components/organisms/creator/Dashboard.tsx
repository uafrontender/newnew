import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../atoms/Headline';
import Earnings from '../../molecules/creator/dashboard/Earnings';
import ExpirationPosts from '../../molecules/creator/dashboard/ExpirationPosts';
import SubscriptionStats from '../../molecules/creator/dashboard/SubscriptionStats';
import EnableSubscription from '../../molecules/creator/dashboard/EnableSubscription';

export const Dashboard = () => {
  const { t } = useTranslation('creator');

  return (
    <SContainer>
      <SBlock>
        <STitle variant={4}>
          {t('dashboard.title')}
        </STitle>
      </SBlock>
      <SBlock>
        <ExpirationPosts />
      </SBlock>
      <SBlock>
        <Earnings />
      </SBlock>
      <SBlock>
        <SubscriptionStats />
      </SBlock>
      <EnableSubscription />
    </SContainer>
  );
};

export default Dashboard;

const SContainer = styled.div`
  margin-top: -16px;
`;

const STitle = styled(Headline)``;

const SBlock = styled.section`
  margin-bottom: 24px;
`;
