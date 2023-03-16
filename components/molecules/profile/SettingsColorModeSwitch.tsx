/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, { useEffect, useRef, useState } from 'react';
import styled, { DefaultTheme, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

import { TColorMode } from '../../../redux-store/slices/uiStateSlice';

import InlineSvg from '../../atoms/InlineSVG';

// Icons
import IconLight from '../../../public/images/svg/icons/filled/Light.svg';
import IconDark from '../../../public/images/svg/icons/filled/Dark.svg';
import IconAuto from '../../../public/images/svg/icons/filled/AutoMode.svg';

const optionsIcons = {
  light: IconLight,
  dark: IconDark,
  auto: IconAuto,
};

export type CMButtonCaptions = {
  light: string;
  dark: string;
  auto: string;
};

interface ISettingsColorModeSwitch {
  theme: DefaultTheme;
  variant: 'vertical' | 'horizontal';
  isMobile: boolean;
  currentlySelectedMode: TColorMode;
  buttonsCaptions: CMButtonCaptions;
  wrapperStyle?: React.CSSProperties;
  backgroundColor?: string;
  handleSetColorMode: (mode: TColorMode) => void;
}

const options: Array<keyof typeof optionsIcons> = ['light', 'dark', 'auto'];

const SettingsColorModeSwitch: React.FunctionComponent<
  ISettingsColorModeSwitch
> = ({
  theme,
  variant,
  isMobile,
  buttonsCaptions,
  currentlySelectedMode,
  wrapperStyle,
  backgroundColor,
  handleSetColorMode,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const buttonsRef = useRef<HTMLButtonElement[]>([]);
  const [activeIcon, setActiveIcon] = useState(
    options.findIndex((option) => option === currentlySelectedMode)
  );
  const [indicatorStyle, setIndicatorStyle] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x:
      (buttonsRef.current[activeIcon]?.getBoundingClientRect().x || 0) -
      (containerRef.current?.getBoundingClientRect().x || 0)!!,
    y:
      (buttonsRef.current[activeIcon]?.getBoundingClientRect().y || 0) -
      (containerRef.current?.getBoundingClientRect().y || 0)!!,
    width: buttonsRef.current[activeIcon]?.getBoundingClientRect().width,
    height: buttonsRef.current[activeIcon]?.getBoundingClientRect().height,
  });

  useEffect(() => {
    setActiveIcon(
      buttonsRef.current.findIndex(
        (option) => option.title === currentlySelectedMode
      )
    );
  }, [currentlySelectedMode]);

  useEffect(() => {
    const currentButtonRef = buttonsRef.current[activeIcon];
    const container = containerRef.current;

    if (!container) return;

    const updatedIndicatorStyle = {
      x:
        currentButtonRef.getBoundingClientRect().x -
        (container?.getBoundingClientRect().x || 0),
      y:
        currentButtonRef.getBoundingClientRect().y -
        (container?.getBoundingClientRect().y || 0),
      width: currentButtonRef.getBoundingClientRect().width,
      height: currentButtonRef.getBoundingClientRect().height,
    };

    setIndicatorStyle(updatedIndicatorStyle);
    // Need a dependency to buttonsCaptions, as it affects width of the element
  }, [activeIcon, variant, buttonsCaptions, setIndicatorStyle]);

  return (
    <SSettingsColorModeSwitchWrapper
      variant={variant}
      style={wrapperStyle ?? {}}
      ref={(el) => {
        containerRef.current = el!!;
      }}
    >
      <SMIndicator
        style={{
          left: indicatorStyle.x,
          top: indicatorStyle.y,
          width: indicatorStyle.width,
          height: indicatorStyle.height,
        }}
      />
      {options &&
        options.map((option, i) => (
          <SColorSwitchButton
            title={option}
            ref={(el) => {
              buttonsRef.current[i] = el!!;
            }}
            onClick={() => handleSetColorMode(option)}
            isActive={i === activeIcon}
            key={`mode-${option}`}
            style={{
              borderRadius: '50px',
              ...(option === currentlySelectedMode
                ? { cursor: 'default' }
                : {}),
            }}
            backgroundColor={backgroundColor}
          >
            <div
              style={{
                ...(variant === 'horizontal' ? { flexDirection: 'row' } : {}),
              }}
            >
              <InlineSvg
                svg={optionsIcons[option]}
                width='20px'
                height='20px'
                fill={
                  theme.name === 'dark'
                    ? '#FFFFFF'
                    : activeIcon === i
                    ? '#FFFFFF'
                    : '#2C2C33'
                }
              />
              {variant === 'horizontal' && i === activeIcon && !isMobile ? (
                <span>{buttonsCaptions[option]}</span>
              ) : null}
            </div>
          </SColorSwitchButton>
        ))}
    </SSettingsColorModeSwitchWrapper>
  );
};

SettingsColorModeSwitch.defaultProps = {
  wrapperStyle: {},
};

export default SettingsColorModeSwitch;

const SSettingsColorModeSwitchWrapper = styled.div<{
  variant: 'vertical' | 'horizontal';
}>`
  position: relative;

  display: flex;
  flex-direction: ${({ variant }) =>
    variant === 'horizontal' ? 'row' : 'column'};
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;

  z-index: 0;
`;

const SColorSwitchButton = styled.button<{
  isActive: boolean;
  backgroundColor?: string;
}>`
  position: relative;
  overflow: hidden;

  padding: 8px;

  border: 0px transparent;
  background: transparent;

  cursor: pointer;
  z-index: 3;

  &:before {
    position: absolute;
    left: -2px;
    top: -2px;
    z-index: -1;
    content: '';

    width: 40px;
    height: 40px;

    background-color: ${({ theme, isActive, backgroundColor }) =>
      isActive
        ? 'transparent !important'
        : backgroundColor || theme.colorsThemed.background.secondary};
  }

  div {
    z-index: 7;

    display: flex;

    span {
      display: block;
      margin: 0px 8px;

      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }
  }
`;

const IndicatorInitialAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const SMIndicator = styled(motion.div)`
  position: absolute;
  z-index: 0;

  border-radius: 50px;

  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};

  transition: left 0.2s linear, top 0.2s linear, width 0.3s linear 0.2s;

  opacity: 0;
  animation-duration: 0.1s;
  animation-delay: 0.4s;
  animation-fill-mode: forwards;
  animation-name: ${IndicatorInitialAnimation};

  ${({ theme }) => theme.media.laptop} {
    opacity: 1;
    animation: unset;
  }
`;
