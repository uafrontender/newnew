/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useRouter } from 'next/router';
import styled, { css, useTheme } from 'styled-components';

import InlineSvg from '../atoms/InlineSVG';

// Icons
import NewnewLogoDark from '../../public/images/svg/auth/logo-topbar-auth-dark.svg';
import NewnewLogoLight from '../../public/images/svg/auth/logo-topbar-auth-light.svg';

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
      <STestElement
        translated={router.pathname.includes('verify-email')}
      >
        <h4>
          Placeholder
        </h4>
      </STestElement>
      {
        !router.pathname.includes('verify-email') ? (
          <HomeLogoButton
            onClick={() => router.push('/')}
          />
        ) : null
      }
      { children }
    </SAuthLayout>
  );
};

export default AuthLayout;

type THomeLogoButton = React.ComponentPropsWithoutRef<'button'>

const HomeLogoButton: React.FunctionComponent<THomeLogoButton> = (props) => {
  const theme = useTheme();

  return (
    <SHomeLogoButton
      {...props}
    >
      <InlineSvg
        svg={theme.name === 'light' ? NewnewLogoLight : NewnewLogoDark}
        width="152px"
        height="48px"
      />
    </SHomeLogoButton>
  );
};

const SHomeLogoButton = styled.button`
  display: none;


  ${({ theme }) => theme.media.tablet} {
    display: block;

    position: absolute;
    top: 12px;
    left: 32px;

    border: transparent;
    background: transparent;

    cursor: pointer;
  }

  ${({ theme }) => theme.media.laptopL} {
    top: 20px;
    left: 20px;

    & div {
      height: 32px;
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
