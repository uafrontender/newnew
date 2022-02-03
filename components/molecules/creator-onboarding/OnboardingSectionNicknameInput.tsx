import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../../atoms/AnimatedPresence';

type TOnboardingSectionNicknameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  labelCaption: string;
  errorCaption: string;
}

const OnboardingSectionNicknameInput: React.FunctionComponent<TOnboardingSectionNicknameInput> = ({
  value,
  labelCaption,
  isValid,
  errorCaption,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    if (isValid) setErrorBordersShown(false);
  }, [focused, isValid]);

  return (
    <SWrapper>
      <SLabel
        isVisible={(value as string)?.length > 0}
      >
        { labelCaption }
      </SLabel>
      <SOnboardingSectionNicknameInput
        value={value}
        id="nickname_input"
        errorBordersShown={errorBordersShown}
        onChange={onChange}
        onBlur={() => {
          setFocused(false);
          if (!isValid) {
            setErrorBordersShown(true);
          } else {
            setErrorBordersShown(false);
          }
        }}
        onFocus={(e) => {
          if (onFocus) onFocus(e);
          setFocused(true);
          setErrorBordersShown(false);
        }}
        {...rest}
      />
      {
        errorBordersShown ? (
          <AnimatedPresence
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
    </SWrapper>
  );
};

OnboardingSectionNicknameInput.defaultProps = {
  isValid: undefined,
};

export default OnboardingSectionNicknameInput;

const SWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    width: 50%;
  }
`;

const SLabel = styled.div<{
  isVisible: boolean;
}>`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;

  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  height: ${({ isVisible }) => (isVisible ? 'fit-content' : 0)};
  transition: linear .2s;

  ${({ theme }) => theme.media.laptop} {
    height: fit-content !important;
    opacity: 1;
  }
`;

interface ISOnboardingSectionNicknameInput {
  errorBordersShown?: boolean
}

const SOnboardingSectionNicknameInput = styled.input<ISOnboardingSectionNicknameInput>`
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
      return 'transparent';
    } return (theme.colorsThemed.accent.error);
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

  &:hover:enabled, &:focus:enabled, &:active:enabled {
    outline: none;

    border-color: ${({ theme, errorBordersShown }) => {
    if (!errorBordersShown) {
      // NB! Temp
      return theme.colorsThemed.background.outlines2;
    } return (theme.colorsThemed.accent.error);
  }};
  }

  &:disabled {
    opacity: 0.5;
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

  margin-top: 16px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;
