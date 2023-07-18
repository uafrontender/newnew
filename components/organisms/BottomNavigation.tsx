import React, { useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';

import BottomNavigationItem, {
  TBottomNavigationItem,
} from '../molecules/BottomNavigationItem';
import MoreMenuMobile from './MoreMenuMobile';
import { useAppState } from '../../contexts/appStateContext';
import { useUiState } from '../../contexts/uiStateContext';

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
  const { isMobileSafari } = useUiState();

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
      isMobileSafari={isMobileSafari}
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
  isMobileSafari: boolean;
}

// NOTE: 'transform: translateZ(0);' and '-1px' needed to fix mobile Safari issue with transparent line under navigation bar
const SContainer = styled.nav<ISContainer>`
  ${({ isMobileSafari }) =>
    isMobileSafari
      ? css`
          position: sticky;
          position: -webkit-sticky; /* Safari */
        `
      : css`
          position: fixed;
          display: flex;
        `}

  left: 0;
  width: 100vw;
  bottom: ${(props) => (props.visible ? '-1px' : '-60px')};
  z-index: 10;
  padding: 0 2px;
  display: flex;
  transition: bottom ease 0.5s;
  align-items: center;
  justify-content: ${({ isCreator }) =>
    isCreator ? 'space-around' : 'center'};
  background-color: ${(props) => props.theme.colorsThemed.background.primary};

  transform: translateZ(0);
`;
