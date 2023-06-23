import React from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useOverlayMode } from '../../../contexts/overlayModeContext';

// eslint-disable-next-line no-shadow
export enum DotPositionEnum {
  TopRight = 'top-right',
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
  TopLeft = 'top-left',
}

interface ITutorialTooltip {
  isTooltipVisible: boolean;
  title: string;
  text?: string;
  closeTooltip: () => void;
  dotPosition: DotPositionEnum;
  buttonId?: string;
}

export const TutorialTooltip: React.FC<ITutorialTooltip> = ({
  isTooltipVisible,
  title,
  text,
  closeTooltip,
  dotPosition,
  buttonId,
}) => {
  const { t } = useTranslation('page-Post');
  const { overlayModeEnabled } = useOverlayMode();
  return isTooltipVisible && !overlayModeEnabled ? (
    <SContainer>
      <STitle>{title}</STitle>
      {text && <SText>{text}</SText>}
      <SButton
        // Optional id for tests
        {...(buttonId
          ? {
              id: buttonId,
            }
          : {})}
        onClick={(e) => {
          e.stopPropagation();
          closeTooltip();
        }}
      >
        {t('heroPopupCommon.button')}
      </SButton>
      <SDotWrapper position={dotPosition}>
        <SDot />
      </SDotWrapper>
    </SContainer>
  ) : null;
};

export default TutorialTooltip;

TutorialTooltip.defaultProps = {
  text: '',
};

const SContainer = styled.div`
  position: relative;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  color: ${(props) => props.theme.colors.white};
  box-shadow: 0px 0px 20px rgba(11, 10, 19);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 16px;
  width: 190px;
  z-index: 10;
  text-align: left !important;
`;

const STitle = styled.h3`
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
`;

const SText = styled.p`
  margin: 5px 0 10px;
`;

const SButton = styled.button`
  padding: 0;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.white};
  margin-left: auto;
  font-size: 14px;
  line-height: 24px;
  cursor: pointer;
  font-weight: 600;
  width: auto !important;
`;

interface ISDot {
  position: string;
}

const SDotWrapper = styled.span<ISDot>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background: ${(props) =>
    props.theme.name === 'light'
      ? 'rgba(29,106,255,.1)'
      : 'rgba(255,255,255,.1)'};
  ${(props) => {
    if (props.position === 'top-right') {
      return css`
        right: -13px;
        top: -13px;
      `;
    }
    if (props.position === 'bottom-left') {
      return css`
        left: -13px;
        bottom: -13px;
      `;
    }
    if (props.position === 'top-left') {
      return css`
        left: -13px;
        top: -13px;
      `;
    }
    return css`
      right: -13px;
      bottom: -13px;
    `;
  }}
`;

const SDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.theme.name === 'light' ? '#0B0A13' : props.theme.colors.white};
`;
