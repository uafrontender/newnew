/* eslint-disable arrow-body-style */
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import isBrowser from '../../../utils/isBrowser';
import secondsToDHM, { DHM } from '../../../utils/secondsToDHM';

interface IPostTimer {
  timestampSeconds: number;
}

const PostTimer: React.FunctionComponent<IPostTimer> = ({
  timestampSeconds,
}) => {
  const { t } = useTranslation('decision');
  const [parsedSeconds, setParsedSeconds] = useState<DHM>(secondsToDHM(timestampSeconds));
  const [seconds, setSeconds] = useState(timestampSeconds);
  const interval = useRef<number>();

  useEffect(() => {
    if (isBrowser()) {
      interval.current = window.setInterval(() => {
        setSeconds((s) => s - 60);
      }, 1000 * 60);
    }
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    setParsedSeconds(secondsToDHM(seconds));
  }, [seconds]);

  return (
    <SWrapper>
      <STimerItem>
        {parsedSeconds.days}
        {' '}
        {t('expires.days')}
      </STimerItem>
      <div>
        :
      </div>
      <STimerItem>
        {parsedSeconds.hours}
        {' '}
        {t('expires.hours')}
      </STimerItem>
      <div>
        :
      </div>
      <STimerItem>
        {parsedSeconds.minutes}
        {' '}
        {t('expires.minutes')}
      </STimerItem>
    </SWrapper>
  );
};

export default PostTimer;

const SWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

const STimerItem = styled.div`
  padding: 10px 14px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

`;
