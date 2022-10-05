import React, { useState, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import { useAppSelector } from '../../../redux-store/store';

import assets from '../../../constants/assets';
import AnimationChain from '../../atoms/AnimationChain';
import { Mixpanel } from '../../../utils/mixpanel';

export const HeroSection = React.memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubTitle, setAnimateSubTitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

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
                  <Link
                    href={
                      user.loggedIn
                        ? '/creator-onboarding'
                        : '/sign-up?to=create'
                    }
                  >
                    <a>
                      <SButton
                        withDim
                        withShrink
                        view='primaryGrad'
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'Create now',
                          });
                        }}
                      >
                        {t('button.createOnNewnew')}
                      </SButton>
                    </a>
                  </Link>
                  <SButton withDim withShrink view='primaryGrad'>
                    {t('button.createOnNewnew')}
                  </SButton>
                </>
              ) : (
                <Link
                  href={
                    // eslint-disable-next-line no-nested-ternary
                    user.loggedIn
                      ? user.userData?.options?.isCreator
                        ? '/creation'
                        : '/creator-onboarding'
                      : '/sign-up?to=create'
                  }
                >
                  <a>
                    <SButton
                      withShrink
                      withShadow
                      view='primary'
                      onClick={() => {
                        Mixpanel.track('Navigation Item Clicked', {
                          _button: 'Create now',
                        });
                      }}
                    >
                      {user.userData?.options?.isCreator
                        ? t('button.createDecision')
                        : t('button.createOnNewnew')}
                    </SButton>
                  </a>
                </Link>
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
  position: relative;
  display: flex;
  margin-bottom: 24px;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 120px); // 120px - header height

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;

    max-width: 702px;
    margin: 0 auto;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin-top: -40px;
  }
`;

const STopWrapper = styled.div`
  flex: 1;
  margin-top: -40px;
  white-space: pre-line;
`;

const SHeadline = styled(Headline)`
  z-index: 2;
  text-align: center;

  /* Preserve line break */
  white-space: pre;

  ${(props) => props.theme.media.tablet} {
    max-width: 320px;
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 587px;
    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptopM} {
    font-size: 80px;
    line-height: 88px;
  }
`;

const SSubTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  margin-top: 16px;

  text-align: center;

  ${(props) => props.theme.media.tablet} {
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 24px;

    font-size: 16px;
    line-height: 20px;
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
    margin-top: 24px;
    justify-content: initial;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 40px;
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
    }
  }

  ${({ theme }) => theme.media.laptop} {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(calc(-50% - 40px));
    width: 736px;
    height: 658px;
    order: unset;
    z-index: -1;

    * {
      max-width: unset;
    }
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;
  text-transform: capitalize;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;
