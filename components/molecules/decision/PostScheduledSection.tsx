/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import Text from '../../atoms/Text';
import Headline from '../../atoms/Headline';

// Images
import Hourglass from '../../../public/images/decision/hourglass-mock.png';

// Utils
import isBrowser from '../../../utils/isBrowser';
import { TPostType } from '../../../utils/switchPostType';
import secondsToDHMS, { DHMS } from '../../../utils/secondsToDHMS';
import Button from '../../atoms/Button';

interface IPostScheduledSection {
  postType: string;
  timestampSeconds: number;
  isFollowing: boolean;
  handleFollowDecision: () => {};
}

const PostScheduledSection: React.FunctionComponent<IPostScheduledSection> = ({
  postType,
  timestampSeconds,
  isFollowing,
  handleFollowDecision,
}) => {
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Timer
  const parsed = (timestampSeconds - Date.now()) / 1000;
  const hasEnded = Date.now() > timestampSeconds;
  const expirationDate = new Date(timestampSeconds);

  const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
    secondsToDHMS(parsed)
  );
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  useEffect(() => {
    if (isBrowser()) {
      interval.current = window.setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    setParsedSeconds(secondsToDHMS(seconds));
  }, [seconds]);

  return (
    <SContainer>
      <SHeadingContainer>
        <SImgContainer>
          <SHourglassImg src={Hourglass.src} />
        </SImgContainer>
        {!isMobile && (
          <STitle variant={6}>
            {t('PostScheduled.PostScheduledSection.title')}
          </STitle>
        )}
        <SSubtitle1 variant={2}>
          {t('PostScheduled.PostScheduledSection.subtitle_1', {
            postType: t(`postType.${postType}`),
          })}
        </SSubtitle1>
        <SSubtitle2 variant={2}>
          {t('PostScheduled.PostScheduledSection.subtitle_2')}
        </SSubtitle2>
      </SHeadingContainer>
      <STimer>
        {parsedSeconds.days !== '00' && (
          <STimerItem>
            <STimerTime>{parsedSeconds.days}</STimerTime>
            <STimerCaption variant={3}>
              {t('PostScheduled.PostScheduledSection.timer.days')}
            </STimerCaption>
          </STimerItem>
        )}
        <STimerItem>
          <STimerTime>{parsedSeconds.hours}</STimerTime>
          <STimerCaption variant={3}>
            {t('PostScheduled.PostScheduledSection.timer.hours')}
          </STimerCaption>
        </STimerItem>
        <STimerItem>
          <STimerTime>{parsedSeconds.minutes}</STimerTime>
          <STimerCaption variant={3}>
            {t('PostScheduled.PostScheduledSection.timer.minutes')}
          </STimerCaption>
        </STimerItem>
        {parsedSeconds.days === '00' && (
          <STimerItem>
            <STimerTime>{parsedSeconds.seconds}</STimerTime>
            <STimerCaption variant={3}>
              {t('PostScheduled.PostScheduledSection.timer.seconds')}
            </STimerCaption>
          </STimerItem>
        )}
      </STimer>
      <SCTAButton view='primaryGrad' onClick={() => handleFollowDecision()}>
        {!isFollowing
          ? t('PostScheduled.PostScheduledSection.followBtn', {
              postType: t(`postType.${postType}`),
            })
          : t('PostScheduled.PostScheduledSection.unfollowBtn', {
              postType: t(`postType.${postType}`),
            })}
      </SCTAButton>
    </SContainer>
  );
};

export default PostScheduledSection;

const SContainer = styled.div`
  position: fixed;
  left: 16px;
  bottom: 16px;

  width: calc(100% - 32px);

  padding: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 9;

  ${({ theme }) => theme.media.tablet} {
    position: initial;
    background-color: transparent;
  }
`;

// Static heading
const SHeadingContainer = styled.div`
  display: grid;
  grid-template-areas:
    'hourglass subtitle_1'
    'hourglass subtitle_2';

  grid-template-columns: 60px 1fr;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'hourglass'
      'title'
      'subtitle_1'
      'subtitle_2';

    grid-template-columns: initial;

    justify-content: center;

    text-align: center;
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

  ${({ theme }) => theme.media.tablet} {
    width: 120px;
    height: 120px;

    justify-self: center;

    margin-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 160px;
    height: 160px;
  }
`;

const SHourglassImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
`;

const STitle = styled(Headline)`
  grid-area: title;

  margin-bottom: 4px;
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

const SSubtitle2 = styled(Text)`
  grid-area: subtitle_2;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
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

const SCTAButton = styled(Button)`
  height: 56px;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: fit-content;

    margin-left: auto;
    margin-right: auto;
  }
`;
