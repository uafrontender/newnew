import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Headline from '../../atoms/Headline';

interface ITopSection {
  collection: {}[],
}

export const TopSection: React.FC<ITopSection> = (props) => {
  const { collection } = props;
  const { t } = useTranslation('home');
  const country = 'USA';

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={item.id}>
      <Card type="inside" item={item} index={index + 1} />
    </SItemWrapper>
  );

  return (
    <SWrapper>
      <Headline variant={4}>
        {t('top-block-title', { country })}
      </Headline>
      <SListWrapper>
        {collection.map(renderItem)}
      </SListWrapper>
    </SWrapper>
  );
};

export default TopSection;

const SWrapper = styled.section`
  padding: 0 0 48px 0;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;

const SListWrapper = styled.div`
  left: -16px;
  width: 100vw;
  display: flex;
  padding: 0 8px;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 24px;

  ::-webkit-scrollbar {
    display: none;
  }

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 0 16px;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 0;
    margin-top: 32px;
  }
`;

const SItemWrapper = styled.div`
  margin: 0 8px;

  ${(props) => props.theme.media.tablet} {
    margin: 0 12px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 20px;
  }
`;
