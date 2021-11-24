import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../atoms/InlineSVG';
import AnimatedPresence from '../atoms/AnimatedPresence';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';

export const Cookie = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies();
  const [animateCookie, setAnimateCookie] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('up');

  const handleClose = () => {
    setAnimationDirection('down');
    setAnimateCookie(true);
    setCookie('accepted', true);
  };
  const handleAnimationEnd = () => {
    setAnimateCookie(false);
  };

  useEffect(() => {
    setTimeout(() => {
      if (cookies.accepted !== 'true') {
        setAnimateCookie(true);
      }
    }, 0);
  }, [cookies.accepted]);

  return (
    <AnimatedPresence
      start={animateCookie}
      animation={animationDirection === 'down' ? 'trans-06-reverse' : 'trans-06'}
      onAnimationEnd={handleAnimationEnd}
    >
      <SContainer>
        <SText>
          {t('cookie-text')}
        </SText>
        <Link href="/cookies">
          <a>
            <STextLink>
              {t('cookie-link')}
            </STextLink>
          </a>
        </Link>
        <InlineSVG
          clickable
          scaleOnClick
          svg={closeIcon}
          fill={theme.colorsThemed.text.secondary}
          width="24px"
          height="24px"
          onClick={handleClose}
        />
      </SContainer>
    </AnimatedPresence>
  );
};

export default Cookie;

const SContainer = styled.div`
  display: flex;
  padding: 12px 20px;
  box-shadow: ${(props) => props.theme.shadows.cookie};
  background: ${(props) => props.theme.colorsThemed.grayscale.backgroundCookie};
  align-items: center;
  border-radius: 50px;
  pointer-events: all;
  justify-content: center;
`;

const SText = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
  white-space: nowrap;
`;

const STextLink = styled.div`
  margin: 0 4px;
  font-size: 14px;
  background: linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), linear-gradient(0deg, #1D6AFF, #1D6AFF);
  line-height: 24px;
  font-weight: bold;
  white-space: nowrap;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }
`;
