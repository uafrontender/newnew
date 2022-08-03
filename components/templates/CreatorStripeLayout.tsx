import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

import { useAppSelector } from '../../redux-store/store';
import HeroVisual from './HeroVisual';

export interface ICreatorStripeLayout {
  hideProgressBar?: boolean;
  children: React.ReactNode;
}

const SCreatorStripeLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
  overflow: hidden;

  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
  }
`;

const CreatorStripeLayout: React.FC<ICreatorStripeLayout> = ({
  hideProgressBar,
  children,
}) => {
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SCreatorStripeLayout>
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
        </SCreatorStripeLayout>
      </SkeletonTheme>
    </ErrorBoundary>
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
    width: 50%;
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
