import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';

import AnimatedPresence from '../../atoms/AnimatedPresence';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import LockIcon from '../../../public/images/svg/icons/filled/Lock.svg';

type TOnboardingEmailInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  labelCaption: string;
  errorCaption: string;
}

const OnboardingEmailInput: React.FunctionComponent<TOnboardingEmailInput> = ({
  value,
  isValid,
  labelCaption,
  errorCaption,
  readOnly,
  onChange,
  onFocus,
  ...rest
}) => {
  const theme = useTheme();
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  return (
    <SContainer>
      <SLabel
        htmlFor="settings_email_input"
      >
        { labelCaption }
      </SLabel>
      {readOnly && (
        <SReadonlyLock>
          <InlineSvg
            svg={LockIcon}
            width="24px"
            height="24px"
            fill={theme.colorsThemed.text.secondary}
          />
        </SReadonlyLock>
      )}
      <SOnboardingEmailInput
        id="settings_email_input"
        type="email"
        value={value}
        readOnly={readOnly}
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
          <AnimatedPresence
            animateWhenInView={false}
            animation="t-09"
          >
            <SErrorDiv>
              <InlineSvg
                svg={AlertIcon}
                width="16px"
                height="16px"
              />
              { errorCaption }
            </SErrorDiv>
          </AnimatedPresence>
        ) : null
      }
    </SContainer>
  );
};

OnboardingEmailInput.defaultProps = {
  isValid: undefined,
};

export default OnboardingEmailInput;

const SContainer = styled.div`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 296px;
  }
`;

const SLabel = styled.label`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

interface ISOnboardingEmailInput {
  errorBordersShown?: boolean
}

const SOnboardingEmailInput = styled.input<ISOnboardingEmailInput>`
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
    } return (theme.colorsThemed.accent.error);
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

  &:hover:enabled, &:focus, &:active {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.background.outlines2;
    } return (theme.colorsThemed.accent.error);
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

const SReadonlyLock = styled.div`
  position: absolute;

  right: 20px;
  top: 34px;
`;
