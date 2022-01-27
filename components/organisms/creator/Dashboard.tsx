import React from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../atoms/Headline';
import Earnings from '../../molecules/creator/dashboard/Earnings';
import Navigation from '../../molecules/creator/Navigation';
import DynamicSection from '../../molecules/creator/dashboard/DynamicSection';
import ExpirationPosts from '../../molecules/creator/dashboard/ExpirationPosts';
import SubscriptionStats from '../../molecules/creator/dashboard/SubscriptionStats';
import EnableSubscription from '../../molecules/creator/dashboard/EnableSubscription';

import { useAppSelector } from '../../../redux-store/store';

export const Dashboard = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('dashboard.title')}
          </STitle>
          {!isMobile && (
            <DynamicSection />
          )}
        </STitleBlock>
        <SBlock>
          <ExpirationPosts />
        </SBlock>
        <SBlock>
          <Earnings />
        </SBlock>
        <SBlock>
          <SubscriptionStats />
        </SBlock>
        <SBlock noMargin>
          <EnableSubscription />
        </SBlock>
      </SContent>
    </SContainer>
  );
};

export default Dashboard;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  min-height: calc(100vh - 120px);

  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(100vw - 320px);
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    margin-left: 224px;
    border-top-left-radius: 24px;
  }
`;

const STitle = styled(Headline)``;

interface ISBlock {
  noMargin?: boolean;
}

const SBlock = styled.section<ISBlock>`
  ${(props) => !props.noMargin && css`
    margin-bottom: 24px;
  `}
  ${(props) => props.theme.media.tablet} {
    min-width: 608px;
    max-width: 100%;
  }
  ${(props) => props.theme.media.laptopL} {
    max-width: calc(100% - 464px);
  }
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;
