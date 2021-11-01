import React from 'react';
import styled from 'styled-components';

interface IButton {
  title: string,
  filled?: boolean,
  onClick: () => any,
  outline?: boolean,
  disabled?: boolean,
}

export const Button: React.FC<IButton> = (props) => {
  const {
    title,
    filled,
    outline,
    onClick,
    disabled,
  } = props;

  return (
    <SButton
      filled={filled}
      outline={outline}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </SButton>
  );
};

export default Button;

Button.defaultProps = {
  filled: false,
  outline: false,
  disabled: false,
};

interface ISButton {
  filled?: boolean,
  outline?: boolean,
  disabled?: boolean,
}

const SButton = styled.button<ISButton>`
  color: ${(props) => props.theme.colors[props.filled ? 'baseLight0' : 'brand1900']};
  border: 1px solid ${(props) => props.theme.colors.brand1900};
  cursor: pointer;
  padding: 16px 24px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  font-size: 14px;
  white-space: nowrap;
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors[props.filled ? 'brand1900' : 'baseLight0']};;
`;
