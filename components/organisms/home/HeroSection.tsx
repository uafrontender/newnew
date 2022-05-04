import React, {
  // useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
// import Image from 'next/image';
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

// Assets
import HeroDarkPlaceholder from '../../../public/images/home/Landing-Page-Hold-Frame-Dark.webp';
import HeroLightPlaceholder from '../../../public/images/home/Landing-Page-Hold-Frame-Light.webp';
import HeroDarkMobilePlaceholder from '../../../public/images/home/Landing-Page-Mobile-Dark-Hold-Frame.webp';
import HeroLightMobilePlaceholder from '../../../public/images/home/Landing-Page-Mobile-Light-Hold-Frame.webp';

export const HeroSection = () => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('home');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateSubTitle, setAnimateSubTitle] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const handleSignInClick = () => {
    router.push('/sign-up');
  };
  const handleExploreClick = () => {
    scroller.scrollTo('topSection', {
      offset: isMobile ? -20 : -100,
      smooth: 'ease',
      duration: SCROLL_EXPLORE,
      containerId: 'generalScrollContainer',
    });
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
      <SHeroImage>
        {isMobile ? (
          <video
            key='video-mobile'
            loop
            muted
            autoPlay
            playsInline
            poster={
              theme.name === 'light'
                ? HeroLightMobilePlaceholder.src
                : HeroDarkMobilePlaceholder.src
            }
          >
            <source
              src={
                theme.name === 'light'
                  ? '/images/home/Landing-Page-Mobile-Light.mp4'
                  : '/images/home/Landing-Page-Mobile-Dark.mp4'
              }
              type='video/mp4'
            />
          </video>
        ) : (
          <video
            key='video-desktop'
            loop
            muted
            autoPlay
            playsInline
            poster={
              theme.name === 'light'
                ? HeroLightPlaceholder.src
                : HeroDarkPlaceholder.src
            }
          >
            <source
              src={
                theme.name === 'light'
                  ? '/images/home/Landing-Page-Light.mp4'
                  : '/images/home/Landing-Page-Dark.mp4'
              }
              type='video/mp4'
            />
          </video>
        )}
      </SHeroImage>
    </SWrapper>
  );
};

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

  ${(props) => props.theme.media.tablet} {
    max-width: 320px;
    text-align: left;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 480px;
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

// const SNotificationsList = styled.div`
//   flex: 1;
//   display: flex;
//   position: relative;
//   margin-top: 44px;
//   align-items: flex-end;
//   flex-direction: column;
// `;

const SHeroImage = styled.div`
  order: -1;

  flex: 1;

  width: 100%;
  height: 300px;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1;

  video {
    width: 100%;
    max-width: 360px;
    object-fit: contain;

    position: relative;

    top: -32px;
  }

  ${({ theme }) => theme.media.tablet} {
    order: unset;
    height: 642px;
    margin-top: 24px;

    video {
      top: -10%;

      max-width: unset;
    }
  }
`;

const SButton = styled(Button)`
  padding: 12px 24px;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;

// const GradientMask = styled.div`
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: 1;
//   position: absolute;
//   background: ${(props) => props.theme.gradients.heroNotifications};
//   pointer-events: none;

//   ${(props) => props.theme.media.tablet} {
//     background: ${(props) => props.theme.gradients.heroNotificationsTablet};
//   }
// `;

// const SNotificationItemHolder = styled.div`
//   width: 100%;
//   margin-top: 16px;

//   ${(props) => props.theme.media.tablet} {
//     max-width: 344px;
//   }

//   ${(props) => props.theme.media.laptop} {
//     max-width: 608px;
//   }
// `;
