/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable arrow-body-style */
import React, { forwardRef, useState, useEffect, useRef, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import DatePicker, {
  ReactDatePickerCustomHeaderProps,
  registerLocale,
} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

// Components
import InlineSvg from '../../atoms/InlineSVG';
import DropdownSelect, {
  TDropdownSelectItem,
} from '../../atoms/DropdownSelect';

// Icons
import CalendarIcon from '../../../public/images/svg/icons/filled/Calendar.svg';
// Signs
import CakeIcon from '../../../public/images/png/astrology-signs/Cake.png';
import AquariusIcon from '../../../public/images/png/astrology-signs/Aquarius.png';
import PiscesIcon from '../../../public/images/png/astrology-signs/Pisces.png';
import AriesIcon from '../../../public/images/png/astrology-signs/Aries.png';
import TaurusIcon from '../../../public/images/png/astrology-signs/Taurus.png';
import GeminiIcon from '../../../public/images/png/astrology-signs/Gemini.png';
import CancerIcon from '../../../public/images/png/astrology-signs/Cancer.png';
import LeoIcon from '../../../public/images/png/astrology-signs/Leo.png';
import VirgoIcon from '../../../public/images/png/astrology-signs/Virgo.png';
import LibraIcon from '../../../public/images/png/astrology-signs/Libra.png';
import ScorpioIcon from '../../../public/images/png/astrology-signs/Scorpio.png';
import SagittariusIcon from '../../../public/images/png/astrology-signs/Sagittarius.png';
import CapricornIcon from '../../../public/images/png/astrology-signs/Capricorn.png';
import InputInvalidIcon from '../../../public/images/png/astrology-signs/InputInvalid.png';

// Datepicker utils
import findAstrologySign, {
  IAstrologySigns,
} from '../../../utils/findAstrologySign';
import getLocalizedMonth from '../../../utils/getMonth';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import AnimatedPresence from '../../atoms/AnimatedPresence';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import { useAppSelector } from '../../../redux-store/store';
import getDateFormatForTimeZone from '../../../utils/getDateFormatForTimeZone';
import { useAppState } from '../../../contexts/appStateContext';

// Import and register locales (for weekdays)
for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
  let localeName = SUPPORTED_LANGUAGES[i];

  if (localeName === 'en') localeName = 'en-us';
  if (localeName === 'es-MX') localeName = 'es';
  if (localeName === 'zh') localeName = 'zh-TW';

  const importedLocale = require(`date-fns/locale/${localeName}/index.js`);
  registerLocale(SUPPORTED_LANGUAGES[i], importedLocale as any);
}
const minDate = new Date(1900, 0);

const signs: IAstrologySigns = {
  Cake: CakeIcon,
  Aquarius: AquariusIcon,
  Pisces: PiscesIcon,
  Aries: AriesIcon,
  Taurus: TaurusIcon,
  Gemini: GeminiIcon,
  Cancer: CancerIcon,
  Leo: LeoIcon,
  Virgo: VirgoIcon,
  Libra: LibraIcon,
  Scorpio: ScorpioIcon,
  Sagittarius: SagittariusIcon,
  Capricorn: CapricornIcon,
  Invalid: InputInvalidIcon,
};

interface ISettingsBirthDateInput {
  value?: Date;
  maxDate: Date;
  locale?: string;
  submitError?: string;
  disabled: boolean;
  labelCaption: string;
  bottomCaption: string;
  onChange: (date: Date) => void;
  handleSetActive?: () => void;
  handleResetSubmitError: () => void;
}

