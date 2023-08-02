import React, { useEffect, useState } from 'react';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Lottie from '../atoms/Lottie';
import InlineSVG from '../atoms/InlineSVG';

import { SCROLL_TO_TOP } from '../../constants/timings';

import logoText from '../../public/images/svg/LogoText.svg';
import logoAnimation from '../../public/animations/mobile_logo.json';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';

export const Logo: React.FunctionComponent<{
  style?: React.CSSProperties;
  isShort?: boolean;
}> = ({ style, isShort }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const handleClick = () => {
    Mixpanel.track('Navigation Item Clicked', {
      _button: 'Header Logo',
      _target: '/',
    });

    // This is used for smooth scrolling unlike the next/Link scrolling by hash
    if (router.pathname === '/') {
      scroller.scrollTo('generalContainer', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(!loading);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  });

  const Content = (
    <SWrapper
      {...{
        ...(style
          ? {
              style,
            }
          : {}),
      }}
      isShort={isShort}
      onClick={handleClick}
    >
      <SAnimationWrapper>
        <Lottie
          width={isMobile ? 55 : 65}
          height={isMobile ? 45 : 55}
          options={{
            loop: false,
            autoplay: true,
            animationData: logoAnimation,
          }}
          isStopped={!loading}
        />
      </SAnimationWrapper>
      {!isMobile && !isShort && (
        <SInlineSVG
          svg={logoText}
          fill={theme.colorsThemed.text.primary}
          width={isMobile ? '81px' : '94px'}
          height={isMobile ? '21px' : '21px'}
        />
      )}
    </SWrapper>
  );

  // Don`t add Link if it has no purpose
  if (router.pathname === '/') {
    return Content;
  }

  return (
    <Link href='/' passHref>
      {Content}
    </Link>
  );
};

Logo.defaultProps = {
  style: {},
};

export default Logo;

const SWrapper = styled.a<{
  isShort?: boolean;
}>`
  width: ${({ isShort }) => (isShort ? '45px' : '127px')};
  height: 40px;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  position: relative;
  align-items: center;
  justify-content: flex-end;

  ${(props) => props.theme.media.tablet} {
    width: ${({ isShort }) => (isShort ? '55px' : '152px')};
    height: 48px;
  }
`;

const SAnimationWrapper = styled.div`
  top: 50%;
  left: -8px;
  position: absolute;
  transform: translateY(-50%);
`;

const SInlineSVG = styled(InlineSVG)`
  path {
    fill: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;
