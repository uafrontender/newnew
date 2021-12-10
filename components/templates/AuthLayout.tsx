import React from 'react';
import { useRouter } from 'next/router';
import { SkeletonTheme } from 'react-loading-skeleton';
import styled, { useTheme } from 'styled-components';

import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';
import Logo from '../molecules/Logo';
import Container from '../atoms/Grid/Container';
import ErrorBoundary from '../organisms/ErrorBoundary';

import 'react-loading-skeleton/dist/skeleton.css';

export interface IAuthLayout {}

const SAuthLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
`;

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ErrorBoundary>
      <SkeletonTheme
        baseColor={theme.colorsThemed.background.secondary}
        highlightColor={theme.colorsThemed.background.tertiary}
      >
        <SAuthLayout>
          {/* <STestElement
          translated={router.pathname.includes('verify-email')}
        >
          <h4>
            Placeholder
          </h4>
        </STestElement> */}
          {
            !router.pathname.includes('verify-email') ? (
              <HomeLogoButton />
            ) : null
          }
          {children}
        </SAuthLayout>
      </SkeletonTheme>
    </ErrorBoundary>
  );
};

export default AuthLayout;

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

// Instead of this component we're likely to have a ThreeJS Canvas
// background, however, the logic for translating it based on the
// current page will probably stay roughly the same
// const STestElement = styled.div<{ translated: boolean; }>`
//   display: none;
//
//   ${({ theme }) => theme.media.tablet} {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//
//     position: absolute;
//     top: 150px;
//     left: 100px;
//     z-index: -1;
//
//     color: #000;
//     text-align: center;
//
//     background-color: pink;
//     width: 100px;
//     height: 100px;
//
//     transition: transform .5s ease-in-out;
//
//     ${({ translated }) => {
//     if (translated) {
//       return css`opacity: 0;`;
//     }
//     return null;
//   }}
//   }
//
//   ${({ theme }) => theme.media.laptop} {
//     opacity: 1;
//     // Translate on page change
//     ${({ translated }) => {
//     if (translated) {
//       return css`opacity: 1;
//         transform: translateX(150px) rotate(90deg);`;
//     }
//     return null;
//   }}
//   }
// `;