const SettingsBirthDateInput: React.FunctionComponent<ISettingsBirthDateInput> =
  React.memo(
    ({
      value,
      maxDate,
      locale,
      submitError,
      disabled,
      labelCaption,
      bottomCaption,
      onChange,
      handleSetActive,
      handleResetSubmitError,
    }) => {
      const theme = useTheme();
      const { resizeMode } = useAppState();
      const user = useAppSelector((state) => state.user);

      const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
        resizeMode
      );

      const [calendarOpen, setCalendarOpen] = useState(false);
      const months: TDropdownSelectItem<number>[] = useMemo(
        () =>
          Array(12)
            .fill('')
            .map((_, i) => {
              return {
                name: getLocalizedMonth(i, locale),
                value: i,
              };
            }),
        [locale]
      );
      const years: TDropdownSelectItem<number>[] = useMemo(() => {
        const workingArr = [];
        for (let i = maxDate.getFullYear(); i >= minDate.getFullYear(); i--) {
          workingArr.push({
            name: i.toString(),
            value: i,
          });
        }
        return workingArr;
      }, [maxDate]);

      const handleToggleCalendarOpen = () => {
        if (submitError) {
          handleResetSubmitError();
        }
        setCalendarOpen((curr) => !curr);
      };

      const handleRenderCustomHeader = (
        props: ReactDatePickerCustomHeaderProps
      ) => {
        return (
          <SDatePickerHeader>
            <DropdownSelect<number>
              label={props.date.getFullYear().toString()}
              options={years}
              selected={props.date.getFullYear()}
              width='110px'
              maxItems={4}
              closeOnSelect
              onSelect={(val) => props.changeYear(val)}
            />
            <DropdownSelect<number>
              label={getLocalizedMonth(props.date.getMonth(), locale)}
              options={months}
              selected={props.date.getMonth()}
              width='183px'
              maxItems={4}
              closeOnSelect
              onSelect={(val) => props.changeMonth(val)}
            />
          </SDatePickerHeader>
        );
      };

      // eslint-disable-next-line react/no-unstable-nested-components
      const CustomInputForwardRef = forwardRef<
        HTMLInputElement,
        React.DetailedHTMLProps<
          React.InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >
      >((props, ref) => {
        const [inputData, setInputData] = useState(props.value);

        const [placeholder, setPlaceholder] = useState(props.placeholder);
        const explicitInputRef = useRef<HTMLInputElement>();

        const imageSrc = useMemo(() => {
          if (
            props.value &&
            props.value instanceof Date &&
            props.value === inputData
          ) {
            return signs[findAstrologySign(props.value)].src;
          }

          if (inputData?.toString().length === 0) {
            return CakeIcon.src;
          }

          const parsedDate = moment(
            inputData?.toString(),
            getDateFormatForTimeZone(user.userData?.timeZone)
          ).toDate();

          if (
            parsedDate instanceof Date &&
            !Number.isNaN((parsedDate as Date).valueOf()) &&
            (parsedDate as Date) < maxDate
          ) {
            return signs[findAstrologySign(value)].src;
          }
          return InputInvalidIcon.src;
        }, [props.value, inputData]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // Input contains invalid characters
          if (e.target.value.length > 0 && !e.target.value.match(/^[0-9-]+$/)) {
            return;
          }

          // Input too long
          if (e.target.value.length > 8) return;

          // No hyphen
          if (
            (e.target.value.length === 3 || e.target.value.length === 6) &&
            e.target.value.charAt(e.target.value.length - 1) !== '-'
          ) {
            return;
          }

          // Insert hyphen
          if (
            (e.target.value.length === 2 || e.target.value.length === 5) &&
            e.target.value.length > (inputData as string)?.length
          ) {
            e.target.value += '-';
            setInputData(e.target.value);
            props.onChange?.(e);
            return;
          }

          setInputData(e.target.value);

          // The length is valid, call the outer onChange()
          if (e.target.value.length === 8 || e.target.value.length === 0) {
            props.onChange?.(e);
          }
        };

        useEffect(() => {
          const arr1 = Array((inputData as string).length).fill(' ');
          const arr = arr1.map((val, i) => {
            if (i === 2 || i === 5) {
              return '<span>&nbsp;</span>';
            }
            return '<span>&nbsp;&nbsp;&nbsp;</span>';
          });
          const newVal =
            arr.join('') +
            (props.placeholder?.slice((inputData as string).length) || '');
          setPlaceholder(newVal);
        }, [inputData, props.placeholder]);

        return (
          <>
            <SAstrologyImg
              src={imageSrc}
              onClick={() => {
                explicitInputRef.current?.focus();
              }}
            />
            <SCustomInput>
              <SInput
                ref={(node) => {
                  explicitInputRef.current = node!!;
                  (ref as Function)(node);
                }}
                readOnly
                disabled={props.disabled}
                inputMode='numeric'
                value={inputData}
                onChange={handleChange}
                onPaste={(e) => e.preventDefault()}
                onFocus={props.disabled ? () => {} : (props.onClick as any)}
              />
              <SPseudoPlaceholder
                dangerouslySetInnerHTML={{
                  __html: placeholder ?? '',
                }}
                onClick={() => explicitInputRef.current?.focus()}
              />
              <CalendarButton
                type='button'
                disabled={props.disabled}
                onClick={props.disabled ? () => {} : (props.onClick as any)}
              >
                <InlineSvg
                  svg={CalendarIcon}
                  width='24px'
                  height='24px'
                  fill={
                    !calendarOpen
                      ? theme.colorsThemed.text.quaternary
                      : theme.colorsThemed.text.primary
                  }
                />
              </CalendarButton>
            </SCustomInput>
          </>
        );
      });

      return (
        <SContainer onMouseEnter={() => handleSetActive?.()}>
          <SLabel>{labelCaption}</SLabel>
          {/* <SAstrologyImg
        src={signs[findAstrologySign(value)].src}
      /> */}
          <SDatePicker>
            <DatePicker
              disabled={disabled}
              selected={value ?? undefined}
              placeholderText={getDateFormatForTimeZone(
                user.userData?.timeZone
              ).toUpperCase()}
              dateFormat={getDateFormatForTimeZone(
                user.userData?.timeZone,
                true
              )}
              minDate={minDate}
              maxDate={maxDate}
              shouldCloseOnSelect={false}
              fixedHeight
              preventOpenOnFocus
              adjustDateOnChange
              onInputClick={() => {}}
              // Locales
              locale={locale ?? 'en-US'}
              formatWeekDay={(d) => d[0].toUpperCase()}
              // Custom render elements
              renderCustomHeader={handleRenderCustomHeader}
              customInput={<CustomInputForwardRef disabled={disabled} />}
              // Calendar
              popperPlacement={isMobile ? 'bottom' : 'bottom-end'}
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
          <SBottomCaption>{bottomCaption}</SBottomCaption>
          {submitError ? (
            <AnimatedPresence animateWhenInView={false} animation='t-09'>
              <SErrorDiv>
                <InlineSvg svg={AlertIcon} width='16px' height='16px' />
                {submitError}
              </SErrorDiv>
            </AnimatedPresence>
          ) : null}
        </SContainer>
      );
    }
  );

