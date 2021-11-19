import React, { useState } from 'react';
import styled from 'styled-components';
import InlineSvg from './InlineSVG';

import AlertIcon from '../../public/images/svg/icons/filled/Alert.svg';
import { T9 } from './AnimationsText';

type TTextInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  errorCaption: string;
}

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
        onFocus={(e) => {
          if (onFocus) onFocus(e);
          setErrorBordersShown(false);
        }}
        {...rest}
      />
      {
        errorBordersShown ? (
          <SErrorDiv>
            <InlineSvg
              svg={AlertIcon}
              width="16px"
              height="16px"
            />
            { errorCaption }
          </SErrorDiv>
        ) : null
      }
    </>
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
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.grayscale.outlines1;
    } return (theme.colorsThemed.accent.error);
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

  &:hover:enabled, &:focus, &:active {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.grayscale.outlines2;
    } return (theme.colorsThemed.accent.error);
  }};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  animation-name: ${T9};
  animation-duration: .5s;
  animation-delay: 0;
  animation-fill-mode: inline;

  & > div {
    margin-right: 4px;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
  }
`;
