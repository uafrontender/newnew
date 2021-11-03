import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface IButton {
  id?: string,
  bs?: string,
  bg?: string,
  onClick: () => any,
  iconOnly?: boolean,
  children: ReactNode,
  titleColor?: string,
}

export const Button: React.FC<IButton> = (props) => {
  const {
    children,
    ...rest
  } = props;

  return (
    <SButton {...rest}>
      {children}
    </SButton>
  );
};

export default Button;

Button.defaultProps = {
  id: '',
  bs: '',
  bg: '',
  iconOnly: false,
  titleColor: '',
};

const SButton = styled.button<IButton>`
  color: ${(props) => (props.titleColor ? props.titleColor : props.theme.colorsThemed.appButtonPrimary)};
  cursor: pointer;
  border: none;
  outline: none;
  padding: ${(props) => (props.iconOnly ? '8px' : '12px 24px')};
  font-size: 14px;
  background: ${(props) => (props.bg ? props.bg : props.theme.colorsThemed.appButtonPrimaryBG)};
  line-height: 24px;
  font-weight: bold;
  white-space: nowrap;
  border-radius: ${(props) => (props.iconOnly ? '12px' : '16px')};

  ${(props) => !!props.bs && `box-shadow: ${props.bs};`}
  ${({ theme }) => theme.media.tablet} {
    padding: ${(props) => (props.iconOnly ? '12px' : '12px 24px')};
  }
`;
