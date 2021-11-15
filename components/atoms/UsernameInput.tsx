import React, { useState } from 'react';
import styled from 'styled-components';
import InlineSvg from './InlineSVG';

import AlertIcon from '../../public/images/svg/icons/filled/Alert.svg';

type TUsernameInput = React.ComponentPropsWithoutRef<'input'> & {
  isValid?: boolean;
  frequencyCaption: string;
}

const UsernameInput: React.FunctionComponent<TUsernameInput> = ({
  value,
  frequencyCaption,
  isValid,
  onChange,
  onFocus,
  ...rest
}) => {
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  return (
    <SWrapper>
      <SUsernameInput
        value={value}
        errorBordersShown={errorBordersShown}
        onChange={onChange}
        onBlur={() => {
          if (!isValid) {
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
      <SCaptionDiv>
        { frequencyCaption }
      </SCaptionDiv>
      <SStyledButton
        onClick={() => {}}
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
  right: 12px;

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

  padding: 12px 20px 12px 20px;
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
  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background3};;

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

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
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
