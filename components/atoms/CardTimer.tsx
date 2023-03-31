/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Caption from './Caption';

import isBrowser from '../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../utils/secondsToDHMS';
import usePageVisibility from '../../utils/hooks/usePageVisibility';
import useHasMounted from '../../utils/hooks/useHasMounted';

interface ICardTimer {
  startsAt: number;
  endsAt: number;
}

// Its strange how much resources this component consumes om initial render (5.3% before memo)
const CardTimer: React.FunctionComponent<ICardTimer> = React.memo(
  ({ startsAt, endsAt }) => {
    const { t } = useTranslation('component-PostCard');
    const isPageVisible = usePageVisibility();
    const hasMounted = useHasMounted();

    const parsed = Math.ceil((endsAt - Date.now()) / 1000);
    const hasStarted = Date.now() > startsAt;
    const hasEnded = Date.now() >= endsAt;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const expirationDate = new Date(endsAt);

    const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
      secondsToDHMS(parsed)
    );
    const [seconds, setSeconds] = useState(parsed);
    const interval = useRef<number>();

    const parsedString = useMemo(() => {
      if (parsedSeconds.days !== '0') {
        return `
          ${`${parsedSeconds.days}${t('timer.daysLeft')}`}
          ${
            parsedSeconds.hours !== '0'
              ? `${parsedSeconds.hours}${t('timer.hoursLeft')}`
              : ''
          }
          ${
            parsedSeconds.minutes !== '0'
              ? `${parsedSeconds.minutes}${t('timer.minutesLeft')}`
              : ''
          }
        `;
      }

      if (parsedSeconds.days === '0' && parsedSeconds.hours !== '0') {
        return `
          ${`${parsedSeconds.hours}${t('timer.hoursLeft')}`}
          ${`${parsedSeconds.minutes}${t('timer.minutesLeft')}`}
        `;
      }

      return `
      ${
        parsedSeconds.minutes !== '0'
          ? `${parsedSeconds.minutes}${t('timer.minutesLeft')}`
          : ''
      }
      ${
        parsedSeconds.seconds !== '0'
          ? `${parsedSeconds.seconds}${t('timer.secondsLeft')}`
          : ''
      }
      `;
    }, [
      parsedSeconds.days,
      parsedSeconds.hours,
      parsedSeconds.minutes,
      parsedSeconds.seconds,
      t,
    ]);

    useEffect(() => {
      // TODO: we can set the interval recursively and first one can
      // be equal to seconds + milliseconds portion of the time left
      if (isBrowser() && isPageVisible && !hasEnded) {
        interval.current = window.setInterval(() => {
          setSeconds(() => Math.ceil((endsAt - Date.now()) / 1000));
        }, 1000);
      }
      return () => clearInterval(interval.current);
    }, [endsAt, isPageVisible, hasEnded]);

    useEffect(() => {
      setParsedSeconds(secondsToDHMS(seconds));
    }, [seconds]);

    if (!hasMounted) return null;

    if (!hasStarted) {
      return (
        <SCaption variant={2} weight={500}>
          {t('timer.soon')}
        </SCaption>
      );
    }

    if (hasEnded) {
      return (
        <SCaptionEnded variant={2} weight={500}>
          {/* Only en-US locale should be used due to requirements */}
          {t('timer.ended')}
          {/* Commented out as a hotfix */}
          {/* {t('timer.endedOn')} */}
          {/* {expirationDate.toLocaleDateString('en-US')} */}
        </SCaptionEnded>
      );
    }

    return (
      <SCaption variant={2} weight={500}>
        {t('timer.timeLeft', { time: parsedString })}
      </SCaption>
    );
  }
);

export default CardTimer;

const SCaption = styled(Caption)`
  grid-area: timer;
  justify-self: flex-end;

  color: ${(props) => props.theme.colorsThemed.text.secondary};

  white-space: nowrap;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const SCaptionEnded = styled(Caption)`
  grid-area: timer;
  justify-self: flex-end;

  color: ${(props) => props.theme.colorsThemed.text.secondary};

  letter-spacing: -0.5px;

  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }
`;
