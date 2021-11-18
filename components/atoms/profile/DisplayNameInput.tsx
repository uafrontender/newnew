import React, { useState } from 'react';
import styled from 'styled-components';

type TDisplayNameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
}

const DisplaynameInput: React.FunctionComponent<TDisplayNameInput> = ({
  value,
  isValid,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  return (
    <>
      <SDisplaynameInput
        value={value}
        errorBordersShown={errorBordersShown}
        onChange={onChange}
        onBlur={() => {
          if (!isValid) {
            setErrorBordersShown(true);
          } else {
            setErrorBordersShown(false);
          }
        }}
        onFocus={(e) => {
          if (onFocus) onFocus(e);
          setErrorBordersShown(false);
        }}
        {...rest}
      />
    </>
  );
};

DisplaynameInput.defaultProps = {
  isValid: undefined,
};

export default DisplaynameInput;

interface ISDisplaynameInput {
  errorBordersShown?: boolean
}

const SDisplaynameInput = styled.input<ISDisplaynameInput>`
  display: block;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  padding: 12px 20px 12px 20px;
  margin-bottom: 16px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      return 'transparent';
    } return (theme.colorsThemed.accent.error);
  }};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background3};

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &::-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }

  &:hover:enabled, &:focus, &:active {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.grayscale.outlines2;
    } return (theme.colorsThemed.accent.error);
  }};
  }
`;
