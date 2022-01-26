import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../atoms/Headline';
import Earnings from '../../molecules/creator/dashboard/Earnings';
import Navigation from '../../molecules/creator/dashboard/Navigation';
import DynamicSection from '../../molecules/creator/dashboard/DynamicSection';
import ExpirationPosts from '../../molecules/creator/dashboard/ExpirationPosts';
import SubscriptionStats from '../../molecules/creator/dashboard/SubscriptionStats';
import EnableSubscription from '../../molecules/creator/dashboard/EnableSubscription';

import { useAppSelector } from '../../../redux-store/store';

export const Dashboard = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <SBlock>
          <STitle variant={4}>
            {t('dashboard.title')}
          </STitle>
          {isTablet && <DynamicSection />}
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
      </SContent>
    </SContainer>
  );
};

export default Dashboard;

const SContainer = styled.div`
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SContent = styled.div`
  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-left: 224px;
  }
`;

const STitle = styled(Headline)``;

const SBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;
