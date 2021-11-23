/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled, { css, useTheme } from 'styled-components';
import Lottie from 'react-lottie';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import InlineSVG from '../atoms/InlineSVG';
import Container from '../atoms/Grid/Container';
import Col from '../atoms/Grid/Col';
import Row from '../atoms/Grid/Row';

// Icons
import logoText from '../../public/images/svg/logo_text.svg';
import { useAppSelector } from '../../redux-store/store';
import logoAnimation from '../../public/animations/mobile_logo_animation.json';

export interface IAuthLayout {

}

const SAuthLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;
`;

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.colorsThemed.grayscale.background2}
      highlightColor={theme.colorsThemed.grayscale.background3}
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
        { children }
      </SAuthLayout>
    </SkeletonTheme>
  );
};

export default AuthLayout;

const HomeLogoButton: React.FunctionComponent = () => {
  const theme = useTheme();
  const [playing, setLoading] = useState(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(!playing);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <SHomeLogoButton>
      <Row>
        <Col>
          <Link href="/">
            <a>
              <SAnimationWrapper>
                <Lottie
                  width={isMobile ? 55 : 65}
                  height={isMobile ? 45 : 60}
                  options={{
                    loop: false,
                    autoplay: true,
                    animationData: logoAnimation,
                  }}
                  isStopped={playing}
                />
              </SAnimationWrapper>
              <InlineSVG
                svg={logoText}
                fill={theme.colorsThemed.text.primary}
                width={isMobile ? '81px' : '94px'}
                height={isMobile ? '21px' : '21px'}
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

    a {
      position: absolute;

      margin: 12px 0px;

      width: 127px;
      height: 40px;

      display: flex;
      position: relative;
      align-items: center;
      justify-content: flex-end;

      cursor: pointer;

      ${(props) => props.theme.media.tablet} {
        width: 152px;
        height: 48px;
      }
    }
  }

  ${(props) => props.theme.media.laptop} {
    a {
      margin: 16px 0;
    }
  }
`;

const SAnimationWrapper = styled.div`
  top: 50%;
  left: -8px;
  position: absolute;
  transform: translateY(-50%);
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
