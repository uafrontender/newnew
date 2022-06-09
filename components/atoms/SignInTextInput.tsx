import React, { useState } from 'react';
import styled from 'styled-components';
import InlineSvg from './InlineSVG';

import AnimatedPresence from './AnimatedPresence';

import AlertIcon from '../../public/images/svg/icons/filled/Alert.svg';

type TTextInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  errorCaption: string;
};

const SignInTextInput: React.FunctionComponent<TTextInput> = ({
  value,
  isValid,
  errorCaption,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  return (
    <>
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
        onFocus={(e: any) => {
          if (onFocus) onFocus(e);
          setErrorBordersShown(false);
        }}
        {...rest}
      />
      {errorBordersShown ? (
        <AnimatedPresence animateWhenInView={false} animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </>
  );
};

SignInTextInput.defaultProps = {
  isValid: undefined,
};

export default SignInTextInput;

interface ISSignInTextInput {
  errorBordersShown?: boolean;
}

const SSignInTextInput = styled.input<ISSignInTextInput>`
  display: block;

  height: 44px;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.background.outlines1;
    }
    return theme.colorsThemed.accent.error;
  }};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: transparent;

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }
  &::-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }

  &:hover:enabled,
  &:focus,
  &:active {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        // NB! Temp
        return theme.colorsThemed.background.outlines2;
      }
      return theme.colorsThemed.accent.error;
    }};
  }

  ${({ theme }) => theme.media.tablet} {
    height: 48px;

    font-size: 16px;
    line-height: 24px;
  }
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
