import React, { useCallback } from 'react';
import styled from 'styled-components';

import Item, { TBottomNavigationItem } from '../molecules/BottomNavigationItem';

interface IBottomNavigation {
  visible: boolean;
  collection: TBottomNavigationItem[];
}

export const BottomNavigation: React.FC<IBottomNavigation> = (props) => {
  const { visible, collection } = props;

  const renderItem = useCallback((item) => (
    <Item
      key={item.key}
      item={item}
    />
  ), []);

  return (
    <SContainer id="bottom-nav-mobile" visible={visible}>
      {collection?.map(renderItem)}
    </SContainer>
  );
};

export default BottomNavigation;

interface ISContainer {
  visible: boolean;
}

const SContainer = styled.nav<ISContainer>`
  left: 0;
  width: 100vw;
  bottom: ${(props) => (props.visible ? 0 : '-60px')};
  z-index: 10;
  padding: 0 2px;
  display: flex;
  position: fixed;
  transition: bottom ease 0.5s;
  align-items: center;
  justify-content: space-around;
  background-color: ${(props) => props.theme.colorsThemed.background.primary};
`;
