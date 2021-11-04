import React from 'react';
import styled from 'styled-components';

import Mobile from '../molecules/header/Mobile';
import Tablet from '../molecules/header/Tablet';
import Desktop from '../molecules/header/Desktop';

import { useAppSelector } from '../../redux-store/store';

interface IHeader {
}

export const Header: React.FC<IHeader> = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);

  return (
    <SContainer>
      <SContent>
        {['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode) && <Mobile />}
        {['tablet'].includes(resizeMode) && <Tablet />}
        {['laptop', 'laptopL', 'desktop'].includes(resizeMode) && <Desktop />}
      </SContent>
    </SContainer>
  );
};

export default Header;

const SContainer = styled.header`
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 1;
  position: fixed;
  background-color: ${(props) => props.theme.colorsThemed.navigationBgColor};
`;

const SContent = styled.div`
  margin: auto;
  max-width: ${(props) => props.theme.width.maxContentWidth};
`;
