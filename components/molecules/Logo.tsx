import React, { useEffect, useState } from 'react';
import Lottie from 'react-lottie';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import { SCROLL_TO_TOP } from '../../constants/timings';

import logoText from '../../public/images/svg/logo_text.svg';
import logoAnimation from '../../public/animations/mobile_logo_animation.json';

export const Logo = () => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleClick = () => {
    if (router.pathname === '/') {
      scroller.scrollTo('top-reload', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
        containerId: 'generalScrollContainer',
      });
    } else {
      router.push('/', '/');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(!loading);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <SWrapper onClick={handleClick}>
      <SAnimationWrapper>
        <Lottie
          width={isMobile ? 55 : 65}
          height={isMobile ? 45 : 60}
          options={{
            loop: false,
            autoplay: true,
            animationData: logoAnimation,
          }}
          isStopped={loading}
        />
      </SAnimationWrapper>
      <InlineSVG
        svg={logoText}
        fill={theme.colorsThemed.text.primary}
        width={isMobile ? '81px' : '94px'}
        height={isMobile ? '21px' : '21px'}
      />
    </SWrapper>
  );
};

export default Logo;

const SWrapper = styled.div`
  width: 127px;
  height: 40px;
  cursor: pointer;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-end;

  ${(props) => props.theme.media.tablet} {
    width: 152px;
    height: 48px;
  }
`;

const SAnimationWrapper = styled.div`
  top: 50%;
  left: -8px;
  position: absolute;
  transform: translateY(-50%);
`;
