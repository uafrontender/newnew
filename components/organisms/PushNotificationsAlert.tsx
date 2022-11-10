import React, { useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../atoms/Text';
import InlineSVG from '../atoms/InlineSVG';

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
  const theme = useTheme();

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
        <SContent>
          <STitle variant={3} weight={600}>
            {isSafari()
              ? t('pushNotification.alert.safari.title')
              : t('pushNotification.alert.nonSafari.title')}
          </STitle>
          {isSafari() && (
            <SSubtitle variant='subtitle'>
              {t('pushNotification.alert.safari.subtitle')}
            </SSubtitle>
          )}
        </SContent>
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
      </SAlert>
      <SArrowIconHolder>
        <InlineSVG
          clickable
          scaleOnClick
          svg={arrowIcon}
          fill={theme.colors.blue}
          width='200px'
          height='200px'
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
  top: 16px;
  left: 16px;
  max-width: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  padding-left: 25px;
  padding-right: 40px;
  overflow: hidden;
  z-index: 6;

  background: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;

    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }

  ${({ theme }) => theme.media.tablet} {
    min-width: 422px;
    max-width: 422px;

    top: 22px;
    left: 85px;
  }
`;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const STitle = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SSubtitle = styled(Text)`
  overflow: hidden;
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

const SArrowIconHolder = styled.div`
  position: absolute;
  top: 86px;
  transform: rotate(-90deg) translateY(-50%);
  left: 50%;

  ${({ theme }) => theme.media.tablet} {
    left: calc(85px + 422px / 2);
  }
`;
