/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';

// Components
import InlineSvg from '../../atoms/InlineSVG';
import DropdownSelect, {
  TDropdownSelectItem,
} from '../../atoms/DropdownSelect';

// Utils
import getLocalizedMonth from '../../../utils/getMonth';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import ArrowDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';
import Modal from '../../organisms/Modal';
import BirthDateMobileInput from '../BirthDateMobileInput';

const minDate = new Date(new Date().setFullYear(1900));

interface IOnboardingBirthDateInput {
  value?: newnewapi.IDateComponents;
  maxDate: Date;
  locale?: string;
  disabled: boolean;
  isValid: boolean;
  labelCaption: string;
  bottomCaption: string;
  errorCaption: string;
  onChange: (newValue: newnewapi.IDateComponents) => void;
  handleResetIsValid: () => void;
  handleSetActive?: () => void;
}

const OnboardingBirthDateInput: React.FunctionComponent<IOnboardingBirthDateInput> =
  ({
    value,
    maxDate,
    locale,
    disabled,
    isValid,
    labelCaption,
    bottomCaption,
    errorCaption,
    onChange,
    handleResetIsValid,
    handleSetActive,
  }) => {
    const theme = useTheme();
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const months: TDropdownSelectItem<number>[] = useMemo(
      () =>
        Array(12)
          .fill('')
          .map((_, i) => ({
            name: getLocalizedMonth(i, locale),
            value: i + 1,
          })),
      [locale]
    );

    const years: TDropdownSelectItem<number>[] = useMemo(() => {
      const workingArr: any[] = [];
      for (let i = maxDate.getFullYear(); i >= minDate.getFullYear(); i--) {
        workingArr.push({
          name: i.toString(),
          value: i,
        });
      }
      return workingArr;
    }, [maxDate]);

    const [availableDays, setAvailableDays] = useState<
      TDropdownSelectItem<number>[]
    >(() => {
      if (!value?.month || !value?.year) {
        return Array(31)
          .fill('')
          .map((_, i) => ({
            name: (i + 1).toString(),
            value: i + 1,
          }));
      }

      return Array(new Date(value?.year, value?.month, 0).getDate())
        .fill('')
        .map((_, i) => ({
          name: (i + 1).toString(),
          value: i + 1,
        }));
    });

    const handleUpdateDay = useCallback(
      (day: number) => {
        const working = { ...value };
        working.day = day;
        onChange(working);
      },
      [value, onChange]
    );

    const handleUpdateMonth = (month: number) => {
      const working = { ...value };
      working.month = month;
      onChange(working);
    };

    const handleUpdateYear = (year: number) => {
      const working = { ...value };
      working.year = year;
      onChange(working);
    };

    useEffect(() => {
      setAvailableDays(() => {
        if (!value?.month || !value?.year) {
          return Array(31)
            .fill('')
            .map((_, i) => ({
              name: (i + 1).toString(),
              value: i + 1,
            }));
        }
        return Array(new Date(value?.year, value?.month, 0).getDate())
          .fill('')
          .map((_, i) => ({
            name: (i + 1).toString(),
            value: i + 1,
          }));
      });
    }, [value?.month, value?.year, setAvailableDays]);

    useEffect(() => {
      if (
        value?.day &&
        availableDays.findIndex((o) => o.value === value.day) === -1
      ) {
        handleUpdateDay(availableDays[availableDays.length - 1].value);
      }
    }, [availableDays, handleUpdateDay, value?.day]);

    return (
      <>
        <SContainer
          onMouseEnter={() => handleSetActive?.()}
          onClickCapture={() => handleResetIsValid()}
        >
          <SLabel>{labelCaption}</SLabel>
          {!isMobile ? (
            <SDropdownsContainer isValid={isValid}>
              <DropdownSelect<number>
                closeOnSelect
                width='120px'
                label={value?.day ? value?.day.toString() : 'Day'}
                options={availableDays}
                selected={value?.day !== null ? value?.day : undefined}
                maxItems={6}
                onSelect={handleUpdateDay}
              />
              <DropdownSelect<number>
                closeOnSelect
                width='160px'
                label={
                  value?.month
                    ? months.find((o) => o.value === value.month)?.name!!
                    : 'Month'
                }
                options={months}
                selected={value?.month !== null ? value?.month : undefined}
                maxItems={6}
                onSelect={handleUpdateMonth}
              />
              <DropdownSelect<number>
                closeOnSelect
                width={isTablet ? '100%' : '120px'}
                label={
                  value?.year
                    ? years.find((o) => o.value === value.year)?.name!!
                    : 'Year'
                }
                options={years}
                selected={value?.year !== null ? value?.year : undefined}
                maxItems={6}
                onSelect={handleUpdateYear}
              />
            </SDropdownsContainer>
          ) : (
            <SLabelButton
              disabled={disabled ?? false}
              isValid={isValid}
              onClick={() => setIsModalOpen(true)}
            >
              <span>
                {value?.day && value.month && value.year
                  ? `${value?.day} ${months.find(
                      (o) => o.value === value?.month
                    )?.name!!} ${value?.year}`
                  : 'Set your date of birth'}
              </span>
              <SInlineSVG
                svg={ArrowDown}
                fill={theme.colorsThemed.text.quaternary}
                width='24px'
                height='24px'
                focused={isModalOpen}
              />
            </SLabelButton>
          )}
          {!isValid ? (
            <AnimatedPresence animation='t-09'>
              <SErrorDiv>
                <InlineSvg svg={AlertIcon} width='16px' height='16px' />
                {errorCaption}
              </SErrorDiv>
            </AnimatedPresence>
          ) : null}
        </SContainer>
        <Modal
          show={isModalOpen}
          custombackdropfiltervalue={1}
          onClose={() => setIsModalOpen(false)}
        >
          {isModalOpen && value && (
            <BirthDateMobileInput
              currentDate={value}
              months={months}
              years={years}
              handleChangeDate={onChange}
              handleClose={() => setIsModalOpen(false)}
            />
          )}
        </Modal>
      </>
    );
  };

OnboardingBirthDateInput.defaultProps = {
  value: undefined,
  locale: 'en-US',
  handleSetActive: () => {},
};

export default OnboardingBirthDateInput;

const SContainer = styled.div`
  position: relative;
  flex-direction: column;
  width: 100%;
`;

const SLabel = styled.div`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  margin-top: 16px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;

// Desktop
const SDropdownsContainer = styled.div<{
  isValid: boolean;
}>`
  display: flex;
  flex-direction: row;
  gap: 16px;

  button {
    border-width: 1px;
    border-style: solid;
    border-color: ${({ isValid, theme }) =>
      isValid ? 'transparent' : theme.colorsThemed.accent.error};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: 11px 20px 11px 20px;
  }

  ${({ theme }) => theme.media.tablet} {
    justify-content: space-between;
  }

  ${({ theme }) => theme.media.laptop} {
    justify-content: flex-start;
  }
`;

// Mobile
const SLabelButton = styled.button<{
  isValid: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  border-width: 1px;
  border-style: solid;
  border-color: ${({ isValid, theme }) =>
    isValid ? 'transparent' : theme.colorsThemed.accent.error};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  padding: 11px 20px 11px 20px;

  span {
    margin-right: 8px;
  }

  transition: 0.2s linear;

  &:focus {
    outline: none;
  }

  &:hover:enabled,
  &:focus:active {
    cursor: pointer;

    background-color: ${({ theme }) =>
      theme.colorsThemed.background.quaternary};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`
  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};
`;
