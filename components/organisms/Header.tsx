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
  visible: boolean;
}

export const Header: React.FC<IHeader> = (props) => {
  const { visible } = props;
  const { banner } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppSelector((state) => state.ui);

  return (
    <SWrapper
      name="top-reload"
      visible={visible}
      withBanner={!!banner.show}
    >
      <Banner />
      <SContentWrapper>
        <Container noMaxContent>
          <Row>
            <Col>
              {['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode) && <Mobile />}
              {['tablet'].includes(resizeMode) && <Tablet />}
              {['laptop', 'laptopL', 'desktop'].includes(resizeMode) && <Desktop />}
            </Col>
          </Row>
        </Container>
      </SContentWrapper>
    </SWrapper>
  );
};

export default Header;

interface ISWrapper {
  name: string;
  visible: boolean;
  withBanner: boolean;
}

const SWrapper = styled.header<ISWrapper>`
  top: ${(props) => (props.visible ? `${props.withBanner ? 0 : '-40px'}` : '-96px')};
  left: 0;
  width: 100vw;
  z-index: 10;
  position: fixed;
  transition: top ease 0.5s;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundHeader};
`;

const SContentWrapper = styled.div`
  width: 100%;
  position: relative;

  ::before {
    width: 100%;
    height: 100%;
    content: '';
    z-index: -1;
    position: absolute;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;
