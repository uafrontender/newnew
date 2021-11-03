import React, { useState } from 'react';
import styled from 'styled-components';

type TTextInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
}

const SignInTextInput: React.FunctionComponent<TTextInput> = ({
  value,
  isValid,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  return (
    <SSignInTextInput
      value={value}
      errorBordersShown={errorBordersShown}
      onChange={onChange}
      onBlur={() => {
        if (value && (value as string).length > 0 && !isValid) {
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
  );
};

SignInTextInput.defaultProps = {
  isValid: undefined,
};

export default SignInTextInput;

interface ISSignInTextInput {
  errorBordersShown?: boolean
}

const SSignInTextInput = styled.input<ISSignInTextInput>`
  display: block;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.grayscale.outlines;
    } return (theme.colorsThemed.accent.error);
  }};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: transparent;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
