/* eslint-disable no-unused-expressions */
import React, { useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useEffectOnce } from 'react-use';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Mobile from '../molecules/header/Mobile';
import Tablet from '../molecules/header/Tablet';
import Banner from '../molecules/Banner';
import Desktop from '../molecules/header/Desktop';
import Container from '../atoms/Grid/Container';

import { useAppSelector } from '../../redux-store/store';
import useHasMounted from '../../utils/hooks/useHasMounted';
import { getMyBundleEarnings } from '../../api/endpoints/bundles';
import { loadStateLS, saveStateLS } from '../../utils/localStorage';

interface IHeader {
  visible: boolean;
}

export const Header: React.FC<IHeader> = React.memo((props) => {
  const { visible } = props;
  const { banner, resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet', 'laptop'].includes(resizeMode);
  const isDesktop = ['laptopM', 'laptopL', 'desktop'].includes(resizeMode);
  const [hasSoldBundles, setHasSoldBundles] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);

  useEffectOnce(() => {
    // if creator did not sell any bundle we should
    // hide navigation link to direct messages
    async function fetchMyBundlesEarnings() {
      try {
        const payload = new newnewapi.GetMyBundleEarningsRequest();
        const res = await getMyBundleEarnings(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data.totalBundleEarnings?.usdCents) {
          setHasSoldBundles(true);
          saveStateLS('creatorHasSoldBundles', true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    const localHasSoldBundles = loadStateLS('creatorHasSoldBundles') as boolean;
    if (localHasSoldBundles) {
      setHasSoldBundles(true);
      // TODO: should we show it only for creators who added a bank account?
    } else if (user.userData?.options?.creatorStatus === 2) {
      fetchMyBundlesEarnings();
    }
  });

  const hasMounted = useHasMounted();

  if (!hasMounted) return null;

  return (
    <SWrapper
      name='top-reload'
      id='top-nav-header'
      visible={visible}
      withBanner={!!banner.show}
    >
      <Banner />
      <SContentWrapper id='top-nav-header-wrapper'>
        <Container noMaxContent>
          <Row>
            <Col>
              {isMobile && <Mobile />}
              {isTablet && <Tablet hasSoldBundles={hasSoldBundles} />}
              {isDesktop && <Desktop hasSoldBundles={hasSoldBundles} />}
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

const SWrapper = styled.header<ISWrapper>`
  top: ${(props) =>
    props.visible ? `${props.withBanner ? 0 : '-40px'}` : '-96px'};
  left: 0;
  width: 100vw;
  z-index: 10;
  position: fixed;
  transition: top ease 0.5s;
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
