import React, { useState, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { scroller } from 'react-scroll';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Head from 'next/head';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_EXPLORE } from '../../../constants/timings';

import assets from '../../../constants/assets';
import AnimationChain from '../../atoms/AnimationChain';
import { Mixpanel } from '../../../utils/mixpanel';

export const HeroSection = React.memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubTitle, setAnimateSubTitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const handleExploreClick = () => {
    Mixpanel.track('Explore Now Clicked', {
      _stage: 'Hero Section',
    });
    if (document.getElementsByName('topSection').length > 0) {
      scroller.scrollTo('topSection', {
        offset: isMobile ? -20 : -100,
        smooth: 'ease',
        duration: SCROLL_EXPLORE,
      });
    } else {
      scroller.scrollTo('mc', {
        offset: isMobile ? -20 : -100,
        smooth: 'ease',
        duration: SCROLL_EXPLORE,
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

  return (
    <>
      <Head>
        {/* We need to change page colors to fit landing page animation dark mode background */}
        {theme.name === 'dark' && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
              body {
                background-color: #090813 !important;
              }

              #top-nav-header {
                background-color: #090813 !important;
              }

              #top-nav-header-wrapper {
                background-color: #090813 !important;
              }`,
            }}
          />
        )}
      </Head>
      <SWrapper
        // I believe can be commented out now as there's no need for an animation
        // layoutId='heroSection'
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
              {t('heroSection.title') as string}
            </AnimatedPresence>
          </SHeadline>
          <SSubTitle weight={600}>
            <AnimatedPresence
              start={animateSubTitle}
              animation='t-02'
              onAnimationEnd={handleSubTitleAnimationEnd}
            >
              {t('heroSection.subTitle')}
            </AnimatedPresence>
          </SSubTitle>
          <AnimatedPresence start={animateButton} animation='t-01'>
            <SButtonsHolder>
              {isMobile ? (
                <>
                  <Link href='/sign-up?to=log-in'>
                    <a>
                      <SButton
                        withDim
                        withShrink
                        view='secondary'
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'Sign in',
                          });
                        }}
                      >
                        {t('heroSection.signIn')}
                      </SButton>
                    </a>
                  </Link>
                  <SButton
                    withDim
                    withShrink
                    view='primaryGrad'
                    onClick={handleExploreClick}
                  >
                    {t('heroSection.explore')}
                  </SButton>
                </>
              ) : (
                <SButton
                  withShrink
                  withShadow
                  view='primaryGrad'
                  onClick={handleExploreClick}
                >
                  {t('heroSection.exploreNow')}
                </SButton>
              )}
            </SButtonsHolder>
          </AnimatedPresence>
        </STopWrapper>
        {isMobile ? (
          <SLargeAnimation
            placeholderSrc={
              theme.name === 'light'
                ? assets.landing.lightMobileLandingStatic
                : assets.landing.darkMobileLandingStatic
            }
            videoSrcList={
              theme.name === 'light'
                ? assets.landing.lightMobileLandingAnimated
                : assets.landing.darkMobileLandingAnimated
            }
          />
        ) : (
          <SLargeAnimation
            placeholderSrc={
              theme.name === 'light'
                ? assets.landing.lightDesktopLandingStatic
                : assets.landing.darkDesktopLandingStatic
            }
            videoSrcList={
              theme.name === 'light'
                ? assets.landing.lightDesktopLandingAnimated
                : assets.landing.darkDesktopLandingAnimated
            }
          />
        )}
      </SWrapper>
    </>
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

const SLargeAnimation = styled(AnimationChain)`
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
