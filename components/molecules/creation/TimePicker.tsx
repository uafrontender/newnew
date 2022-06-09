import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../../atoms/InlineSVG';

import chevronDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';
import TimePickerMobileModal from './TimePickerMobileModal';
import { TDropdownSelectItem } from '../../atoms/DropdownSelect';
import Modal from '../../organisms/Modal';

export interface ITimeComponents {
  hours: string;
  minutes: string;
}

interface ITimePicker {
  value: string;
  disabled?: boolean;
  onChange: (e: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const { value, disabled, onChange } = props;
  const theme = useTheme();

  const [modalOpen, setModalOpen] = useState(false);

  const currentTime: ITimeComponents = useMemo(() => {
    const [h, m] = value.split(':');

    return {
      hours: h,
      minutes: m,
    };
  }, [value]);

  const hours: TDropdownSelectItem<string>[] = useMemo(
    () =>
      new Array(12).fill('').map((_, i) => ({
        value:
          (i + 1).toString().length > 1
            ? (i + 1).toString()
            : `0${(i + 1).toString()}`,
        name: (i + 1).toString(),
      })),
    []
  );

  const minutes: TDropdownSelectItem<string>[] = useMemo(
    () =>
      new Array(60).fill('').map((_, i) => ({
        value: i.toString().length > 1 ? i.toString() : `0${i.toString()}`,
        name: i.toString(),
      })),
    []
  );

  const handleChangeTime = (newValue: ITimeComponents) => {
    const val = `${newValue.hours}:${newValue.minutes}`;
    const pseudoEvent = {
      target: {
        value: val,
      },
    };
    onChange(pseudoEvent);
  };

  return (
    <SWrapper
      onClick={(e: any) => {
        e.preventDefault();

        if (!disabled) {
          setModalOpen(true);
        }
      }}
    >
      <SInput type='time' value={value} readOnly />
      <SInlineSVG
        svg={chevronDown}
        fill={theme.colorsThemed.text.secondary}
        width='20px'
        height='20px'
      />
      <Modal
        show={modalOpen}
        custombackdropfiltervalue={1}
        onClose={() => setModalOpen(false)}
      >
        {modalOpen && (
          <TimePickerMobileModal
            hours={hours}
            minutes={minutes}
            currentTime={currentTime}
            handleClose={() => setModalOpen(false)}
            handleChangeTime={handleChangeTime}
          />
        )}
      </Modal>
    </SWrapper>
  );
};

TimePicker.defaultProps = {
  disabled: false,
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
  /* padding: 0 8px; */
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
