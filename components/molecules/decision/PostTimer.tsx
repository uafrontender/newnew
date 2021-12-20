/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import isBrowser from '../../../utils/isBrowser';
import secondsToDHM, { DHM } from '../../../utils/secondsToDHM';
import { TPostType } from '../../../utils/switchPostType';

interface IPostTimer {
  timestampSeconds: number;
  postType: TPostType;
}

const PostTimer: React.FunctionComponent<IPostTimer> = ({
  timestampSeconds,
  postType,
}) => {
  const { t } = useTranslation('decision');
  const parsed = (timestampSeconds - Date.now()) / 1000;
  const hasEnded = Date.now() > timestampSeconds;
  const expirationDate = new Date(timestampSeconds);

  const [parsedSeconds, setParsedSeconds] = useState<DHM>(secondsToDHM(parsed));
  const [seconds, setSeconds] = useState(parsed);
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
      {!hasEnded ? (
        <>
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
        </>
      ) : (
        <STimerItem>
          { t(`postType.${postType}`) }
          {' '}
          { t('expires.ended_on') }
          {' '}
          { expirationDate.getDate() }
          {' '}
          { expirationDate.toLocaleString('default', { month: 'short' }) }
          {' '}
          { expirationDate.getFullYear() }
          {' '}
          { t('expires.at_time') }
          {' '}
          { ('0' + expirationDate.getHours()).slice(-2) }
          :
          { ('0' + expirationDate.getMinutes()).slice(-2) }
        </STimerItem>
      )}
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
