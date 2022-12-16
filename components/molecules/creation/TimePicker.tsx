import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import moment from 'moment';

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
  isDaySame: boolean;
  isTimeOfTheDaySame: boolean;
  hoursFormat: 'am' | 'pm';
  localTimeOfTheDay: 'am' | 'pm';
  onChange: (e: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const {
    value,
    disabled,
    isDaySame,
    isTimeOfTheDaySame,
    hoursFormat,
    localTimeOfTheDay,
    onChange,
  } = props;
  const theme = useTheme();

  const [modalOpen, setModalOpen] = useState(false);

  const currentTime: ITimeComponents = useMemo(() => {
    const [h, m] = value.split(':');

    return {
      hours: h,
      minutes: m,
    };
  }, [value]);

  const hours: TDropdownSelectItem<string>[] = useMemo(() => {
    let offset;
    if (isDaySame) {
      const h = moment().hour();

      if (isTimeOfTheDaySame && localTimeOfTheDay === 'pm' && h !== 12) {
        const hCorrected = h - 13;

        offset = hCorrected;
      } else if (isTimeOfTheDaySame && localTimeOfTheDay === 'am') {
        offset = h - 1;
      }
    }
    const hoursArray = new Array(12).fill('').map((_, i) => ({
      value:
        (i + 1).toString().length > 1
          ? (i + 1).toString()
          : `0${(i + 1).toString()}`,
      name: (i + 1).toString(),
    }));

    if (offset) {
      return hoursArray.slice(offset);
    }

    return hoursArray;
  }, [isDaySame, isTimeOfTheDaySame, localTimeOfTheDay]);

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
      onClick={(e) => {
        e.preventDefault();

        if (!disabled) {
          setModalOpen(true);
        }
      }}
    >
      <SInput type='text' value={value} readOnly />
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
            isDaySame={isDaySame}
            hours={hours}
            // minutes={minutes}
            hoursFormat={hoursFormat}
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
  pointer-events: none;
`;

const SInlineSVG = styled(InlineSVG)`
  top: 50%;
  right: 12px;
  z-index: 2;
  position: absolute;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
`;
