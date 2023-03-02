import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import CalendarScrollableVertically from '../../atoms/creation/calendar/CalendarScrollableVertically';
import InlineSVG from '../../atoms/InlineSVG';
import CustomToggle from '../CustomToggle';
import TimePicker from './TimePicker';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';

import { DAYS } from '../../../constants/general';

interface IMobileFieldBlock {
  id: string;
  type?: 'input' | 'select' | 'date' | '';
  value: any;
  options?: {}[];
  onChange: (key: string, value: string | number | boolean | object) => void;
  inputProps?: {
    min?: number;
    type?: 'text' | 'number' | 'tel';
    pattern?: string;
    max?: number;
    customPlaceholder?: string;
  };
  formattedValue?: any;
  formattedDescription?: any;
}

// This component is overloaded and produces unnecessary hook instances
// TODO: rework, separate 'input' | 'select' | 'date' into own components.
// Provide type safety for all properties
// TODO: this component sets Moment object to value.date, causing an error in the console
// 'A non-serializable value was detected in the state'
const MobileFieldBlock: React.FC<IMobileFieldBlock> = (props) => {
  const {
    id,
    type,
    value,
    options,
    inputProps,
    formattedValue,
    formattedDescription,
    onChange,
  } = props;

  const inputRef: any = useRef();
  const theme = useTheme();
  const { t } = useTranslation('page-Creation');
  const [focused, setFocused] = useState(false);

  const isDaySame = useMemo(() => {
    const selectedDate = moment(value?.date).startOf('D');
    if (selectedDate) {
      return selectedDate?.isSame(moment().startOf('day'));
    }

    return false;
  }, [value?.date]);

  const maxDate = useMemo(() => {
    if (value?.type === 'right-away') {
      return moment();
    }

    // If today is the last day of the month, max date is the last day of next month
    if (moment().endOf('day').isSame(moment().endOf('month'))) {
      return moment().add(1, 'M').endOf('month');
    }

    return moment().add(1, 'M');
  }, [value?.type]);

  const { isTimeOfTheDaySame, localTimeOfTheDay } = useMemo(() => {
    const currentTime = moment();
    const h = currentTime.hour();
    const ltd = h >= 12 ? 'pm' : 'am';

    return {
      isTimeOfTheDaySame: ltd === value?.['hours-format'],
      localTimeOfTheDay: ltd,
    };
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleClick = useCallback(() => {
    handleFocus();
  }, [handleFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);

    if (inputProps?.type === 'number' && (inputProps?.min as number) > value) {
      onChange(id, inputProps?.min as number);
    }
    if (inputProps?.type === 'number' && (inputProps?.max as number) < value) {
      onChange(id, inputProps?.max as number);
    }
  }, [inputProps, id, onChange, value]);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderItem = useCallback(
    (item: any) => {
      const handleItemClick = () => {
        onChange(id, item.id);
        handleBlur();
      };
      const selected = item.id === value;

      return (
        <SButton
          key={`select-${id}-${item.id}`}
          view={selected ? 'modalSecondarySelected' : 'modalSecondary'}
          onClick={handleItemClick}
          selected={selected}
        >
          <SItemTitle variant={3} weight={600}>
            {item.title}
          </SItemTitle>
        </SButton>
      );
    },
    [id, onChange, handleBlur, value]
  );

  const getModal = useCallback(() => {
    if (type === 'select') {
      return (
        <SModal show={focused} onClose={handleBlur}>
          <SMobileListContainer focused={focused}>
            <SMobileList>{options?.map(renderItem)}</SMobileList>
            <SCancelButton view='modalSecondary' onClick={handleBlur}>
              {t('secondStep.button.cancel')}
            </SCancelButton>
          </SMobileListContainer>
        </SModal>
      );
    }

    if (type === 'date') {
      const typeOptions = [
        {
          id: 'schedule',
          title: t('secondStep.field.startsAt.modal.type.schedule'),
        },
        {
          id: 'right-away',
          title: t('secondStep.field.startsAt.modal.type.right-away'),
        },
      ];
      const formatOptions = [
        {
          id: 'am',
          title: t('secondStep.field.startsAt.modal.hoursFormat.am'),
        },
        {
          id: 'pm',
          title: t('secondStep.field.startsAt.modal.hoursFormat.pm'),
        },
      ];

      const renderDay = (el: any) => (
        <SDay key={el.value} variant={1} weight={500}>
          {t(`secondStep.field.startsAt.modal.days.${el.value}` as any)}
        </SDay>
      );

      const handleScheduleChange = (selectedId: string) => {
        if (selectedId === 'right-away') {
          onChange(id, { date: new Date() });
          onChange(id, {
            time: moment().format('hh:mm'),
          });
          onChange(id, {
            'hours-format': moment().format('a'),
          });
        }
        onChange(id, { type: selectedId });
      };

      const handleHoursFormatChange = (selectedId: string) => {
        onChange(id, { 'hours-format': selectedId });
      };

      const handleTimeChange = (e: any) => {
        onChange(id, { time: e.target.value });
      };

      const handleDateChange = (date: any) => {
        onChange(id, { date });

        // Date here is a moment
        const resultingDate = moment(
          `${date.format('YYYY-MM-DD')}  ${value.time}`
        );

        if (resultingDate.isBefore(moment())) {
          onChange(id, {
            time: moment().format('hh:mm'),
          });

          onChange(id, {
            'hours-format': moment().format('a'),
          });
        }
      };

      return (
        <SModal show={focused} onClose={handleBlur}>
          <SMobileDateContainer focused={focused}>
            <SMobileDateContent onClick={preventCLick}>
              <SModalTopLine>
                <SModalTitle variant={6}>
                  {t('secondStep.field.startsAt.modal.title')}
                </SModalTitle>
                <SInlineSVGWrapper onClick={handleBlur}>
                  <SInlineSVG
                    svg={closeIcon}
                    fill={theme.colorsThemed.text.primary}
                    width='20px'
                    height='20px'
                  />
                </SInlineSVGWrapper>
              </SModalTopLine>
              <SModalToggleWrapper>
                <CustomToggle
                  options={typeOptions}
                  selected={value?.type}
                  onChange={handleScheduleChange}
                />
              </SModalToggleWrapper>
              <SCustomDays>{DAYS.map(renderDay)}</SCustomDays>
              <SSeparator />
              <SCalendarWrapper>
                <SCalendarTopGrad />
                <SCalendarContent>
                  <CalendarScrollableVertically
                    minDate={moment()}
                    maxDate={maxDate}
                    onSelect={handleDateChange}
                    selectedDate={moment(value?.date).startOf('D')}
                  />
                </SCalendarContent>
                <SCalendarBottomGrad />
              </SCalendarWrapper>
              <SSeparator />
              <SModalToggleWrapper>
                <STimePickerWrapper>
                  <TimePicker
                    disabled={value?.type === 'right-away'}
                    value={value?.time}
                    hoursFormat={value['hours-format']}
                    isDaySame={isDaySame}
                    isTimeOfTheDaySame={isTimeOfTheDaySame}
                    localTimeOfTheDay={localTimeOfTheDay as any}
                    onChange={handleTimeChange}
                  />
                </STimePickerWrapper>
                <CustomToggle
                  disabled={
                    value?.type === 'right-away' ||
                    (isDaySame &&
                      localTimeOfTheDay === 'pm' &&
                      value?.['hours-format'] === 'pm')
                  }
                  options={formatOptions}
                  selected={value?.['hours-format']}
                  onChange={handleHoursFormatChange}
                />
              </SModalToggleWrapper>
              <SScheduleButton view='primaryGrad' onClick={handleBlur}>
                {t('secondStep.button.schedule')}
              </SScheduleButton>
            </SMobileDateContent>
          </SMobileDateContainer>
        </SModal>
      );
    }

    return false;
  }, [
    type,
    focused,
    handleBlur,
    options,
    renderItem,
    t,
    theme.colorsThemed.text.primary,
    value,
    isDaySame,
    isTimeOfTheDaySame,
    localTimeOfTheDay,
    maxDate,
    onChange,
    id,
  ]);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focused, inputRef]);
  const inputLabel = t(`secondStep.field.${id}.label` as any);

  return (
    <>
      {getModal()}
      <SContainer onClick={handleClick}>
        <STitle variant={2} weight={700}>
          {t(`secondStep.field.${id}.title` as any)}
        </STitle>
        {type === 'input' ? (
          <SInputWrapper>
            {inputLabel && <SInputLabel htmlFor={id}>{inputLabel}</SInputLabel>}
            <SInput
              id={id}
              ref={inputRef}
              value={value}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onChange={handleChange}
              withLabel={!!inputLabel}
              placeholder={
                inputProps?.customPlaceholder ??
                t(`secondStep.field.${id}.placeholder` as any)
              }
              {...inputProps}
            />
          </SInputWrapper>
        ) : (
          <SValue variant={6}>
            {t(`secondStep.field.${id}.value` as any, {
              value: formattedValue || value,
            })}
          </SValue>
        )}
        <SDescription variant={2} weight={700}>
          {t(`secondStep.field.${id}.description` as any, {
            value: formattedDescription || value,
          })}
        </SDescription>
      </SContainer>
    </>
  );
};

