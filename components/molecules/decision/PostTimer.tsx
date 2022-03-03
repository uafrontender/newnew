/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import isBrowser from '../../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../../utils/secondsToDHMS';
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

  const [parsedSeconds, setParsedSeconds] = useState<DHMS>(secondsToDHMS(parsed));
  const [seconds, setSeconds] = useState(parsed);
  const interval = useRef<number>();

  const shouldTurnRed = useMemo(() => !hasEnded && seconds <= 60 * 60, [hasEnded, seconds]);

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
    <SWrapper
      shouldTurnRed={shouldTurnRed}
    >
      {!hasEnded ? (
        <>
          {parsedSeconds.days !== '00' && (
            <>
              <STimerItem
                className="timerItem"
              >
                <div>
                  {parsedSeconds.days}
                </div>
                <div>
                  {t('expires.days')}
                </div>
              </STimerItem>
              <div>
                :
              </div>
            </>
          )}
          <STimerItem
            className="timerItem"
          >
            <div>
              {parsedSeconds.hours}
            </div>
            <div>
              {t('expires.hours')}
            </div>
          </STimerItem>
          <div>
            :
          </div>
            <STimerItem
              className="timerItem"
            >
            <div>
              {parsedSeconds.minutes}
            </div>
            <div>
              {t('expires.minutes')}
            </div>
          </STimerItem>
          {parsedSeconds.days === '00' && (
            <>
              <div>
                :
              </div>
              <STimerItem
                className="timerItem"
              >
                <div>
                  {parsedSeconds.seconds}
                </div>
                <div>
                  {t('expires.seconds')}
                </div>
              </STimerItem>
            </>
          )}
        </>
      ) : (
        <STimerItemEnded>
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
        </STimerItemEnded>
      )}
    </SWrapper>
  );
};

export default PostTimer;

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

  ${({ shouldTurnRed }) => (shouldTurnRed ? (
    css`
      .timerItem {
        background-color: ${({ theme }) => theme.colorsThemed.accent.pink} !important;
        color: #FFFFFF;
      }
    `
  ) : null)};

  ${({ theme }) => theme.media.tablet} {
    position: initial;
    top: initial;
  }
`;

const STimerItem = styled.div`
  display: grid;
  grid-template-columns: 5fr 1fr;

  padding: 10px 14px;
  width: 60px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  div:nth-child(1) {
    text-align: center;
  }
  div:nth-child(2) {
    text-align: right;
  }
`;

const STimerItemEnded = styled.div`
  padding: 10px 14px;
  width: 100%;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;
