import React from 'react';
import styled from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Mobile from '../molecules/header/Mobile';
import Tablet from '../molecules/header/Tablet';
import Banner from '../molecules/Banner';
import Desktop from '../molecules/header/Desktop';
import Container from '../atoms/Grid/Container';

import { useAppSelector } from '../../redux-store/store';

interface IHeader {
}

export const Header: React.FC<IHeader> = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);

  return (
    <SWrapper name="top-reload">
      <Banner />
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

interface ISWrapper {
  name: string;
}

const SWrapper = styled.header<ISWrapper>`
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 10;
  position: fixed;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.background1};
`;