export default MobileFieldBlock;

MobileFieldBlock.defaultProps = {
  type: '',
  options: [],
  inputProps: {
    type: 'text',
  },
  formattedValue: '',
  formattedDescription: '',
};

const SContainer = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px;
  overflow: hidden;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  flex-direction: column;
`;

const STitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const SValue = styled(Headline)`
  margin-top: 16px;
`;

const SDescription = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin-top: 2px;
`;

const SInputLabel = styled.label`
  top: 50%;
  left: 0;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  position: absolute;
  transform: translateY(-50%);
  font-weight: bold;

  font-size: 18px;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;

const SInputWrapper = styled.div`
  height: 26px;
  position: relative;
  margin-top: 16px;
`;

interface ISInput {
  withLabel: boolean;
}

const SInput = styled.input<ISInput>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding-left: ${(props) => (props.withLabel ? '10px' : '0')};

  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  font-size: 18px;
  font-weight: bold;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;

const SModal = styled(Modal)`
  & > div:first-child {
    z-index: 2;
  }
`;

interface ISMobileListContainer {
  focused: boolean;
}

const SMobileListContainer = styled.div<ISMobileListContainer>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  padding: 16px;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileDateContainer = styled.div<ISMobileListContainer>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileDateContent = styled.div`
  display: flex;
  padding: 16px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  flex-direction: column;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  z-index: 3;

  overflow-y: auto;
