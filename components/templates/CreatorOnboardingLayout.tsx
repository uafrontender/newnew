import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';

import 'react-loading-skeleton/dist/skeleton.css';

import OnboardingMobileHeader from '../molecules/creator-onboarding/OnboardingMobileHeader';
import { useAppSelector } from '../../redux-store/store';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';
import HeroVisual from './components/HeroVisual';
import BaseLayout from './BaseLayout';

export interface ICreatorOnboardingLayout {
  hideOnboardingHeader?: boolean;
  children: React.ReactNode;
}

const CreatorOnboardingLayout: React.FunctionComponent<
  ICreatorOnboardingLayout
> = ({ hideOnboardingHeader, children }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('page-CreatorOnboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const SideTextSwitch = (): 'stripeSection' | 'detailsSection' => {
    if (router.pathname.includes('creator-onboarding-stripe')) {
      return 'stripeSection';
    }
    // if (router.pathname.includes('creator-onboarding-subrate')) {
    //   return 'subRateSection';
    // }
    return 'detailsSection';
  };

  return (
    <BaseLayout>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <Container>
          <HomeLogoButton />
          {isTablet && hideOnboardingHeader ? (
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
          <SContentContainer>
            {!hideOnboardingHeader && <OnboardingMobileHeader />}
            {children}
          </SContentContainer>
          {!isMobile &&
            !isTablet &&
            !router.pathname.includes('creator-onboarding') && (
              <SSideMessage>
                {!hideOnboardingHeader && <OnboardingMobileHeader />}
                <SHeadline variant={3}>
                  {t(`${SideTextSwitch()}.side.heading`)}
                </SHeadline>
                <Text variant={2}>
                  {t(`${SideTextSwitch()}.side.subheading`)}
                </Text>
              </SSideMessage>
            )}
          {!isMobile &&
            !isTablet &&
            router.pathname.includes('creator-onboarding') && (
              <HeroVisualContainer>
                <HeroVisual />
              </HeroVisualContainer>
            )}
        </Container>
      </SkeletonTheme>
    </BaseLayout>
  );
};

CreatorOnboardingLayout.defaultProps = {
  hideOnboardingHeader: undefined,
};

export default CreatorOnboardingLayout;

const HomeLogoButton = () => (
  <SHomeLogoButton>
    <Row>
      <Col>
        <SLogo />
      </Col>
    </Row>
  </SHomeLogoButton>
);

const SHomeLogoButton = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  ${(props) => props.theme.media.laptop} {
    display: block;
    padding-top: 16px;
    padding-bottom: 16px;
  }
`;

const SLogo = styled(Logo)`
  z-index: 1;
  width: 152px;
  height: 148px;
`;

const SContentContainer = styled.div`
  width: 100%;
  height: 100%;

  ${({ theme }) => theme.media.laptop} {
    position: absolute;
    min-width: 706px;
    width: 50%;
    top: 0;
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

const SSideMessage = styled.div`
  position: fixed;
  bottom: 48px;
  left: 104px;

  max-width: 400px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 12px;
`;

const HeroVisualContainer = styled('div')`
  position: absolute;
  display: block;
  top: 100px;
  margin-right: 100px;
  right: max(706px, 50%);
`;
