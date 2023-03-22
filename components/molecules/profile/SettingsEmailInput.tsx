import React, { useState } from 'react';
import styled from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';

import AnimatedPresence from '../../atoms/AnimatedPresence';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import useUpdateEffect from '../../../utils/hooks/useUpdateEffect';

type TSettingsEmailInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  labelCaption: string;
  errorCaption: string;
};

const SettingsEmailInput: React.FunctionComponent<TSettingsEmailInput> = ({
  value,
  isValid,
  labelCaption,
  errorCaption,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  useUpdateEffect(() => {
    if (!isValid) {
      setErrorBordersShown(true);
    } else {
      setErrorBordersShown(false);
    }
  }, [isValid]);

  return (
    <SContainer>
      <SSettingsEmailInput
        id='settings_email_input'
        type='email'
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
      {errorBordersShown ? (
        <AnimatedPresence animateWhenInView={false} animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SContainer>
  );
};

SettingsEmailInput.defaultProps = {
  isValid: undefined,
};

export default SettingsEmailInput;

const SContainer = styled.div`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 344px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 352px;
  }
`;

interface ISSettingsEmailInput {
  errorBordersShown?: boolean;
}

const SSettingsEmailInput = styled.input<ISSettingsEmailInput>`
  display: block;

  height: 44px;
  width: 100%;

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
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

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
