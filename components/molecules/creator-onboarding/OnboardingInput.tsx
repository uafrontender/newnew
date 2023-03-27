import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';

import AnimatedPresence from '../../atoms/AnimatedPresence';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import LockIcon from '../../../public/images/svg/icons/filled/Lock.svg';

type TOnboardingInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  isTaken?: boolean;
  errorCaption?: string;
  cantChangeInfoCaption?: string;
};

const OnboardingInput: React.FunctionComponent<TOnboardingInput> = ({
  id,
  type,
  value,
  isValid,
  isTaken,
  errorCaption,
  cantChangeInfoCaption,
  readOnly,
  onChange,
  onFocus,
  ...rest
}) => {
  const theme = useTheme();
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  useEffect(() => {
    if (isTaken) setErrorBordersShown(true);
  }, [isTaken]);

  return (
    <SContainer>
      <SInputWrapper>
        {readOnly && (
          <SReadonlyLock>
            <InlineSvg
              svg={LockIcon}
              width='24px'
              height='24px'
              fill={theme.colorsThemed.text.tertiary}
            />
          </SReadonlyLock>
        )}
        <SOnboardingInput
          id={id}
          type={type}
          value={value}
          readOnly={readOnly}
          errorBordersShown={errorBordersShown}
          onChange={onChange}
          style={{
            ...(readOnly
              ? {
                  cursor: 'default',
                  userSelect: 'none',
                }
              : {}),
          }}
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
      </SInputWrapper>
      {readOnly && <SReadonlyCaption>{cantChangeInfoCaption}</SReadonlyCaption>}
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

OnboardingInput.defaultProps = {
  isValid: undefined,
  isTaken: undefined,
  errorCaption: '',
  cantChangeInfoCaption: '',
};

export default OnboardingInput;

const SContainer = styled.div`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    /* width: 284px; */
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    /* width: 296px; */
  }
`;

const SInputWrapper = styled.div`
  position: relative;
`;

const SReadonlyCaption = styled.div`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
  margin-top: 6px;
`;

interface ISOnboardingInput {
  errorBordersShown?: boolean;
}

const SOnboardingInput = styled.input<ISOnboardingInput>`
  display: block;

  height: 48px;
  width: 100%;

  font-size: 16px;
  line-height: 24px;
  font-weight: 500;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
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
  &:focus,
  &:active {
    outline: none;
  }

  &:hover:enabled:not(:read-only),
  &:focus:not(:read-only),
  &:active:not(:read-only) {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        // NB! Temp
        return theme.colorsThemed.background.outlines2;
      }
      return theme.colorsThemed.accent.error;
    }};
  }

  // hide autofill icon in Safari
  &::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  white-space: pre;

  position: absolute;
  bottom: -22px;

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
  top: 50%;
  transform: translateY(-50%);
`;
