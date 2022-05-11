import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

import { useAppSelector } from '../../redux-store/store';
import Text from '../atoms/Text';

export interface ICreatorStripeLayout {
  hideProgressBar?: boolean;
}

const SCreatorStripeLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const CreatorStripeLayout: React.FC<ICreatorStripeLayout> = ({
  hideProgressBar,
  children,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
    'laptop',
  ].includes(resizeMode);
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
          {!isMobileOrTablet &&
            !router.pathname.includes('creator-onboarding') && (
              <SSideMessage>
                <Text variant={2}>{t(`stripe.side.subheading`)}</Text>
              </SSideMessage>
            )}
        </SCreatorStripeLayout>
      </SkeletonTheme>
    </ErrorBoundary>
  );
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
