/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Caption from './Caption';

import isBrowser from '../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../utils/secondsToDHMS';
import usePageVisibility from '../../utils/hooks/usePageVisibility';

interface ICardTimer {
  startsAt: number;
  endsAt: number;
}

// Its strange how much resources this component consumes om initial render (5.3% before memo)
const CardTimer: React.FunctionComponent<ICardTimer> = React.memo(
  ({ startsAt, endsAt }) => {
    const { t } = useTranslation('component-PostCard');
    const isPageVisible = usePageVisibility();
    const parsed = (endsAt - Date.now()) / 1000;
    const hasStarted = Date.now() > startsAt;
    const hasEnded = Date.now() > endsAt;
    const expirationDate = new Date(endsAt);

    const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
      secondsToDHMS(parsed)
    );
    const [seconds, setSeconds] = useState(parsed);
    const interval = useRef<number>();

    const parsedString = useMemo(() => {
      if (parsedSeconds.hours !== '0') {
        return `
    ${
      parsedSeconds.days !== '0'
        ? `${parsedSeconds.days}${t('timer.daysLeft')}`
        : ''
    }
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
      }`;
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
      if (isBrowser() && isPageVisible) {
        interval.current = window.setInterval(() => {
          setSeconds(() => (endsAt - Date.now()) / 1000);
        }, 1000);
      }
      return () => clearInterval(interval.current);
    }, [endsAt, isPageVisible]);

    useEffect(() => {
      setParsedSeconds(secondsToDHMS(seconds));
    }, [seconds]);

    if (!hasStarted) {
      return (
        <SCaption variant={2} weight={700}>
          {t('timer.soon')}
        </SCaption>
      );
    }

    if (hasEnded) {
      return (
        <SCaptionEnded variant={2} weight={700}>
          {t('timer.endedOn')} {expirationDate.toLocaleDateString('en-US')}
        </SCaptionEnded>
      );
    }

    return (
      <SCaption variant={2} weight={700}>
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
`;

const SCaptionEnded = styled(Caption)`
  grid-area: timer;
  justify-self: flex-end;

  color: ${(props) => props.theme.colorsThemed.text.secondary};

  letter-spacing: -0.5px;

  white-space: nowrap;
`;
