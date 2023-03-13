/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dist/shared/lib/dynamic';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { useAppState } from '../../../../contexts/appStateContext';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import useHasMounted from '../../../../utils/hooks/useHasMounted';
import usePageVisibility from '../../../../utils/hooks/usePageVisibility';
import isBrowser from '../../../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../../../utils/secondsToDHMS';
import { TPostType } from '../../../../utils/switchPostType';
import { DotPositionEnum } from '../../../atoms/decision/TutorialTooltip';

const TutorialTooltip = dynamic(
  () => import('../../../atoms/decision/TutorialTooltip')
);

interface IPostTimer {
  timestampSeconds: number;
  postType: TPostType;
  isTutorialVisible?: boolean | undefined;
  onTimeExpired: () => void;
}

const PostTimer: React.FunctionComponent<IPostTimer> = ({
  timestampSeconds,
  postType,
  isTutorialVisible,
  onTimeExpired,
}) => {
  const { t } = useTranslation('page-Post');
  const { locale } = useRouter();
  const { user } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const isPageVisible = usePageVisibility();
  const hasMounted = useHasMounted();

  const parsed = (timestampSeconds - Date.now()) / 1000;
  const hasEnded = Date.now() > timestampSeconds;

  const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
    secondsToDHMS(parsed)
  );
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  const shouldTurnRed = useMemo(
    () => !hasEnded && seconds <= 60 * 60,
    [hasEnded, seconds]
  );

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    if (isBrowser() && isPageVisible) {
      interval.current = window.setInterval(() => {
        setSeconds(() => (timestampSeconds - Date.now()) / 1000);
      }, 300);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible, timestampSeconds]);

  const [tutorialTitle, setTutorialTitle] = useState('Countdown');
  const [tutorialText, setTutorialText] = useState('');

  useEffect(() => {
    if (isTutorialVisible === undefined || isTutorialVisible) {
      switch (postType) {
        case 'ac':
          if (
            user.userTutorialsProgress.remainingAcSteps &&
            user.userTutorialsProgress.remainingAcSteps[0] ===
              newnewapi.AcTutorialStep.AC_TIMER
          )
            setIsTooltipVisible(true);
          setTutorialTitle(t('tutorials.ac.timer.title'));
          setTutorialText(t('tutorials.ac.timer.text'));
          break;
        case 'cf':
          if (
            user.userTutorialsProgress.remainingCfSteps &&
            user.userTutorialsProgress.remainingCfSteps[0] ===
              newnewapi.CfTutorialStep.CF_TIMER
          )
            setIsTooltipVisible(true);
          setTutorialTitle(t('tutorials.cf.timer.title'));
          setTutorialText(t('tutorials.cf.timer.text'));
          break;
        case 'mc':
          if (
            user.userTutorialsProgress.remainingMcSteps &&
            user.userTutorialsProgress.remainingMcSteps[0] ===
              newnewapi.McTutorialStep.MC_TIMER
          )
            setIsTooltipVisible(true);
          setTutorialTitle(t('tutorials.mc.timer.title'));
          setTutorialText(t('tutorials.mc.timer.text'));
          break;
        default:
          setIsTooltipVisible(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType, user.userTutorialsProgress, isTutorialVisible]);

  const goToNextStep = () => {
    setIsTooltipVisible(false);
    let payload;
    switch (postType) {
      case 'ac':
        if (
          user.userTutorialsProgress.remainingAcSteps &&
          user.userTutorialsProgress.remainingAcSteps[0]
        ) {
          if (user.loggedIn) {
            payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
              acCurrentStep: user.userTutorialsProgress.remainingAcSteps[0],
            });
          }
          dispatch(
            setUserTutorialsProgress({
              remainingAcSteps: [
                ...user.userTutorialsProgress.remainingAcSteps,
              ].slice(1),
            })
          );
        }
        break;
      case 'cf':
        if (
          user.userTutorialsProgress.remainingCfSteps &&
          user.userTutorialsProgress.remainingCfSteps[0]
        ) {
          if (user.loggedIn) {
            payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
              cfCurrentStep: user.userTutorialsProgress.remainingCfSteps[0],
            });
          }
          dispatch(
            setUserTutorialsProgress({
              remainingCfSteps: [
                ...user.userTutorialsProgress.remainingCfSteps,
              ].slice(1),
            })
          );
        }
        break;
      default:
        if (
          user.userTutorialsProgress.remainingMcSteps &&
          user.userTutorialsProgress.remainingMcSteps[0]
        ) {
          if (user.loggedIn) {
            payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
              mcCurrentStep: user.userTutorialsProgress.remainingMcSteps[0],
            });
          }
          dispatch(
            setUserTutorialsProgress({
              remainingMcSteps: [
                ...user.userTutorialsProgress.remainingMcSteps,
              ].slice(1),
            })
          );
        }
    }
    if (user.loggedIn && payload) markTutorialStepAsCompleted(payload);
  };

  useEffect(() => {
    setParsedSeconds(secondsToDHMS(seconds));
  }, [seconds]);

  useUpdateEffect(() => {
    if (seconds <= 0) {
      clearInterval(interval.current);
      onTimeExpired();
    }
  }, [seconds]);

  if (!hasMounted) return null;

  return (
    <SWrapper shouldTurnRed={shouldTurnRed}>
      {!hasEnded ? (
        <>
          {parsedSeconds.days !== '0' && (
            <>
              <STimerItem className='timerItem'>
                <div>{parsedSeconds.days}</div>
                <div>{t('expires.days')}</div>
                {isTooltipVisible && (
                  <STutorialTooltipHolder>
                    <TutorialTooltip
                      isTooltipVisible={isTooltipVisible}
                      closeTooltip={goToNextStep}
                      title={tutorialTitle}
                      text={tutorialText}
                      dotPosition={
                        isMobileOrTablet
                          ? DotPositionEnum.TopLeft
                          : DotPositionEnum.TopRight
                      }
                    />
                  </STutorialTooltipHolder>
                )}
              </STimerItem>
              <div>:</div>
            </>
          )}
          <STimerItem className='timerItem'>
            <div>{parsedSeconds.hours}</div>
            <TimeUnit>{t('expires.hours')}</TimeUnit>
            {parsedSeconds.days === '0' && isTooltipVisible && (
              <STutorialTooltipHolder>
                <TutorialTooltip
                  isTooltipVisible={isTooltipVisible}
                  closeTooltip={goToNextStep}
                  title={tutorialTitle}
                  text={tutorialText}
                  dotPosition={
                    isMobileOrTablet
                      ? DotPositionEnum.TopLeft
                      : DotPositionEnum.TopRight
                  }
                />
              </STutorialTooltipHolder>
            )}
          </STimerItem>
          <div>:</div>
          <STimerItem className='timerItem'>
            <div>{parsedSeconds.minutes}</div>
            <TimeUnit>{t('expires.minutes')}</TimeUnit>
          </STimerItem>
          {parsedSeconds.days === '0' && (
            <>
              <div>:</div>
              <STimerItem className='timerItem'>
                <div>{parsedSeconds.seconds}</div>
                <TimeUnit>{t('expires.seconds')}</TimeUnit>
              </STimerItem>
            </>
          )}
        </>
      ) : (
        <STimerItemEnded>
          {t(`postType.${postType}`)} {t('expires.ended_on')}{' '}
          {moment(timestampSeconds)
            .locale(locale || 'en-US')
            .format(`DD MMM YYYY[${t('at')}]hh:mm A`)}
          <STutorialTooltipHolder>
            <TutorialTooltip
              isTooltipVisible={isTooltipVisible}
              closeTooltip={goToNextStep}
              title={tutorialTitle}
              text={tutorialText}
              dotPosition={
                isMobileOrTablet
                  ? DotPositionEnum.TopLeft
                  : DotPositionEnum.TopRight
              }
            />
          </STutorialTooltipHolder>
        </STimerItemEnded>
      )}
    </SWrapper>
  );
};

