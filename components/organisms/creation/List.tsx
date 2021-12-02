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
  display: flex;
  margin-top: 34px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

const SItemWrapper = styled.div`
  margin: 6px 0;
`;
