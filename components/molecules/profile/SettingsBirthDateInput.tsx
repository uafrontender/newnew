/* eslint-disable arrow-body-style */
import React from 'react';
import styled from 'styled-components';
import DatePicker from 'react-date-picker/dist/entry.nostyle';
import { OnChangeDateCallback } from 'react-calendar';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

interface ISettingsBirthDateInput {
  value?: Date;
  onChange: OnChangeDateCallback
}

const SettingsBirthDateInput: React.FunctionComponent<ISettingsBirthDateInput> = ({
  value,
  onChange,
}) => {
  return (
    <SDatePicker
      value={value ?? undefined}
      onChange={onChange}
    />
  );
};

SettingsBirthDateInput.defaultProps = {
  value: undefined,
};

export default SettingsBirthDateInput;

const SDatePicker = styled(DatePicker)`

`;
