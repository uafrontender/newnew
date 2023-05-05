import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';

import 'react-loading-skeleton/dist/skeleton.css';

import HeroVisual from './components/HeroVisual';
import BaseLayout from './BaseLayout';
import { useAppState } from '../../contexts/appStateContext';

export interface ICreatorStripeLayout {
  hideProgressBar?: boolean;
  children: React.ReactNode;
}

const CreatorStripeLayout: React.FC<ICreatorStripeLayout> = ({
  hideProgressBar,
  children,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <SBaseLayout>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <HomeLogoButton />
        {isTablet && hideProgressBar ? (
          <SHomeLogoButton
            style={{
              display: 'block',
            }}
          >
            <Row>
              <Col>
                <SLogo />
              </Col>
            </Row>
          </SHomeLogoButton>
        ) : null}
        <SContentContainer>{children}</SContentContainer>
        {!isMobile && !isTablet && (
          <HeroVisualContainer>
            <HeroVisual />
          </HeroVisualContainer>
        )}
      </SkeletonTheme>
    </SBaseLayout>
  );
};

CreatorStripeLayout.defaultProps = {
  hideProgressBar: undefined,
};

export default CreatorStripeLayout;

const HomeLogoButton: React.FunctionComponent = () => (
  <SHomeLogoButton>
    <Row>
      <Col>
        <SLogo />
      </Col>
    </Row>
  </SHomeLogoButton>
);

const SBaseLayout = styled(BaseLayout)`
  overflow: hidden;
`;

const SHomeLogoButton = styled(Container)`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    margin: 12px 0px;
  }

  ${(props) => props.theme.media.laptop} {
    display: block;
    margin: 16px 0;
  }
`;

const SLogo = styled(Logo)`
  z-index: 1;
`;

const SContentContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  ${({ theme }) => theme.media.laptop} {
    width: 51%;
    padding-right: 32px;
    left: unset;
    right: 0;
  }

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const HeroVisualContainer = styled('div')`
  position: absolute;
  display: block;
  top: 100px;
  margin-right: 100px;
  right: 50%;
`;
