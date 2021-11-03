import React, { useCallback } from 'react';
import styled from 'styled-components';

import Item, { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IBottomNavigation {
  collection: TBottomNavigationItem[];
}

export const BottomNavigation: React.FC<IBottomNavigation> = (props) => {
  const { collection } = props;

  const renderItem = useCallback((item) => (
    <Item
      key={item.key}
      item={item}
    />
  ), []);

  return (
    <SContainer>
      {collection.map(renderItem)}
    </SContainer>
  );
};

export default BottomNavigation;

const SContainer = styled.nav`
  left: 0;
  width: 100vw;
  bottom: 0;
  padding: 0 2px;
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: space-around;
  background-color: ${(props) => props.theme.colorsThemed.navigationBgColor};
`;
