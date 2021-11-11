import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Headline from '../../atoms/Headline';

export const TopSection = () => {
  const { t } = useTranslation('home');
  const country = 'USA';

  return (
    <SWrapper>
      <Headline variant={4}>
        {t('top-block-title', { country })}
      </Headline>
      <SListWrapper>
        List
      </SListWrapper>
    </SWrapper>
  );
};

export default TopSection;

const SWrapper = styled.section`

`;

const SListWrapper = styled.div`
  margin-top: 24px;

  ${(props) => props.theme.media.laptop} {
    margin-top: 32px;
  }
`;