export default PostTimer;

PostTimer.defaultProps = {
  isTutorialVisible: undefined,
};

const SWrapper = styled.div<{
  shouldTurnRed: boolean;
}>`
  grid-area: timer;
  width: fit-content;
  justify-self: center;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 8px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  position: relative;
  top: -4px;
  left: -14px;

  ${({ shouldTurnRed }) =>
    shouldTurnRed
      ? css`
          .timerItem {
            background-color: ${({ theme }) =>
              theme.colorsThemed.accent.pink} !important;
            color: #ffffff;
          }
        `
      : null};

  ${({ theme }) => theme.media.tablet} {
    position: initial;
    top: initial;
  }
`;

const STimerItem = styled.div`
  display: grid;
  grid-template-columns: 4fr 3fr;

  padding: 10px 12px;
  width: 60px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  position: relative;

  div:nth-child(1) {
    text-align: right;
  }
  div:nth-child(2) {
    text-align: left;
    margin-left: 2px;
  }
`;

const TimeUnit = styled.div`
  white-space: nowrap;
`;

const STimerItemEnded = styled.div`
  padding: 10px 14px;
  width: 100%;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  position: relative;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 0;
  top: 42px;
  text-align: left;

  ${({ theme }) => theme.media.laptop} {
    left: initial;
    right: 100%;
    top: 5px;
  }
`;
