/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useUpdateEffect } from 'react-use';

import { useAppSelector } from '../../../../redux-store/store';

import InlineSvg from '../../../atoms/InlineSVG';

import isBrowser from '../../../../utils/isBrowser';
import secondsToDHMS, { DHMS } from '../../../../utils/secondsToDHMS';

// Icons
import AlertIcon from '../../../../public/images/svg/icons/filled/Alert.svg';
import AlertIconInverted from '../../../../public/images/svg/icons/filled/AlertInverted.svg';
import usePageVisibility from '../../../../utils/hooks/usePageVisibility';

interface IResponseTimer {
  timestampSeconds: number;
  onTimeExpired: () => void;
}

const ResponseTimer: React.FunctionComponent<IResponseTimer> = ({
  timestampSeconds,
  onTimeExpired,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
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
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible, timestampSeconds]);

  useEffect(() => {
    setParsedSeconds(secondsToDHMS(seconds));
  }, [seconds]);

  useUpdateEffect(() => {
    if (seconds <= 0) {
      clearInterval(interval.current);
      onTimeExpired();
    }
  }, [seconds]);

  return (
    <SContainer>
      <SWrapper>
        <SInlineSvg
          svg={isMobile ? AlertIcon : AlertIconInverted}
          fill='#FFFFFF'
          width='20px'
          height='20px'
        />
        {parsedSeconds.days !== '0' && (
          <>
            <STimeSpan>{parsedSeconds.days}</STimeSpan>
            <span>{t('expiresResponse.days')}</span>
            <span>{` `}</span>
          </>
        )}
        {parsedSeconds.hours !== '0' && (
          <>
            <STimeSpan>{parsedSeconds.hours}</STimeSpan>
            <span>{t('expiresResponse.hours')}</span>
            <span> </span>
          </>
        )}
        {parsedSeconds.minutes !== '0' && (
          <>
            <STimeSpan>{parsedSeconds.minutes}</STimeSpan>
            <span>{t('expiresResponse.minutes')}</span>
            <span> </span>
          </>
        )}
        {parsedSeconds.days === '0' && (
          <>
            <STimeSpan>{parsedSeconds.seconds}</STimeSpan>
            <span>{t('expiresResponse.seconds')}</span>
            <span> </span>
          </>
        )}
        {t('expiresResponse.leftToRespond')}
      </SWrapper>
    </SContainer>
  );
};

export default ResponseTimer;

const SContainer = styled.div`
  position: relative;
  top: 4px;

  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    position: initial;
    margin-bottom: 14px;
  }
`;

const SWrapper = styled.div`
  grid-area: timer;
  justify-self: center;

  text-align: center;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  vertical-align: middle;

  position: relative;
  top: -4px;
  left: -14px;

  color: ${({ theme }) => theme.colorsThemed.accent.pink};

  ${({ theme }) => theme.media.tablet} {
    position: initial;
    top: initial;

    width: 100%;
    padding-top: 14px;
    padding-bottom: 14px;

    background-color: ${({ theme }) => theme.colorsThemed.accent.pink};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    color: #ffffff;
  }
`;

const SInlineSvg = styled(InlineSvg)`
  display: inline-flex;

  position: relative;
  top: 5px;

  margin-right: 0.3rem;
`;

const STimeSpan = styled.span`
  display: inline-block;
  text-align: end;
  min-width: 16px;
  margin-right: 1px;
`;
