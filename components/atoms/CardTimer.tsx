/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import isBrowser from '../../utils/isBrowser';
import secondsToDHM, { DHM } from '../../utils/secondsToDHM';
import Caption from './Caption';

interface ICardTimer {
  timestampSeconds: number;
}

const CardTimer: React.FunctionComponent<ICardTimer> = ({
  timestampSeconds,
}) => {
  const { t } = useTranslation('home');
  const parsed = (timestampSeconds - Date.now()) / 1000;
  const hasEnded = Date.now() > timestampSeconds;
  const expirationDate = new Date(timestampSeconds);

  const [parsedSeconds, setParsedSeconds] = useState<DHM>(secondsToDHM(parsed, 'noTrim'));
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  const parsedString = `
    ${parsedSeconds.days !== '0' ? `${parsedSeconds.days}${t('card-time-left-days')}` : ''}
    ${parsedSeconds.hours !== '0' ? `${parsedSeconds.hours}${t('card-time-left-hours')}` : ''}
    ${parsedSeconds.minutes !== '0' ? `${parsedSeconds.minutes}${t('card-time-left-minutes')}` : ''}
  `;

  useEffect(() => {
    if (isBrowser()) {
      interval.current = window.setInterval(() => {
        setSeconds((s) => s - 60);
      }, 1000 * 60);
    }
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    setParsedSeconds(secondsToDHM(seconds, 'noTrim'));
  }, [seconds]);

  return (
    !hasEnded ? (
      <SCaption variant={2} weight={700}>
        {t('card-time-left', { time: parsedString })}
      </SCaption>
    ) : (
      <SCaption variant={2} weight={700}>
        { t('card-time-expired-ended-on') }
        {' '}
        { expirationDate.getDate() }
        {' '}
        { expirationDate.toLocaleString('default', { month: 'short' }) }
        {' '}
        { expirationDate.getFullYear() }
      </SCaption>
    )
  );
};

export default CardTimer;

const SCaption = styled(Caption)`
  grid-area: timer;
  justify-self: flex-end;

  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;
