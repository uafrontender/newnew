/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
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

interface ISettingsColorModeSwitch {
  variant: 'vertical' | 'horizontal';
  currentlySelectedMode: TColorMode;
  wrapperStyle?: React.CSSProperties,
  handleSetColorMode: (mode: TColorMode) => void;
}

const options: Array<keyof typeof optionsIcons> = ['light', 'dark', 'auto'];

const SettingsColorModeSwitch: React.FunctionComponent<ISettingsColorModeSwitch> = ({
  variant,
  currentlySelectedMode,
  wrapperStyle,
  handleSetColorMode,
}) => {
  const theme = useTheme();

  const [activeIcon, setActiveIcon] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    x: number,
    y: number,
    width: number,
    height: number,
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement>();
  const buttonsRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    setActiveIcon(buttonsRef.current.findIndex((option) => option.title === currentlySelectedMode));
  }, [currentlySelectedMode]);

  useEffect(() => {
    const currentButtonRef = buttonsRef.current[activeIcon];
    const container = containerRef.current;

    if (!container) return;

    const updatedIndicatorStyle = {
      x: currentButtonRef.getBoundingClientRect().x - container?.getBoundingClientRect().x,
      y: currentButtonRef.getBoundingClientRect().y - container?.getBoundingClientRect().y,
      width: currentButtonRef.getBoundingClientRect().width,
      height: currentButtonRef.getBoundingClientRect().height,
    };

    setIndicatorStyle(updatedIndicatorStyle);
  }, [activeIcon, setIndicatorStyle]);

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
      {options && options.map((option, i) => (
        <SColorSwitchButton
          title={option}
          ref={(el) => {
            buttonsRef.current[i] = el!!;
          }}
          onClick={() => handleSetColorMode(option)}
          isActive={i === activeIcon}
          style={{
            borderRadius: '50px',
            ...(option === currentlySelectedMode ? { cursor: 'default' } : {}),
          }}
        >
          <div>
            <InlineSvg
              svg={optionsIcons[option]}
              width="20px"
              height="20px"
              fill={
                theme.name === 'dark'
                  ? '#FFFFFF' : (activeIcon === i
                    ? '#FFFFFF' : '#2C2C33')
              }
            />
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
  flex-direction: ${({ variant }) => (variant === 'horizontal' ? 'row' : 'column')};
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;


  z-index: 0;
`;

const SColorSwitchButton = styled.button<{
  isActive: boolean;
}>`
  position: relative;
  display: flex;
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

    background-color: ${({ theme, isActive }) => (isActive ? 'transparent' : theme.colorsThemed.grayscale.background2)};
  }

  div {
    z-index: 7;
  }
`;

const SMIndicator = styled(motion.div)`
  position: absolute;

  border-radius: 50px;

  background-color: ${({ theme }) => theme.colorsThemed.accent.blue};

  z-index: 0;
`;
