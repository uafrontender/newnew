import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_EXPLORE } from '../../../constants/timings';

import assets from '../../../constants/assets';
import LargeAnimation from '../../atoms/LargeAnimation';

const GRAPHICS_VERSION_STORAGE_KEY = 'graphics-version';
type GraphicsVersion = 1 | 2 | 3 | 4 | 5;

export const HeroSection = React.memo(() => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('home');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubTitle, setAnimateSubTitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  const graphicsVersion = useRef<GraphicsVersion>(
    parseInt(
      localStorage.getItem(GRAPHICS_VERSION_STORAGE_KEY) || '1'
    ) as GraphicsVersion
  );
  useEffect(() => {
    const nextVersion =
      graphicsVersion.current >= 5 ? 1 : graphicsVersion.current + 1;
    localStorage.setItem(GRAPHICS_VERSION_STORAGE_KEY, nextVersion.toString());
  }, []);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const handleSignInClick = () => {
    router.push('/sign-up');
  };
  const handleExploreClick = () => {
    if (document.getElementsByName('topSection').length > 0) {
      scroller.scrollTo('topSection', {
        offset: isMobile ? -20 : -100,
        smooth: 'ease',
        duration: SCROLL_EXPLORE,
        containerId: 'generalScrollContainer',
      });
    } else {
      console.log('hey');
      scroller.scrollTo('ac', {
        offset: isMobile ? -20 : -100,
        smooth: 'ease',
        duration: SCROLL_EXPLORE,
        containerId: 'generalScrollContainer',
      });
    }
  };

  const handleTitleAnimationEnd = useCallback(() => {
    setAnimateSubTitle(true);
  }, []);
  const handleSubTitleAnimationEnd = useCallback(() => {
    setAnimateButton(true);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setAnimateTitle(true);
    }, 0);
  }, []);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SWrapper
      layoutId='heroSection'
      transition={{
        ease: 'easeInOut',
        duration: 1,
      }}
    >
      <STopWrapper>
        <SHeadline>
          <AnimatedPresence
            start={animateTitle}
            animation='t-08'
            delay={0.4}
            onAnimationEnd={handleTitleAnimationEnd}
          >
            {t('hero-block-title')}
          </AnimatedPresence>
        </SHeadline>
        <SSubTitle weight={600}>
          <AnimatedPresence
            start={animateSubTitle}
            animation='t-02'
            onAnimationEnd={handleSubTitleAnimationEnd}
          >
            {t('hero-block-subTitle')}
          </AnimatedPresence>
        </SSubTitle>
        <AnimatedPresence start={animateButton} animation='t-01'>
          <SButtonsHolder>
            {isMobile ? (
              <>
                <SButton
                  withDim
                  withShrink
                  view='primaryGrad'
                  onClick={handleSignInClick}
                >
                  {t('hero-block-sign-in')}
                </SButton>
                <SButton
                  withDim
                  withShrink
                  view='secondary'
                  onClick={handleExploreClick}
                >
                  {t('hero-block-explore')}
                </SButton>
              </>
            ) : (
              <SButton
                withShrink
                withShadow
                view='primaryGrad'
                onClick={handleExploreClick}
              >
                {t('hero-block-explore-now')}
              </SButton>
            )}
          </SButtonsHolder>
        </AnimatedPresence>
      </STopWrapper>
      {isMobile ? (
        <SLargeAnimation
          placeholderSrc={
            theme.name === 'light'
              ? assets.landing[graphicsVersion.current].lightMobileLandingStatic
              : assets.landing[graphicsVersion.current].darkMobileLandingStatic
          }
          videoSrc={
            theme.name === 'light'
              ? assets.landing[graphicsVersion.current]
                  .lightMobileLandingAnimated
              : assets.landing[graphicsVersion.current]
                  .darkMobileLandingAnimated
          }
        />
      ) : (
        <SLargeAnimation
          placeholderSrc={
            theme.name === 'light'
              ? assets.landing[graphicsVersion.current]
                  .lightDesktopLandingStatic
              : assets.landing[graphicsVersion.current].darkDesktopLandingStatic
          }
          videoSrc={
            theme.name === 'light'
              ? assets.landing[graphicsVersion.current]
                  .lightDesktopLandingAnimated
              : assets.landing[graphicsVersion.current]
                  .darkDesktopLandingAnimated
          }
        />
      )}
    </SWrapper>
  );
});

export default HeroSection;

const SWrapper = styled(motion.section)`
  display: flex;
  margin-bottom: 24px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;

    max-width: 702px;
    margin: 0 auto;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
  }
`;

const STopWrapper = styled.div`
  flex: 1;
  white-space: pre-line;

  ${(props) => props.theme.media.laptop} {
    max-width: 45%;
  }
`;

const SHeadline = styled(Headline)`
  text-align: center;

  /* Preserve line break */
  white-space: pre;

  ${(props) => props.theme.media.tablet} {
    max-width: 320px;
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 480px;
    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptopM} {
    font-size: 56px;
    line-height: 64px;
  }
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 16px;

  text-align: center;

  ${(props) => props.theme.media.tablet} {
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptopM} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SButtonsHolder = styled.div`
  display: flex;
  margin-top: 24px;
  flex-direction: row;
  justify-content: center;

  button {
    margin-right: 16px;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 32px;
    justify-content: initial;
  }
`;

const SLargeAnimation = styled(LargeAnimation)`
  right: 18px;
  order: -1;

  flex: 1;

  width: 100%;
  height: 300px;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1;

  * {
    margin-top: -32px;
    margin-bottom: 32px;
    width: 100%;
    max-width: 360px;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    order: unset;
    right: unset;
    height: 642px;
    margin-top: 24px;

    * {
      max-width: unset;
      margin-top: -10%;
      margin-bottom: 10%;
    }
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;
