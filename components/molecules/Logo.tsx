import React, { useEffect, useState } from 'react';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Lottie from '../atoms/Lottie';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import { SCROLL_TO_TOP } from '../../constants/timings';

import logoText from '../../public/images/svg/logo_text.svg';
import logoAnimation from '../../public/animations/mobile_logo.json';
import { Mixpanel } from '../../utils/mixpanel';

export const Logo: React.FunctionComponent<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const handleClick = () => {
    Mixpanel.track('Navigation Item Clicked', {
      _button: 'Header Logo',
    });
    if (router.pathname === '/') {
      scroller.scrollTo('top-reload', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
        containerId: 'generalScrollContainer',
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

  return (
    <Link href='/' passHref>
      <SWrapper
        {...{
          ...(style
            ? {
                style,
              }
            : {}),
        }}
        onClick={handleClick}
      >
        <SAnimationWrapper>
          <Lottie
            width={isMobile ? 55 : 65}
            height={isMobile ? 45 : 60}
            options={{
              loop: false,
              autoplay: true,
              animationData: logoAnimation,
            }}
            isStopped={!loading}
          />
        </SAnimationWrapper>
        <SInlineSVG
          svg={logoText}
          fill={theme.colorsThemed.text.primary}
          width={isMobile ? '81px' : '94px'}
          height={isMobile ? '21px' : '21px'}
        />
      </SWrapper>
    </Link>
  );
};

Logo.defaultProps = {
  style: {},
};

export default Logo;

const SWrapper = styled.a`
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

const SInlineSVG = styled(InlineSVG)`
  path {
    fill: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;
