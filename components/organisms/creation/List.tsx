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

  ${(props) => props.theme.media.tablet} {
    left: -8px;
    width: calc(100% + 16px);
    position: relative;
    max-width: 768px;
    margin-top: 140px;
    flex-direction: row;
  }

  ${(props) => props.theme.media.laptop} {
    left: unset;
    margin: 164px auto 0 auto;
    flex-direction: row;
  }
`;

const SItemWrapper = styled.div`
  width: 100%;
  margin: 6px 0;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }

  ${(props) => props.theme.media.tablet} {
    margin: 0 16px;
  }
`;
