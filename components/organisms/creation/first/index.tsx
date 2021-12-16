import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import List from '../List';
import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';

export const CreationFirstStepContent = () => {
  const { t } = useTranslation('creation');

  const collection = useMemo(() => [
    {
      key: 'auction',
    },
    {
      key: 'multiple-choice',
    },
    {
      key: 'crowdfunding',
    },
  ], []);

  return (
    <SContent>
      <STitle variant={4}>
        {t('first-step-title')}
      </STitle>
      <SSubTitle variant={2} weight={600}>
        {t('first-step-sub-title')}
      </SSubTitle>
      <List
        collection={collection}
      />
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

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 8px;
  text-align: center;

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
  }
`;
