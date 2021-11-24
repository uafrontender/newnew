import React from 'react';
import styled from 'styled-components';

import Card from '../../molecules/Card';

interface IList {
  category: string;
  collection: any;
}

export const List: React.FC<IList> = (props) => {
  const {
    category,
    collection,
  } = props;

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={`${category}-${item.id}`}>
      <Card
        item={item}
        index={index + 1}
      />
    </SItemWrapper>
  );

  return (
    <SListWrapper>
      {collection.map(renderItem)}
    </SListWrapper>
  );
};

export default List;

const SListWrapper = styled.div`
  left: -16px;
  width: 100vw;
  cursor: grab;
  display: flex;
  padding: 8px 0 0 0;
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 24px 24px 0 24px;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }
`;

const SItemWrapper = styled.div`
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 16px;
  }
`;
