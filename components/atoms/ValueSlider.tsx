import React from 'react';
import styled, { useTheme } from 'styled-components';

import Button from './Button';
import InlineSvg from './InlineSVG';

import MinusIcon from '../../public/images/svg/icons/outlined/Minus.svg';
import PlusIcon from '../../public/images/svg/icons/outlined/Plus.svg';

interface IValueSlider {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (newValue: number) => void;
  handleIncrement: () => void;
  handleDecrement: () => void;
}

const ValueSlider: React.FunctionComponent<IValueSlider> = ({
  value,
  min,
  max,
  step,
  onChange,
  handleIncrement,
  handleDecrement,
}) => {
  const theme = useTheme();

  return (
    <SSliderWrapper>
      <Button
        iconOnly
        size='sm'
        view='transparent'
        disabled={value <= min}
        onClick={handleDecrement}
      >
        <InlineSvg
          svg={MinusIcon}
          fill={theme.colorsThemed.text.primary}
          width='24px'
          height='24px'
        />
      </Button>
      <SSlider
        type='range'
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <Button
        iconOnly
        size='sm'
        view='transparent'
        disabled={value >= max}
        onClick={handleIncrement}
      >
        <InlineSvg
          svg={PlusIcon}
          fill={theme.colorsThemed.text.primary}
          width='24px'
          height='24px'
        />
      </Button>
    </SSliderWrapper>
  );
};

export default ValueSlider;

const SSliderWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    justify-content: center;

    margin-top: 24px;
    padding: 0px 24px;

    button {
      background: transparent;

      &:hover:enabled {
        background: transparent;
        cursor: pointer;
      }
      &:focus:enabled {
        background: transparent;
        cursor: pointer;
      }
    }

    input {
      margin: 0px 12px;
    }
  }
`;

const SSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  display: block;

  background-color: transparent;

  height: 48px;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-color: transparent;
    background: ${({ theme }) => theme.colorsThemed.background.outlines1};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;

    height: 16px;
    width: 16px;
    border-radius: 48px;
    background: ${({ theme }) => theme.colorsThemed.text.primary};
    cursor: pointer;

    margin-top: -7px;

    transition: 0.1s ease-in-out;
  }

  &:focus::-webkit-slider-runnable-track {
  }

  &:hover::-webkit-slider-thumb {
    transform: scale(1.2);
  }

  &::-moz-range-track {
    height: 4px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-color: transparent;
    background: ${({ theme }) => theme.colorsThemed.background.outlines1};
  }
  &::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colorsThemed.text.primary};
    cursor: pointer;

    transition: 0.1s ease-in-out;
  }
  &:hover::-moz-range-thumb {
    transform: scale(1.2);
  }
`;
