import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import usePageVisibility from '../../../utils/hooks/usePageVisibility';
import secondsToDHMS, { DHMS } from '../../../utils/secondsToDHMS';
import isBrowser from '../../../utils/isBrowser';

interface IResponseTimer {
  timestampSeconds: number;
}

const ResponseTimer: React.FunctionComponent<IResponseTimer> = ({
  timestampSeconds,
}) => {
  const { t } = useTranslation('page-Creator');
  const isPageVisible = usePageVisibility();
  const parsed = (timestampSeconds - Date.now()) / 1000;

  const [parsedSeconds, setParsedSeconds] = useState<DHMS>(
    secondsToDHMS(parsed)
  );
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  useEffect(() => {
    if (isBrowser() && isPageVisible) {
      interval.current = window.setInterval(() => {
        setSeconds(() => (timestampSeconds - Date.now()) / 1000);
      }, 300);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible, timestampSeconds]);

  useEffect(() => {
    setParsedSeconds(secondsToDHMS(seconds));
  }, [seconds]);

  useUpdateEffect(() => {
    if (seconds <= 0) {
      clearInterval(interval.current);
    }
  }, [seconds]);

  return (
    <>
      {parsedSeconds.days !== '0' && (
        <>
          {parsedSeconds.days}
          {t('dashboard.expirationPosts.expiresTime.days')}{' '}
        </>
      )}
      {parsedSeconds.hours !== '0' && (
        <>
          {parsedSeconds.hours}
          {t('dashboard.expirationPosts.expiresTime.hours')}{' '}
        </>
      )}
      {parsedSeconds.minutes !== '0' && parsedSeconds.days === '0' && (
        <>
          {parsedSeconds.minutes}
          {t('dashboard.expirationPosts.expiresTime.minutes')}{' '}
        </>
      )}
      {parsedSeconds.seconds === '0' &&
        parsedSeconds.days === '0' &&
        parsedSeconds.hours === '0' && (
          <>
            {parsedSeconds.seconds}
            {t('dashboard.expirationPosts.expiresTime.seconds')}{' '}
          </>
        )}
      {t('dashboard.expirationPosts.expiresTime.leftToRespond')}
    </>
  );
};

export default ResponseTimer;
