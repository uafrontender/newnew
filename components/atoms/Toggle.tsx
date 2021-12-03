import React from 'react';
import styled, { css } from 'styled-components';

type TToggle = {
  checked: boolean;
  title?: string;
  disabled?: boolean;
  wrapperStyle?: React.CSSProperties;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle: React.FunctionComponent<TToggle> = ({
  title,
  checked,
  disabled,
  wrapperStyle,
  onChange,
}) => (
  <SToggleLabel
    checked={checked}
    title={title ?? ''}
    disabled={disabled}
    style={wrapperStyle ?? {}}
  >
    <input
      type="checkbox"
      disabled={disabled}
      title={title ?? ''}
      onChange={(e) => onChange(e)}
    />
  </SToggleLabel>
);

Toggle.defaultProps = {
  title: '',
  disabled: undefined,
  wrapperStyle: {},
};

export default Toggle;

const SToggleLabel = styled.label<{
  checked: boolean;
  disabled?: boolean;
}>`
  position: relative;

  display: block;
  width: 36px;
  height: 24px;

  border-radius: 50px;

  background-color: ${({ theme, checked }) => {
    if (checked) return theme.colorsThemed.accent.blue;
    if (theme.name === 'light') return theme.colorsThemed.background.outlines1;
    return theme.colorsThemed.background.outlines2;
  }};

  cursor: pointer;
  transition: .2s linear;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &:before {
    content: '';
    position: absolute;
    top: calc(50% - 8px);
    left: 4px;

    width: 16px;
    height: 16px;

    border-radius: 50%;

    background-color: #FFFFFF;

    transform: ${({ checked }) => (checked ? 'translateX(12px)' : 'unset')};

    transition: transform .2s linear;
  }

  ${({ disabled }) => (
    disabled ? css`
      opacity: 0.5;
      cursor: default;
    ` : null
  )};
`;
