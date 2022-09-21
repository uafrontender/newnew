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
  expirationTime: number;
  onResendClick: () => void;
  onTimerEnd: () => void;
  startTime: number | null;
}

const VerificationCodeResend: React.FunctionComponent<
  IVerificationCodeResend
> = ({ expirationTime, onResendClick, onTimerEnd, startTime, ...rest }) => {
  const { t } = useTranslation('page-VerifyEmail');

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(expirationTime);
  const [timerActive, setTimerActive] = useState(false);
  const interval = useRef<number>();

  const handleResendCode = async () => {
    setTimerSeconds(expirationTime);
    await onResendClick();
    setTimerActive(true);
  };

  useEffect(() => {
    if (timerSeconds < 1) {
      setTimerActive(false);
      onTimerEnd();
    }
  }, [timerSeconds, setTimerActive, onTimerEnd]);

  useEffect(() => {
    if (isBrowser() && startTime) {
      if (timerActive) {
        interval.current = window.setInterval(() => {
          setTimerSeconds(
            expirationTime - Math.floor((Date.now() - startTime) / 1000)
          );
        }, 1000);
      } else if (!timerActive) {
        clearInterval(interval.current);
      }
    }
    return () => clearInterval(interval.current);
  }, [timerActive, timerSeconds, startTime, expirationTime]);

  useEffect(() => {
    if (!startTime) {
      setTimerActive(false);
      onTimerEnd();
      clearInterval(interval.current);
    }
  }, [startTime, onTimerEnd]);

  return (
    <>
      {timerActive && (
        <STimeoutDiv isAlertColor={timerSeconds < 11} {...rest}>
          {secondsToString(timerSeconds, 'm:s')}
        </STimeoutDiv>
      )}

      {!timerActive && (
        <AnimatedPresence
          animateWhenInView={false}
          animation='t-01'
          delay={0.3}
        >
          <STimeExpired {...rest}>
            {t('expired.noCodeReceived')}{' '}
            <button type='button' onClick={() => handleResendCode()}>
              {t('expired.resendButtonText')}
            </button>
          </STimeExpired>
        </AnimatedPresence>
      )}
    </>
  );
};

VerificationCodeResend.defaultProps = {
  expirationTime: 60,
};

export default VerificationCodeResend;

interface ISTimeoutDiv {
  isAlertColor: boolean;
}

const STimeoutDiv = styled.div<ISTimeoutDiv>`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  // NB! Temp
  color: ${({ isAlertColor, theme }) => {
    if (isAlertColor) return theme.colorsThemed.accent.error;
    return theme.colorsThemed.text.tertiary;
  }};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const STimeExpired = styled(Text)`
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
`;
