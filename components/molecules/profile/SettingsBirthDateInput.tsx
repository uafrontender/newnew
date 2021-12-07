/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-plusplus */
/* eslint-disable arrow-body-style */
import React, { forwardRef, useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import DatePicker, { ReactDatePickerCustomHeaderProps, registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Components
import InlineSvg from '../../atoms/InlineSVG';
import DropdownSelect, { TDropdownSelectItem } from '../../atoms/DropdownSelect';

// Icons
import CalendarIcon from '../../../public/images/svg/icons/filled/Calendar.svg';
// Signs
import CakeIcon from '../../../public/images/png/astrology-signs/Cake.png';
import SagittariusIcon from '../../../public/images/png/astrology-signs/Sagittarius.png';

// Datepicker utils
import findAstrologySign, { IAstrologySigns } from '../../../utils/findAstrologySign';
import getLocalizedMonth from '../../../utils/getMonth';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';

for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
  let localeName = SUPPORTED_LANGUAGES[i];

  if (localeName === 'en') localeName = 'en-us';
  if (localeName === 'es-MX') localeName = 'es';

  const importedLocale = require(`date-fns/locale/${localeName}/index.js`);
  registerLocale(SUPPORTED_LANGUAGES[i], importedLocale as any);
}
const minDate = new Date(new Date().setFullYear(1900));
const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));
const years: TDropdownSelectItem<number>[] = [];
for (let i = minDate.getFullYear(); i <= maxDate.getFullYear(); i++) {
  years.push({
    name: i.toString(),
    value: i,
  });
}

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
  locale?: string;
  disabled: boolean;
  labelCaption: string;
  bottomCaption: string;
  onChange: (date: Date) => void;
}

const SettingsBirthDateInput: React.FunctionComponent<ISettingsBirthDateInput> = ({
  value,
  locale,
  disabled,
  labelCaption,
  bottomCaption,
  onChange,
}) => {
  const theme = useTheme();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const months: TDropdownSelectItem<number>[] = Array(12).fill('').map((_, i) => {
    return {
      name: getLocalizedMonth(i, locale),
      value: i,
    };
  });

  const handleToggleCalendarOpen = () => setCalendarOpen((curr) => !curr);

  const handleRenderCustomHeader = (props: ReactDatePickerCustomHeaderProps) => {
    return (
      <SDatePickerHeader>
        <DropdownSelect<number>
          label={props.date.getFullYear().toString()}
          options={years}
          selected={props.date.getFullYear()}
          width="110px"
          maxItems={4}
          closeOnSelect
          onSelect={(val) => props.changeYear(val)}
        />
        <DropdownSelect<number>
          label={getLocalizedMonth(props.date.getMonth(), locale)}
          options={months}
          selected={props.date.getMonth()}
          width="183px"
          maxItems={4}
          closeOnSelect
          onSelect={(val) => props.changeMonth(val)}
        />
      </SDatePickerHeader>
    );
  };

  const CustomInputForwardRef = forwardRef<
    HTMLInputElement,
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
  >>((props, ref) => {
    console.log(props);

    return (
      <SCustomInput>
        <input
          ref={ref}
          value={props.value}
          placeholder={props.placeholder}
          onClick={() => {}}
          // {...props}
        />
        <CalendarButton
          type="button"
          onClick={props.onClick as any}
        >
          <InlineSvg
            svg={CalendarIcon}
            width="24px"
            height="24px"
            fill={!calendarOpen
              ? theme.colorsThemed.text.quaternary : theme.colorsThemed.text.primary}
          />
        </CalendarButton>
      </SCustomInput>
    );
  });

  useEffect(() => {
    console.log(`Current value is: ${value}`);
  }, [value]);

  return (
    <SContainer>
      <SLabel>
        { labelCaption }
      </SLabel>
      <SAstrologyImg
        src={signs[findAstrologySign(value)].src}
      />
      <SDatePicker>
        <DatePicker
          disabled={disabled}
          selected={value ?? undefined}
          placeholderText="DD-MM-YY"
          dateFormat="dd-MM-yy"
          minDate={minDate}
          maxDate={maxDate}
          shouldCloseOnSelect={false}
          fixedHeight
          // Locales
          locale={locale ?? 'en-US'}
          formatWeekDay={(d) => d[0].toUpperCase()}
          // Custom render props
          renderCustomHeader={handleRenderCustomHeader}
          customInput={<CustomInputForwardRef />}
          // Calendar
          popperPlacement="top-end"
          popperModifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 6],
              },
            },
          ]}
          // Handlers
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
  locale: 'en-US',
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

      .react-datepicker {
        background: transparent;
        width: 100%;

        .react-datepicker__triangle, .react-datepicker__navigation {
          display: none;
        }

        .react-datepicker__month-container {
          width: 100%;


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

            .react-datepicker__day-names {
              display: flex;
              gap: 16px;

              padding-left: 34px;
              padding-right: 34px;

              div {
                font-weight: 500;
                font-size: 16px;
                line-height: 24px;
                color: ${({ theme }) => theme.colorsThemed.text.tertiary};
              }
            }
          }

          // Days
          .react-datepicker__month {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .react-datepicker__week {
              display: flex;
              gap: 16px;

              padding-left: 28px;
              padding-right: 28px;

              div {
                font-weight: 500;
                font-size: 16px;
                line-height: 24px;
              }

              .react-datepicker__day {
                color: ${({ theme }) => theme.colorsThemed.text.primary};

                &:hover {
                  position: relative;
                  color: #FFFFFF;
                  background: transparent;

                  &:before {
                    position: absolute;
                    top: calc(50% - 22px);
                    left: calc(50% - 22px);
                    content: '';

                    width: 44px;
                    height: 44px;
                    border-radius: 50%;

                    background: ${({ theme }) => theme.colorsThemed.accent.blue};

                    z-index: -1;
                  }
                }
              }

              .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
                position: relative;
                color: #FFFFFF;
                background: transparent;
                outline: none;

                &:before {
                  position: absolute;
                  top: calc(50% - 22px);
                  left: calc(50% - 22px);
                  content: '';

                  width: 44px;
                  height: 44px;
                  border-radius: 50%;

                  background: ${({ theme }) => theme.colorsThemed.accent.blue};

                  z-index: -1;
                }
              }

              .react-datepicker__day--outside-month {
                color: ${({ theme }) => theme.colorsThemed.text.quaternary};
              }

              .react-datepicker__day--disabled {
                opacity: 0.5;
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
  justify-content: flex-start;
  gap: 16px;

  width: 100%;
  padding: 16px 24px !important;
`;

const SCustomInput = styled.div`


`;
