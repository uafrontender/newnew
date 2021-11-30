import React, { ReactElement, useEffect, useState } from 'react';
import styled from 'styled-components';
import InlineSvg from '../InlineSVG';

import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../AnimatedPresence';

type TUsernameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  popupCaption: ReactElement;
  frequencyCaption: string;
  errorCaption: string;
}

const UsernameInput: React.FunctionComponent<TUsernameInput> = ({
  value,
  popupCaption,
  frequencyCaption,
  errorCaption,
  isValid,
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
      <SUsernameInput
        value={value}
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
      <SPopup
        isVisible={isPopupVisible}
      >
        {popupCaption}
      </SPopup>
      <SCaptionDiv>
        { frequencyCaption }
      </SCaptionDiv>
      <SStyledButton
        onClick={() => setIsPopupVisible((curr) => !curr)}
      >
        <InlineSvg
          svg={AlertIcon}
          width="24px"
          height="24px"
        />
      </SStyledButton>
    </SWrapper>
  );
};

UsernameInput.defaultProps = {
  isValid: undefined,
};

export default UsernameInput;

const SWrapper = styled.div`
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
`;

interface ISUsernameInput {
  errorBordersShown?: boolean
}

const SUsernameInput = styled.input<ISUsernameInput>`
  display: block;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

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

const SPopup = styled.div<{
  isVisible: boolean;
}>`
  position: absolute;
  right: 0;
  bottom: 100%;

  padding: 16px;
  background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};

  transition: .2s linear;

  &:after {
    position: absolute;
    bottom: -15.5px;
    right: 20px;

    width: 24px;
    height: 16px;

    content: '';
    display: inline-block;

    background-color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    /* clip-path: polygon(0 0, 100% 0, 50% 100%); */
    clip-path: path('M0 0H20L12.8284 7.17157C11.2663 8.73367 8.73367 8.73367 7.17157 7.17157L0 0Z');
  }
`;

const SCaptionDiv = styled.div`
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  padding-left: 20px;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.quaternary};

  margin-top: 6px;
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
