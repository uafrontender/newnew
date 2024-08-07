import React, { useRef } from 'react';
import styled from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Mobile from '../molecules/header/Mobile';
import Tablet from '../molecules/header/Tablet';
import Banner from '../molecules/Banner';
import Desktop from '../molecules/header/Desktop';
import Container from '../atoms/Grid/Container';

import { useAppState } from '../../contexts/appStateContext';
import { useUiState } from '../../contexts/uiStateContext';

interface IHeader {
  visible: boolean;
}

export const Header: React.FC<IHeader> = React.memo((props) => {
  const { visible } = props;
  const { banner } = useUiState();
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isTabletOrSmallDesktop = ['tablet', 'laptop'].includes(resizeMode);
  const isDesktop = ['laptopM', 'laptopL', 'desktop'].includes(resizeMode);

  const headerRef = useRef(null);

  return (
    <SWrapper
      name='top-reload'
      id='top-nav-header'
      visible={visible}
      withBanner={!!banner.show}
      ref={headerRef}
    >
      <Banner />
      <SContentWrapper id='top-nav-header-wrapper'>
        <Container wideContainer>
          <Row>
            <Col>
              {isMobile && <Mobile />}
              {isTabletOrSmallDesktop && <Tablet />}
              {isDesktop && <Desktop />}
            </Col>
          </Row>
        </Container>
      </SContentWrapper>
    </SWrapper>
  );
});

export default Header;

interface ISWrapper {
  name: string;
  visible: boolean;
  withBanner: boolean;
}

// NOTE: 'transform: translateZ(0);' and '-41px' needed to fix mobile Safari issue with transparent line above header
const SWrapper = styled.header<ISWrapper>`
  position: sticky;
  position: -webkit-sticky; /* Safari */

  top: 0;
  transform: ${(props) =>
    props.visible
      ? `${props.withBanner ? 0 : 'translate3d(0, -41px, 0)'}`
      : 'translate3d(0, -96px, 0)'};
  margin-top: ${({ withBanner }) => `${withBanner ? 0 : '-41px'}`};

  left: 0;
  width: 100vw;
  z-index: 11;

  transition: all ease 0.5s;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundHeader};
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
    background-color: ${(props) =>
      props.theme.colorsThemed.background.backgroundHeader};
    opacity: ${({ theme }) => (theme.name === 'dark' ? 0.7 : 1)};
  }
`;
