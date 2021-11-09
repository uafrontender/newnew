import React from 'react';
import styled from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Mobile from '../molecules/header/Mobile';
import Tablet from '../molecules/header/Tablet';
import Desktop from '../molecules/header/Desktop';
import Container from '../atoms/Grid/Container';

import { useAppSelector } from '../../redux-store/store';

interface IHeader {
}

export const Header: React.FC<IHeader> = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);

  return (
    <SWrapper>
      <Container>
        <Row>
          <Col>
            {['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode) && <Mobile />}
            {['tablet'].includes(resizeMode) && <Tablet />}
            {['laptop', 'laptopL', 'desktop'].includes(resizeMode) && <Desktop />}
          </Col>
        </Row>
      </Container>
    </SWrapper>
  );
};

export default Header;

const SWrapper = styled.header`
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 1;
  position: fixed;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.background1};
`;
