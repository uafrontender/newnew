import React, { useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';

import BottomNavigationItem, {
  TBottomNavigationItem,
} from '../molecules/BottomNavigationItem';
import MoreMenuMobile from './MoreMenuMobile';
import { useAppState } from '../../contexts/appStateContext';
import isIOS from '../../utils/isIOS';

interface IBottomNavigation {
  visible: boolean;
  moreMenuMobileOpen: boolean;
  reachedPageEnd: boolean;
  handleCloseMobileMenu: () => void;
  collection: TBottomNavigationItem[];
}

export const BottomNavigation: React.FC<IBottomNavigation> = (props) => {
  const {
    visible,
    collection,
    moreMenuMobileOpen,
    reachedPageEnd,
    handleCloseMobileMenu,
  } = props;

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
      isIOSDevice={isIOS()}
      reachedPageEnd={reachedPageEnd}
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
  isIOSDevice: boolean;
  reachedPageEnd: boolean;
}

// NOTE: 'transform: translateZ(0);' and '-1px' needed to fix mobile Safari issue with transparent line under navigation bar
const SContainer = styled.nav<ISContainer>`
  ${({ isIOSDevice, reachedPageEnd }) =>
    isIOSDevice
      ? css`
          position: sticky;
          position: -webkit-sticky; /* Safari */
          opacity: ${() => (reachedPageEnd ? 0 : 1)};
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
