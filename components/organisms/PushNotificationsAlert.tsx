import React, { useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../atoms/Text';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import lockIcon from '../../public/images/svg/icons/filled/Lock.svg';
import arrowIcon from '../../public/images/svg/icons/outlined/ArrowRight.svg';

import { useOverlayMode } from '../../contexts/overlayModeContext';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import isSafari from '../../utils/isSafari';

interface IPushNotificationAlert {
  show: boolean;
  onClose: () => void;
}

const PushNotificationAlert: React.FC<IPushNotificationAlert> = ({
  show,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const theme = useTheme();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  console.log(isMobile);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(containerRef, onClose);

  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  useEffect(() => {
    if (show) {
      enableOverlayMode();
    }

    return () => {
      disableOverlayMode();
    };
  }, [show, enableOverlayMode, disableOverlayMode]);

  useEffect(() => {
    const blurredBody = document.getElementById('__next');

    if (blurredBody) {
      blurredBody.classList.toggle('blurred', show);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <SContainer>
      <SAlert ref={containerRef}>
        <SLockIconHolder>
          <InlineSVG
            clickable
            scaleOnClick
            svg={lockIcon}
            fill={theme.colors.blue}
            width='20px'
            height='20px'
            onClick={onClose}
          />
        </SLockIconHolder>
        <SText variant={3} weight={600}>
          {isSafari()
            ? t('pushNotification.alert.titleSafari')
            : t('pushNotification.alert.title')}
        </SText>
        {!isSafari() && (
          <SCloseIconHolder>
            <InlineSVG
              clickable
              scaleOnClick
              svg={closeIcon}
              fill={theme.colors.white}
              width='16px'
              height='16px'
              onClick={onClose}
            />
          </SCloseIconHolder>
        )}
        {isSafari() && (
          <SButtonsWrapper>
            <a
              href='https://support.apple.com/en-gb/guide/safari/sfri40734/mac'
              target='_blank'
              rel='noopener noreferrer'
            >
              <SButton>{t('pushNotification.alert.button.more')}</SButton>
            </a>
            <SSeparator />
            <SButton onClick={onClose}>
              {t('pushNotification.alert.button.close')}
            </SButton>
          </SButtonsWrapper>
        )}
      </SAlert>
      <SArrowIconHolder alertWidth={containerRef?.current?.offsetWidth || 0}>
        <InlineSVG
          clickable
          scaleOnClick
          svg={arrowIcon}
          fill={theme.colors.blue}
          width='140px'
          height='190px'
          onClick={onClose}
        />
      </SArrowIconHolder>
    </SContainer>
  );
};

export default PushNotificationAlert;

const SContainer = styled.div`
  left: 0;
  width: 100vw;
  height: 100%;
  bottom: 0;
  z-index: 10;
  overflow: hidden;
  position: fixed;
  backdrop-filter: blur(7.5px);
  -webkit-backdrop-filter: blur(7.5px);
  background-color: ${({ theme }) => theme.colorsThemed.background.overlaydim};
  overscroll-behavior: 'none';
`;

const SAlert = styled.div`
  position: fixed;
  top: 22px;
  left: 85px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  padding-left: 25px;
  overflow: hidden;
  z-index: 6;

  background: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: ${({ theme }) => `8px solid ${theme.colorsThemed.accent.blue}`};

  ${({ theme }) => theme.media.tablet} {
    min-width: 422px;
    max-width: 422px;
  }
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  z-index: 2;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
`;

const SCloseIconHolder = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  z-index: 2;
  transform: translateY(-50%);

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.tertiary
      : theme.colorsThemed.text.tertiary};
  border-radius: 50%;
`;

const SLockIconHolder = styled.div`
  margin-right: 10px;
`;

const SArrowIconHolder = styled.div<{ alertWidth: number }>`
  position: absolute;
  top: 86px;
  transform: rotate(-90deg) translateY(-50%);
  left: ${({ alertWidth }) => `calc(85px + ${alertWidth}px/ 2)`};
`;

const SButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: ${({ theme }) =>
    `1px solid ${theme.colorsThemed.background.outlines2}`};
`;

const SButton = styled.button`
  background: transparent;
  border: none;

  width: 81px;
  height: 32px;

  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  opacity: 0.6;

  transition: 0.2s linear;
  cursor: pointer;

  &:first-child {
    border-top-right-radius: ${({ theme }) => theme.borderRadius.small};
  }

  &:last-child {
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.small};
  }

  &:hover {
    opacity: 1;
  }
`;

const SSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colorsThemed.background.outlines2};
`;
