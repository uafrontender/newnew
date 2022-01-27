import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../atoms/Headline';
import Navigation from '../../molecules/creator/Navigation';

import { useAppSelector } from '../../../redux-store/store';

export const GetPaid = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('getPaid.title')}
          </STitle>
        </STitleBlock>
      </SContent>
    </SContainer>
  );
};

export default GetPaid;

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

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;
