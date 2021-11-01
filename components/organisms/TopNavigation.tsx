import React from 'react';
import styled from 'styled-components';

import MobileTopNavigation from '../molecules/MobileTopNavigation';
import TabletTopNavigation from '../molecules/TabletTopNavigation';
import DesktopTopNavigation from '../molecules/DesktopTopNavigation';

import { useAppSelector } from '../../redux-store/store';

interface ITopNavigation {
}

export const TopNavigation: React.FC<ITopNavigation> = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);

  return (
    <SContainer>
      {['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode) && <MobileTopNavigation />}
      {['tablet'].includes(resizeMode) && <TabletTopNavigation />}
      {['laptop', 'laptopL', 'desktop'].includes(resizeMode) && <DesktopTopNavigation />}
    </SContainer>
  );
};

export default TopNavigation;

const SContainer = styled.nav`
  top: 0;
  left: 0;
  width: 100vw;
  position: fixed;
  background-color: ${(props) => props.theme.colorsThemed.navigationBgColor};
`;
