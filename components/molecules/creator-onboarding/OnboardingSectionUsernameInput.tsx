import React, { ReactElement, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import InlineSvg from '../../atoms/InlineSVG';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../../atoms/AnimatedPresence';

type TOnboardingSectionUsernameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  labelCaption: string;
  popupCaption: ReactElement;
  frequencyCaption: string;
  errorCaption: string;
}

const OnboardingSectionUsernameInput: React.FunctionComponent<TOnboardingSectionUsernameInput> = ({
  value,
  popupCaption,
  frequencyCaption,
  labelCaption,
  errorCaption,
  isValid,
  disabled,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
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
      <SInputWrapper>
        <SOnboardingSectionUsernameInput
          value={value}
          id="username_input"
          disabled={disabled}
          errorBordersShown={errorBordersShown}
          onChange={onChange}
          onBlur={() => {
            setIsPopupVisible(false);
            setFocused(false);
            if (!isValid && errorCaption) {
              setErrorBordersShown(true);
            } else {
              setErrorBordersShown(false);
            }
          }}
          onFocus={(e) => {
            if (onFocus) onFocus(e);
            setFocused(true);
            setIsPopupVisible(true);
            setErrorBordersShown(false);
          }}
          {...rest}
        />
        <SStyledButton
          disabled={disabled}
          onClick={() => setIsPopupVisible((curr) => !curr)}
        >
          <InlineSvg
            svg={AlertIcon}
            width="24px"
            height="24px"
          />
        </SStyledButton>
        <AnimatePresence>
          {isPopupVisible ? (
            <SPopup
              initial={{
                y: 30,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  opacity: {
                    duration: 0.1,
                  },
                  y: {
                    type: 'spring',
                    velocity: -300,
                    stiffness: 100,
                    delay: 0.1,
                  },
                },
              }}
              exit={{
                y: 30,
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
            >
              {popupCaption}
            </SPopup>
          ) : null}
        </AnimatePresence>
      </SInputWrapper>
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
      <SCaptionDiv
        disabled={disabled ?? false}
      >
        { frequencyCaption }
      </SCaptionDiv>
    </SWrapper>
  );
};

OnboardingSectionUsernameInput.defaultProps = {
  isValid: undefined,
};

export default OnboardingSectionUsernameInput;

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

const SInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const SStyledButton = styled.button`
  position: absolute;
  top: 12px;
  right: 22px;

  display: flex;

  border: transparent;
  width: fit-content;
  height: fit-content;

  background: transparent;
  box-shadow: none;


  cursor: pointer;

  svg {
    path:first-child {
      fill: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
  }

  &:focus, &:hover {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

interface ISOnboardingSectionUsernameInput {
  errorBordersShown?: boolean
}

const SOnboardingSectionUsernameInput = styled.input<ISOnboardingSectionUsernameInput>`
  display: block;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 40px 12px 20px;
  padding-right: 32px;

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

const SPopup = styled(motion.div)`
  position: absolute;
  right: 0;
  bottom: 100%;

  padding: 16px;
  background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  transition: .2s linear;
  z-index: 6;

  &:after {
    position: absolute;
    bottom: -15.5px;
    right: 20px;

    width: 24px;
    height: 16px;

    content: '';
    display: inline-block;

    background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    clip-path: path('M0 0H20L12.8284 7.17157C11.2663 8.73367 8.73367 8.73367 7.17157 7.17157L0 0Z');
  }
`;

const SCaptionDiv = styled.div<{
  disabled: boolean;
}>`
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  margin-top: 6px;

  ${({ disabled }) => {
    if (disabled) return css`opacity: 0.5;`;
    return null;
  }}
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
