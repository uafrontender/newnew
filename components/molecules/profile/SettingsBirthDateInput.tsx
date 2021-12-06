/* eslint-disable arrow-body-style */
import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import DatePicker, { ReactDatePickerCustomHeaderProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CalendarIcon from '../../../public/images/svg/icons/filled/Calendar.svg';

// Signs
import findAstrologySign, { IAstrologySigns } from '../../../utils/findAstrologySign';
import CakeIcon from '../../../public/images/png/astrology-signs/Cake.png';
import SagittariusIcon from '../../../public/images/png/astrology-signs/Sagittarius.png';
import DropdownSelect from '../../atoms/DropdownSelect';

const signs: IAstrologySigns = {
  Cake: CakeIcon,
  Aquarius: SagittariusIcon,
  Pisces: SagittariusIcon,
  Aries: SagittariusIcon,
  Taurus: SagittariusIcon,
  Gemini: SagittariusIcon,
  Cancer: SagittariusIcon,
  Leo: SagittariusIcon,
  Virgo: SagittariusIcon,
  Libra: SagittariusIcon,
  Scorpio: SagittariusIcon,
  Sagittarius: SagittariusIcon,
  Capricorn: SagittariusIcon,
};

interface ISettingsBirthDateInput {
  value?: Date;
  disabled: boolean;
  labelCaption: string;
  bottomCaption: string;
  onChange: (date: Date) => void;
}

const minDate = new Date(new Date().setFullYear(1900));
const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

const SettingsBirthDateInput: React.FunctionComponent<ISettingsBirthDateInput> = ({
  value,
  disabled,
  labelCaption,
  bottomCaption,
  onChange,
}) => {
  const theme = useTheme();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleToggleCalendarOpen = () => setCalendarOpen((curr) => !curr);

  const handleRenderCustomHeader = (props: ReactDatePickerCustomHeaderProps) => {
    console.log(props);

    return (
      <SDatePickerHeader>
        <DropdownSelect<number>
          label={props.date.getFullYear().toString()}
          options={[
            {
              name: '1999',
              value: 1999,
            },
            {
              name: '2000',
              value: 2000,
            },
          ]}
          selected={props.date.getFullYear()}
          onSelect={(val) => props.changeYear(val)}
        />
      </SDatePickerHeader>
    );
  };

  return (
    <SContainer>
      <SLabel>
        { labelCaption }
      </SLabel>
      <SAstrologyImg
        src={signs[findAstrologySign(value)].src}
      />
      <CalendarButton
        type="button"
      >
        <InlineSvg
          svg={CalendarIcon}
          width="24px"
          height="24px"
          fill={!calendarOpen
            ? theme.colorsThemed.text.quaternary : theme.colorsThemed.text.primary}
        />
      </CalendarButton>
      <SDatePicker>
        <DatePicker
          disabled={disabled}
          selected={value ?? undefined}
          placeholderText="DD-MM-YY"
          dateFormat="dd-MM-yy"
          minDate={minDate}
          maxDate={maxDate}
          showMonthDropdown
          showYearDropdown
          renderCustomHeader={handleRenderCustomHeader}
          // renderDayContents={handleRenderDayContents}
          onChange={onChange}
          onCalendarOpen={() => handleToggleCalendarOpen()}
          onCalendarClose={() => handleToggleCalendarOpen()}
        />
      </SDatePicker>
      <SBottomCaption>
        { bottomCaption }
      </SBottomCaption>
    </SContainer>
  );
};

SettingsBirthDateInput.defaultProps = {
  value: undefined,
};

export default SettingsBirthDateInput;

const SContainer = styled.div`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 272px;
  }

  ${({ theme }) => theme.media.desktop} {
    width: 224px;
  }
`;

const SLabel = styled.div`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

const SBottomCaption = styled.div`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-top: 6px;
`;

const SAstrologyImg = styled.img`
  position: absolute;
  left: 20px;
  top: calc(50% - 11px);


  width: 24px;
  height: 24px;

  z-index: 5;
`;

const CalendarButton = styled.button`
  position: absolute;
  right: 20px;
  top: calc(50% - 11px);

  background: none;

  width: 24px;
  height: 24px;

  z-index: 1;

  outline: none;
  border: none;

  &:focus {
    outline: none;
  }
`;

const SDatePicker = styled.div`
  display: block;
  width: 100%;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  .react-datepicker-wrapper {

    .react-datepicker__input-container {
      height: 44px;
      width: 100%;

      input {
        width: 100%;
        color: ${({ theme }) => theme.colorsThemed.text.primary};

        border-radius: ${({ theme }) => theme.borderRadius.medium};
        border-width: 1.5px;
        border-style: solid;
        border-color: ${({ theme }) => theme.colorsThemed.background.outlines1};

        color: ${({ theme }) => theme.colorsThemed.text.primary};
        background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

        padding: 12px 20px 12px 52px;

        font-weight: 500;
        font-size: 14px;
        line-height: 20px;

        color: ${({ theme }) => theme.colorsThemed.text.primary};

        &:hover:enabled, &:focus, &:active {
          outline: none;

          border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
        }
      }
    }
  }
  .react-datepicker-popper {
    width: 356px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: transparent;

    color: ${({ theme }) => theme.colorsThemed.text.primary};

    background: ${({ theme }) => theme.colorsThemed.background.secondary};
    box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.2);

    div {
      border: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      .react-datepicker {
        background: transparent;

        .react-datepicker__triangle, .react-datepicker__navigation {
          display: none;
        }

        .react-datepicker__month-container {
          .react-datepicker__header {
            background: transparent;

            .react-datepicker__current-month {
              display: none;
            }

            .react-datepicker__header__dropdown {
              display: flex;

              .react-datepicker__month-dropdown-container {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                padding: 12px 12px 12px 20px;

                background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
                border-radius: ${({ theme }) => theme.borderRadius.medium};
              }

              .react-datepicker__year-dropdown-container {

              }
            }
          }
        }
      }

    }
  }
`;

const SDatePickerHeader = styled.div`
  display: flex;
`;
