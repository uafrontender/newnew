import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

// Components
import Text from './Text';

// Utils
import secondsToString from '../../utils/secondsToHMS';
import isBrowser from '../../utils/isBrowser';
import AnimatedPresence from './AnimatedPresence';

export interface IVerificationCodeResend {
  className?: string;
  canResendAt: number;
  show?: boolean;
  onResendClick: () => void;
}

function getSecondsLeft(to: number) {
  return Math.ceil((to - Date.now()) / 1000);
}

const VerificationCodeResend: React.FunctionComponent<
  IVerificationCodeResend
> = ({ className, canResendAt, show = true, onResendClick }) => {
  const { t } = useTranslation('page-VerifyEmail');

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(getSecondsLeft(canResendAt));
  const [timerActive, setTimerActive] = useState(true);
  const interval = useRef<number>();

  useEffect(() => {
    setTimerSeconds(getSecondsLeft(canResendAt));
  }, [canResendAt]);

  useEffect(() => {
    if (timerSeconds < 1) {
      setTimerActive(false);
    } else {
      setTimerActive(true);
    }
  }, [timerSeconds]);

  useEffect(() => {
    if (isBrowser()) {
      if (timerActive) {
        interval.current = window.setInterval(() => {
          setTimerSeconds((curr) => curr - 1);
        }, 1000);
      } else if (!timerActive) {
        clearInterval(interval.current);
      }
    }
    return () => clearInterval(interval.current);
  }, [timerActive]);

  return (
    <>
      {timerActive && (
        <STimeoutDiv className={className} show={show}>
          {secondsToString(timerSeconds, 'm:s')}
        </STimeoutDiv>
      )}

      {!timerActive && (
        <AnimatedPresence
          animateWhenInView={false}
          animation='t-01'
          delay={0.3}
        >
          <STimeExpired className={className} show={show}>
            {t('expired.noCodeReceived')}{' '}
            <button type='button' onClick={onResendClick}>
              {t('expired.resendButtonText')}
            </button>
          </STimeExpired>
        </AnimatedPresence>
      )}
    </>
  );
};

export default VerificationCodeResend;

const STimeoutDiv = styled.div<{ show: boolean }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
`;

const STimeExpired = styled(Text)<{ show: boolean }>`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  button {
    background-color: transparent;
    border: transparent;

    font-size: inherit;
    font-weight: 500;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    cursor: pointer;

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
  }

  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
`;
