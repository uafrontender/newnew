import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useIsomorphicLayoutEffect } from 'react-use';

import isBrowser from '../../../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../../../utils/secondsToDHMS';
import usePageVisibility from '../../../../utils/hooks/usePageVisibility';
import { useOverlayMode } from '../../../../contexts/overlayModeContext';

import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';

import assets from '../../../../constants/assets';
import { TPostType } from '../../../../utils/switchPostType';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { useAppState } from '../../../../contexts/appStateContext';

interface IPostScheduledSection {
  postType: TPostType;
  timestampSeconds: number;
  variant: 'decision' | 'moderation';
}

const PostScheduledSection: React.FunctionComponent<IPostScheduledSection> = ({
  postType,
  timestampSeconds,
  variant,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isPageVisible = usePageVisibility();
  const { overlayModeEnabled } = useOverlayMode();

  const [isScrolledDown, setIsScrolledDown] = useState<boolean | undefined>(
    undefined
  );

  const { refetchPost } = usePostInnerState();

  // Timer
  const parsed = (timestampSeconds - Date.now()) / 1000;
  const hasEnded = Date.now() > timestampSeconds;

  const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
    secondsToDHMS(parsed, 'noTrim')
  );
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  useEffect(() => {
    if (isBrowser() && isPageVisible) {
      interval.current = window.setInterval(() => {
        const newSeconds = Math.ceil((timestampSeconds - Date.now()) / 1000);
        setSeconds(newSeconds);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible, timestampSeconds]);

  useEffect(() => {
    setParsedSeconds(secondsToDHMS(seconds, 'noTrim'));
  }, [seconds]);

  const handleScroll = useCallback(() => {
    const scrollTop = document?.documentElement?.scrollTop;
    if (scrollTop && scrollTop > 200) {
      setIsScrolledDown(true);
    } else {
      setIsScrolledDown(false);
    }
  }, []);

  useEffect(() => {
    if (isBrowser()) {
      document?.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (isBrowser()) {
        document?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  useIsomorphicLayoutEffect(() => {
    handleScroll();
  }, [handleScroll]);

  useEffect(() => {
    async function refetchOnHasEnded() {
      await refetchPost();
    }

    if (hasEnded) {
      refetchOnHasEnded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnded]);

  if (isScrolledDown === undefined) {
    return null;
  }

  if (hasEnded) {
    return (
      <SContainer
        isModeration={variant === 'moderation'}
        style={{
          ...(isMobile && !isScrolledDown && !overlayModeEnabled
            ? {
                position: 'fixed',
              }
            : {}),
          ...(isMobile && isScrolledDown && !overlayModeEnabled
            ? {
                width: '100%',
                paddingLeft: '16px',
                paddingRight: '16px',
              }
            : {}),
          ...(isMobile && overlayModeEnabled
            ? {
                opacity: 0,
                position: 'static',
              }
            : {}),
          ...(!isMobile && {
            height: '62%',
          }),
        }}
      >
        <SLoadingContainer>
          <SLogoAnimated
            src={
              theme.name === 'light'
                ? assets.common.lightLogoAnimated()
                : assets.common.darkLogoAnimated()
            }
            alt='NewNew logo'
          />
          <SLoadingTitle variant={5}>
            {t('postScheduled.loading.title')}
          </SLoadingTitle>
          <SSubtitle variant={3}>
            {t('postScheduled.loading.subtitle')}
          </SSubtitle>
        </SLoadingContainer>
      </SContainer>
    );
  }

  return (
    <SContainer
      isModeration={variant === 'moderation'}
      style={{
        ...(isMobile && !isScrolledDown && !overlayModeEnabled
          ? {
              position: 'fixed',
            }
          : {}),
        ...(isMobile && isScrolledDown && !overlayModeEnabled
          ? {
              width: '100%',
              paddingLeft: '16px',
              paddingRight: '16px',
            }
          : {}),
        ...(isMobile && overlayModeEnabled
          ? {
              opacity: 0,
              position: 'static',
            }
          : {}),
      }}
    >
      <SHeadingContainer>
        <SImgContainer>
          <img
            className='hourglass-img'
            src={
              theme.name === 'light'
                ? assets.decision.lightHourglassAnimated()
                : assets.decision.darkHourglassAnimated()
            }
            alt='video is processed'
          />
        </SImgContainer>
        {!isMobile && (
          <STitle variant={6}>{t(`postScheduled.${variant}.title`)}</STitle>
        )}
        <SSubtitle1 variant={2}>
          {t(`postScheduled.${variant}.subtitle_1`, {
            postType: t(`postType.${postType}`),
          })}
        </SSubtitle1>
        <SSubtitle2 variant={2}>
          {t(`postScheduled.${variant}.subtitle_2`)}
        </SSubtitle2>
      </SHeadingContainer>
      <STimer>
        {parsedSeconds.days !== '00' && (
          <STimerItem>
            <STimerTime>{parsedSeconds.days}</STimerTime>
            <STimerCaption variant={3}>
              {t(`postScheduled.${variant}.timer.days`)}
            </STimerCaption>
          </STimerItem>
        )}
        <STimerItem>
          <STimerTime>{parsedSeconds.hours}</STimerTime>
          <STimerCaption variant={3}>
            {t(`postScheduled.${variant}.timer.hours`)}
          </STimerCaption>
        </STimerItem>
        <STimerItem>
          <STimerTime>{parsedSeconds.minutes}</STimerTime>
          <STimerCaption variant={3}>
            {t(`postScheduled.${variant}.timer.minutes`)}
          </STimerCaption>
        </STimerItem>
        {parsedSeconds.days === '00' && (
          <STimerItem>
            <STimerTime>{parsedSeconds.seconds}</STimerTime>
            <STimerCaption variant={3}>
              {t(`postScheduled.${variant}.timer.seconds`)}
            </STimerCaption>
          </STimerItem>
        )}
      </STimer>
      {/* {variant === 'decision' && (
        <SCTAButton view='primaryGrad' onClick={() => handleFollowDecision()}>
          {!isFollowing
            ? t(`postScheduled.${variant}.followButton`, {
                postType: t(`postType.${postType}`),
              })
            : t(`postScheduled.${variant}.unFollowButton`, {
                postType: t(`postType.${postType}`),
              })}
        </SCTAButton>
      )} */}
    </SContainer>
  );
};

export default PostScheduledSection;

const SContainer = styled.div<{
  isModeration: boolean;
}>`
  left: 16px;
  bottom: 16px;

  width: calc(100% - 32px);

  padding: 16px;
  margin-top: ${({ isModeration }) => (isModeration ? '126px' : 'unset')};

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 9;

  transition: 0.3s linear;
  transition: width 0s linear;

  ${({ theme }) => theme.media.tablet} {
    background-color: transparent;
    transition: initial;

    width: 100%;

    margin-top: auto;
    margin-bottom: auto;
  }
`;

// Static heading
const SHeadingContainer = styled.div`
  display: grid;
  grid-template-areas:
    'hourglass subtitle_1'
    'hourglass subtitle_2';

  grid-template-columns: 60px 1fr;

  width: fit-content;
  margin-left: auto;
  margin-right: auto;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'hourglass'
      'title'
      'subtitle_1'
      'subtitle_2';

    grid-template-columns: initial;

    justify-content: center;

    text-align: center;

    width: initial;
    margin-left: initial;
    margin-right: initial;
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'hourglass hourglass'
      'title title'
      'subtitle_1 subtitle_2';
  }
`;

const SImgContainer = styled.div`
  grid-area: hourglass;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  .hourglass-img {
    width: 100%;
    object-fit: contain;
    position: relative;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 120px;
    height: 120px;

    justify-self: center;

    margin-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 160px;
    height: 160px;
    .hourglass-video {
      top: -32px;
    }
  }
`;

const STitle = styled(Headline)`
  grid-area: title;

  margin-bottom: 4px;
`;

const SSubtitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSubtitle1 = styled(Text)`
  grid-area: subtitle_1;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    color: ${({ theme }) => theme.colorsThemed.text.secondary};
  }

  ${({ theme }) => theme.media.laptop} {
    margin-right: 0.3rem;
  }
`;

const SSubtitle2 = styled(SSubtitle)`
  grid-area: subtitle_2;
  white-space: pre-wrap;
`;

// Timer
const STimer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 16px;

  margin-top: 24px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    gap: 24px;

    margin-top: 32px;
    margin-bottom: 32px;
  }
`;

const STimerItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 60px;

  ${({ theme }) => theme.media.tablet} {
    width: 80px;
  }
`;

const STimerTime = styled(Headline)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const STimerCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SLoadingTitle = styled(Headline)`
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 4px;
`;

const SLogoAnimated = styled.img`
  width: 140px;
  height: 104px;
  margin-bottom: 24px;
`;
