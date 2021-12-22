import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';

import Text from '../Text';
import InlineSVG from '../InlineSVG';

import timeIcon from '../../../public/images/svg/icons/filled/Time.svg';

interface ITimePicker {
  time: any;
  format: 'pm' | 'am';
  onChange: (key: string, value: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const {
    time,
    format,
    onChange,
  } = props;
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const handleClick = () => {
    setFocused(!focused);
  };
  const handleTimeChange = (value: any) => {
    onChange('time', value);
  };
  const handleFormatChange = (value: any) => {
    onChange('hours-format', value);
  };
  console.log(handleTimeChange, handleFormatChange);

  return (
    <SWrapper>
      <SContainer onClick={handleClick}>
        <SCalendarLabel variant={2} weight={500}>
          {`${time} ${format.toUpperCase()}`}
        </SCalendarLabel>
        <InlineSVG
          svg={timeIcon}
          fill={theme.colorsThemed.text.secondary}
          width="24px"
          height="24px"
        />
      </SContainer>
    </SWrapper>
  );
};

export default TimePicker;

const SWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const SContainer = styled.div`
  width: 100%;
  cursor: pointer;
  display: flex;
  padding: 12px 20px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  justify-content: space-between;

  transition: .2s linear;

  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quaternary};
  }
`;

const SCalendarLabel = styled(Text)``;
