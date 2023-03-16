import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import InlineSVG from '../atoms/InlineSVG';
import AnimatedPresence, {
  TElementAnimations,
} from '../atoms/AnimatedPresence';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import cookieIcon from '../../public/images/svg/icons/filled/Cookie.svg';

const Cookie = React.memo(() => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies();
  const [animation, setAnimation] = useState<TElementAnimations>('trans-06');
  const [animateCookie, setAnimateCookie] = useState(false);

  const handleClose = () => {
    const d = new Date();

    setAnimation('trans-06-reverse');
    setAnimateCookie(true);
    setCookie('accepted', true, {
      expires: new Date(d.setFullYear(d.getFullYear() + 1)),
      path: '/',
    });
  };
  const handleAnimationEnd = () => {
    setAnimateCookie(false);
  };
  const handleMouseOver = () => {
    setAnimation('o-11');
    setAnimateCookie(true);
  };
  const handleMouseLeave = () => {
    if (animation === 'o-11') {
      setAnimation('o-11-reverse');
      setAnimateCookie(true);
    }
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
      animation={animation}
      onAnimationEnd={handleAnimationEnd}
      animateWhenInView={false}
    >
      {cookies.accepted !== 'true' && (
        <SContainer
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <SText>{t('cookie.text')}</SText>
          <SInlineSVG svg={cookieIcon} width='20px' height='20px' />
          <Link href='https://privacy.newnew.co'>
            <a
              href='https://privacy.newnew.co'
              target='_blank'
              rel='noreferrer'
            >
              <STextLink>{t('cookie.link')}</STextLink>
            </a>
          </Link>
          <InlineSVG
            clickable
            scaleOnClick
            svg={closeIcon}
            fill={theme.colorsThemed.text.secondary}
            width='24px'
            height='24px'
            onClick={handleClose}
          />
        </SContainer>
      )}
    </AnimatedPresence>
  );
});

export default Cookie;

const SContainer = styled.div`
  margin: 10px;
  display: flex;
  padding: 12px 12px 12px 20px;
  box-shadow: ${(props) => props.theme.shadows.cookie};
  background: ${(props) =>
    props.theme.colorsThemed.background.backgroundCookie};
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
  margin-right: 2px;
`;

const STextLink = styled.div`
  margin: 0 4px;
  font-size: 14px;
  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    linear-gradient(0deg, #1d6aff, #1d6aff);
  line-height: 24px;
  font-weight: bold;
  white-space: nowrap;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  top: -1px;
  position: relative;
  margin-left: 4px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 8px;
  }
`;
