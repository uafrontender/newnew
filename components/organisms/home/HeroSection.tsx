import React, { useState, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
  const { locale } = useRouter();

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

  // reset animation on locale change
  useEffect(() => {
    setAnimateSubTitle(false);
    setAnimateButton(false);
  }, [locale]);

  return (
    <SWrapper
      // I believe can be commented out now as there's no need for an animation
      // layoutId='heroSection'
      transition={{
        ease: 'easeInOut',
        duration: 1,
      }}
    >
      <SContentWrapper>
        <STopWrapper>
          <SHeadline>
            <AnimatedPresence
              start={animateTitle}
              animation='t-08'
              delay={0.4}
              onAnimationEnd={handleTitleAnimationEnd}
              key={locale}
            >
              {t('heroSection.title') as string}
            </AnimatedPresence>
          </SHeadline>
          <SSubTitle weight={600}>
            <AnimatedPresence
              start={animateSubTitle}
              animation='t-02'
              onAnimationEnd={handleSubTitleAnimationEnd}
              key={locale}
            >
              {t('heroSection.subTitle')}
            </AnimatedPresence>
          </SSubTitle>
          <AnimatedPresence start={animateButton} animation='t-01' key={locale}>
            <SButtonsHolder>
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
                ? assets.landing.lightMobileLandingVideo
                : assets.landing.darkMobileLandingVideo
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
                ? assets.landing.lightDesktopLandingVideo
                : assets.landing.darkDesktopLandingVideo
            }
          />
        )}
      </SContentWrapper>
    </SWrapper>
  );
});

export default HeroSection;

const SWrapper = styled(motion.section)`
  position: relative;
  width: 100%;
  margin-top: -15px;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 10px;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    padding-bottom: 60px;
    margin: -40px auto 0;
  }

  @media (min-width: 1441px) {
    display: flex;
    align-items: center;
  }
`;

const SContentWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  width: 100%;

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const STopWrapper = styled.div`
  align-self: center;
  max-width: 320px;
  white-space: pre-line;

  ${(props) => props.theme.media.tablet} {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-49%);
    max-width: 300px;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 360px;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 587px;
  }
`;

const SHeadline = styled(Headline)`
  z-index: 2;
  text-align: center;

  /* Preserve line break */
  white-space: pre;

  ${(props) => props.theme.media.tablet} {
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
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
  font-size: 16px;
  line-height: 24px;

  ${(props) => props.theme.media.tablet} {
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 24px;

    font-size: 24px;
    line-height: 32px;
  }
`;

const SButtonsHolder = styled.div`
  display: flex;
  margin-top: 24px;
  flex-direction: row;
  justify-content: center;

  ${(props) => props.theme.media.tablet} {
    margin-top: 24px;
    justify-content: initial;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 40px;
  }
`;

const SLargeAnimation = styled(AnimationChain)`
  right: 7px;
  order: -1;

  flex: 1;

  width: 90%;
  height: 300px;

  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;

  z-index: 1;

  * {
    width: 100%;
    max-width: 360px;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    order: unset;
    right: unset;
    width: 405px;
    max-width: 405px;
    height: 374px;

    * {
      max-width: unset;
    }
  }

  ${({ theme }) => theme.media.laptopM} {
    margin-top: 0;
    width: 736px;
    max-width: 736px;
    height: 658px;
    order: unset;
    z-index: -1;
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;
  text-transform: capitalize;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;
