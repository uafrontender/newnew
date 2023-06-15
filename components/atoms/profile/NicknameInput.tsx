import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import InlineSvg from '../InlineSVG';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../AnimatedPresence';

type TNicknameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  errorCaption: string;
};

const NicknameInput: React.FunctionComponent<TNicknameInput> = ({
  value,
  isValid,
  errorCaption,
  onChange,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) {
      setErrorBordersShown(false);
      return;
    }
    if (isValid) {
      setErrorBordersShown(false);
    }

    if (!isValid && errorCaption && !focused) {
      setErrorBordersShown(true);
    }
  }, [focused, isValid, errorCaption]);

  return (
    <SWrapper>
      <SNicknameInput
        value={value}
        errorBordersShown={errorBordersShown}
        onChange={onChange}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          setFocused(true);
          setErrorBordersShown(false);
        }}
        {...rest}
      />
      {errorBordersShown ? (
        <AnimatedPresence animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SWrapper>
  );
};

NicknameInput.defaultProps = {
  isValid: undefined,
};

export default NicknameInput;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

interface ISNicknameInput {
  errorBordersShown?: boolean;
}

const SNicknameInput = styled.input<ISNicknameInput>`
  display: block;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      return 'transparent';
    }
    return theme.colorsThemed.accent.error;
  }};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }
  &::-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }

  &:hover:enabled,
  &:focus:enabled,
  &:active:enabled {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        // NB! Temp
        return theme.colorsThemed.background.outlines2;
      }
      return theme.colorsThemed.accent.error;
    }};
  }

  &:disabled {
    opacity: 0.5;
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