SettingsBirthDateInput.defaultProps = {
  value: undefined,
  locale: 'en-US',
  handleSetActive: () => {},
  submitError: undefined,
};

export default SettingsBirthDateInput;

const SContainer = styled.div`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 272px;
  }

  ${({ theme }) => theme.media.laptop} {
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

  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  &:focus:enabled,
  &:hover:enabled {
    outline: none;

    svg {
      fill: ${({ theme }) => theme.colorsThemed.text.primary};
    }
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
        background-color: ${({ theme }) =>
          theme.colorsThemed.background.tertiary};

        padding: 12px 20px 12px 52px;

        font-weight: 500;
        font-size: 14px;
        line-height: 20px;

        color: ${({ theme }) => theme.colorsThemed.text.primary};

        &:hover:enabled,
        &:focus,
        &:active:not(:disabled) {
          outline: none;

          border-color: ${({ theme }) =>
            theme.colorsThemed.background.outlines2};
        }
      }
    }
  }
  .react-datepicker-popper {
    z-index: 6;
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

        .react-datepicker__triangle,
        .react-datepicker__navigation {
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

                background-color: ${({ theme }) =>
                  theme.colorsThemed.background.tertiary};
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

                @media (hover: hover) {
                  &:hover {
                    position: relative;
                    color: #ffffff;
                    background: transparent;

                    &:before {
                      position: absolute;
                      top: calc(50% - 22px);
                      left: calc(50% - 22px);
                      content: '';

                      width: 44px;
                      height: 44px;
                      border-radius: 50%;

                      background: ${({ theme }) =>
                        theme.colorsThemed.accent.blue};

                      z-index: -1;
                    }
                  }
                }

                @media (hover: none) {
                  &:hover {
                    background: transparent;
                  }
                }
              }

              .react-datepicker__day--selected,
              .react-datepicker__day--keyboard-selected {
                position: relative;
                color: #ffffff;
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

const SCustomInput = styled.div``;

const SPseudoPlaceholder = styled.div`
  position: absolute;
  white-space: nowrap;
  top: 0;
  left: 5;
  z-index: 1;

  padding: 14px 20px 12px 53.5px;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  cursor: text;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  margin-top: 6px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;

const SInput = styled.input`
  &:disabled {
    opacity: 0.6;
  }
`;
