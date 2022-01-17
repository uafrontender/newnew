import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

export interface ICreatorOnboardingLayout {

}

const SCreatorOnboardingLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
`;

const CreatorOnboardingLayout: React.FunctionComponent<ICreatorOnboardingLayout> = ({
  children,
}) => {
  const theme = useTheme();

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SCreatorOnboardingLayout>
          <HomeLogoButton />
          {children}
        </SCreatorOnboardingLayout>
      </SkeletonTheme>
    </ErrorBoundary>
  );
};

export default CreatorOnboardingLayout;

const HomeLogoButton: React.FunctionComponent = () => (
  <SHomeLogoButton>
    <Row>
      <Col>
        <Logo />
      </Col>
    </Row>
  </SHomeLogoButton>
);

const SHomeLogoButton = styled(Container)`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;

    position: relative;
    margin: 12px 0px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 16px 0;
  }
`;
