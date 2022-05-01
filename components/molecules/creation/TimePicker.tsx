import React from 'react';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../../atoms/InlineSVG';

import chevronDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';

interface ITimePicker {
  value: string;
  onChange: (e: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const { value, onChange } = props;
  const theme = useTheme();

  return (
    <SWrapper>
      <SInput type='time' value={value} onChange={onChange} />
      <SInlineSVG
        svg={chevronDown}
        fill={theme.colorsThemed.text.secondary}
        width='20px'
        height='20px'
      />
    </SWrapper>
  );
};

export default TimePicker;

const SWrapper = styled.label`
  width: 100px;
  height: 44px;
  display: flex;
  padding: 12px;
  position: relative;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  flex-direction: row;
  justify-content: flex-end;
`;

const SInput = styled.input`
  top: 50%;
  left: 12px;
  right: 12px;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  border: none;
  z-index: 1;
  outline: none;
  padding: 0 8px;
  position: absolute;
  font-size: 16px;
  transform: translateY(-50%);
  text-align: left;
  font-weight: 500;
  line-height: 24px;
  background-color: transparent;
  -webkit-appearance: none;

  ::-webkit-calendar-picker-indicator {
    background: none;
  }

  ::-webkit-datetime-edit-ampm-field {
    display: none;
  }

  ::-webkit-date-and-time-value {
    text-align: left;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  top: 50%;
  right: 12px;
  z-index: 2;
  position: absolute;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
`;