`;

const SMobileList = styled.div`
  display: flex;
  padding: 12px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};

  z-index: 3;

  overflow-y: auto;
`;

interface ISButton {
  selected: boolean;
}

const SButton = styled(Button)<ISButton>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 16px;

  flex-shrink: 0;

  ${(props) => props.theme.media.tablet} {
    min-width: 136px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;

  z-index: 3;
`;

const SScheduleButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 12px;
  margin-bottom: 8px;
  height: 56px;
  flex-shrink: 0;
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  text-align: center;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
  }
`;

const SModalTopLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;
`;

const SModalTitle = styled(Headline)``;

const SInlineSVGWrapper = styled.div`
  cursor: pointer;
  padding: 16px;
`;

const SInlineSVG = styled(InlineSVG)``;

const SModalToggleWrapper = styled.div`
  width: 100%;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SSeparator = styled.div`
  width: 100%;
  height: 1px;
  border-radius: 2px;
  background-color: ${(props) => props.theme.colorsThemed.background.outlines1};
  // Otherwise blue color of selected number goes through
  z-index: 2;
`;

const SCustomDays = styled.div`
  display: flex;
  padding: 18px 0;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
`;

const SDay = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SCalendarWrapper = styled.div`
  position: relative;
`;

const SCalendarContent = styled.div`
  height: 325px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const SCalendarTopGrad = styled.div`
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.calendarTop};
  pointer-events: none;
`;

const SCalendarBottomGrad = styled.div`
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.calendarBottom};
  pointer-events: none;
`;

const STimePickerWrapper = styled.div`
  margin-right: 10px;
`;
