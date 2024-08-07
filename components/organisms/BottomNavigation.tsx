import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';

import BottomNavigationItem, {
  TBottomNavigationItem,
} from '../molecules/BottomNavigationItem';
import MoreMenuMobile from './MoreMenuMobile';
import { useAppState } from '../../contexts/appStateContext';

interface IBottomNavigation {
  visible: boolean;
  moreMenuMobileOpen: boolean;
  handleCloseMobileMenu: () => void;
  collection: TBottomNavigationItem[];
}

export const BottomNavigation: React.FC<IBottomNavigation> = (props) => {
  const { visible, collection, moreMenuMobileOpen, handleCloseMobileMenu } =
    props;

  const { userIsCreator } = useAppState();

  const renderItem = useCallback(
    (item: TBottomNavigationItem) => (
      <BottomNavigationItem
        key={item.key}
        item={item}
        width={`${100 / collection.length}%`}
      />
    ),
    [collection.length]
  );

  useEffect(
    () => {
      if (!visible) {
        handleCloseMobileMenu();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      visible,
      // handleCloseMobileMenu, - reason unknown
    ]
  );

  return (
    <SContainer
      id='bottom-nav-mobile'
      visible={visible}
      isCreator={userIsCreator}
    >
      {collection?.map(renderItem)}
      <MoreMenuMobile
        isVisible={moreMenuMobileOpen}
        handleClose={handleCloseMobileMenu}
      />
    </SContainer>
  );
};

export default BottomNavigation;

interface ISContainer {
  visible: boolean;
  isCreator: boolean;
}

// NOTE: -1px needed to fix mobile Safari issue with transparent line under navigation bar
const SContainer = styled.nav<ISContainer>`
  position: fixed;
  left: 0;
  width: 100vw;
  bottom: -1px;
  z-index: 10;
  padding: 0 2px;
  display: flex;
  transition: transform ease 0.5s;
  align-items: center;
  justify-content: ${({ isCreator }) =>
    isCreator ? 'space-around' : 'center'};
  background-color: ${(props) => props.theme.colorsThemed.background.primary};

  transform: ${(props) =>
    props.visible ? 'translate3d(0, -1px, 0)' : 'translate3d(0, 60px, 0)'};

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;
