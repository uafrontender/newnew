/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled, { css, useTheme } from 'styled-components';

import InlineSVG from '../atoms/InlineSVG';
import Container from '../atoms/Grid/Container';
import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';

// Icons
import tabletLogo from '../../public/images/svg/tablet-logo.svg';

export interface IAuthLayout {

}

const SAuthLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
`;

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => {
  const router = useRouter();

  return (
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
      { children }
    </SAuthLayout>
  );
};

export default AuthLayout;

const HomeLogoButton: React.FunctionComponent = () => {
  const theme = useTheme();

  return (
    <SHomeLogoButton>
      <Row>
        <Col>
          <Link href="/">
            <a>
              <InlineSVG
                svg={tabletLogo}
                fill={theme.colorsThemed.text.primary}
                width="152px"
                height="48px"
              />
            </a>
          </Link>
        </Col>
      </Row>
    </SHomeLogoButton>
  );
};

const SHomeLogoButton = styled(Container)`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: block;

    position: relative;

    height: fit-content;

    a {
      position: absolute;

      margin: 12px 0;

      text-decoration: none;

      cursor: pointer;
    }
  }

  ${(props) => props.theme.media.laptop} {
    a {
      margin: 16px 0;
    }
  }
`;

// Instead of this component we're likely to have a ThreeJS Canvas
// background, however, the logic for translating it based on the
// current page will probably stay roughly the same
const STestElement = styled.div<{ translated: boolean; }>`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 150px;
    left: 100px;
    z-index: -1;

    color: #000;
    text-align: center;

    background-color: pink;
    width: 100px;
    height: 100px;

    transition: transform .5s ease-in-out;

    ${({ translated }) => {
    if (translated) {
      return css`opacity: 0;`;
    } return null;
  }}
  }

  ${({ theme }) => theme.media.laptop} {
    opacity: 1;
    // Translate on page change
    ${({ translated }) => {
    if (translated) {
      return css`opacity: 1; transform: translateX(150px) rotate(90deg);`;
    } return null;
  }}
  }
`;
