import React from 'react';
import styled from 'styled-components';

interface IProfileImageZoomSlider {
  value: number;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImageZoomSlider: React.FunctionComponent<IProfileImageZoomSlider> = ({
  value,
  min,
  max,
  step,
  ariaLabel,
  onChange,
}) => (
  <SSlider
    type="range"
    value={value}
    min={min}
    max={max}
    step={step}
    aria-labelledby={ariaLabel}
    onChange={onChange}
  />
);

export default ProfileImageZoomSlider;

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
    background: ${({ theme }) => theme.colorsThemed.grayscale.outlines1};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;

    height: 16px;
    width: 16px;
    border-radius: 48px;
    background: ${({ theme }) => theme.colorsThemed.text.primary};
    cursor: pointer;

    margin-top: -7px;

    transition: .1s ease-in-out;
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
    background: ${({ theme }) => theme.colorsThemed.grayscale.outlines1};
  }
  &::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colorsThemed.text.primary};
    cursor: pointer;

    transition: .1s ease-in-out;
  }
  &:hover::-moz-range-thumb {
    transform: scale(1.2);
  }
`;
