import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import List from '../List';
import Headline from '../../../atoms/Headline';

export const CreationFirstStepContent = () => {
  const { t } = useTranslation('page-Creation');

  const collection = useMemo(
    () => [
      {
        key: 'auction',
      },
      {
        key: 'multiple-choice',
      },
      // {
      //   key: 'crowdfunding',
      // },
    ],
    []
  );

  return (
    <SContent>
      <STitle variant={4}>{t('first-step-title')}</STitle>
      <List collection={collection} />
    </SContent>
  );
};

export default CreationFirstStepContent;

const SContent = styled.div`
  ${(props) => props.theme.media.tablet} {
    height: calc(100% - 72px);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  ${(props) => props.theme.media.laptop} {
    height: calc(100% - 80px);
  }
`;

const STitle = styled(Headline)`
  padding: 0 35px;
  margin-top: 20px;
  text-align: center;
  font-weight: 600;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;
