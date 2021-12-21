import React, { useCallback } from 'react';
import styled from 'styled-components';

import ListItem from '../../molecules/creation/ListItem';

interface IList {
  collection: object[];
}

export const List: React.FC<IList> = (props) => {
  const { collection } = props;

  const renderItem = useCallback((item) => (
    <SItemWrapper key={`creation-item-${item.key}`}>
      <ListItem
        item={item}
      />
    </SItemWrapper>
  ), []);

  return (
    <SList>
      {collection.map(renderItem)}
    </SList>
  );
};

export default List;

const SList = styled.div`
  gap: 12px;
  display: flex;
  margin-top: 40px;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  ${(props) => props.theme.media.tablet} {
    gap: 16px;
    margin: 140px auto 0 auto;
    position: relative;
    max-width: 768px;
    flex-direction: row;
  }

  ${(props) => props.theme.media.laptop} {
    gap: 32px;
    margin: 152px auto 0 auto;
  }
`;

const SItemWrapper = styled.div`
  width: 100%;
`;
