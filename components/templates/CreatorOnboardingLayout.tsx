import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

import OnboardingProgressBar from '../molecules/creator-onboarding/OnboardingProgressBar';

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
  const router = useRouter();

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SCreatorOnboardingLayout>
          <HomeLogoButton />
          <SContentContainer>
            <OnboardingProgressBar
              numStages={2}
              currentStage={router.pathname.includes('creator-onboarding-stage-1') ? 1 : 2}
            />
            {children}
          </SContentContainer>
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

const SContentContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  ${({ theme }) => theme.media.laptop} {
    width: 706px;
    left: unset;
    right: 0;
  }
`;
