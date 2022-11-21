import React from 'react';
import styled from 'styled-components';

interface IHighlightedButton {
  id?: string;
  className?: string;
  size?: 'small' | 'normal';
  children: string;
  onClick?: () => void;
}

// This component is a result of Button not supporting yellow buttons
// And design not following Button specs
// TODO: Refactor buttons
const HighlightedButton: React.FC<IHighlightedButton> = ({
  id,
  className,
  size = 'normal',
  children,
  onClick,
}) => (
  <SButton id={id} className={className} size={size} onClick={onClick}>
    {children}
  </SButton>
);

export default HighlightedButton;

const SButton = styled.button<{ size?: 'small' | 'normal' }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ size }) => (size === 'small' ? '8px 16px' : '12px 24px')};
  width: 100%;

  font-size: ${({ size }) => (size === 'small' ? '14px' : '16px')};
  line-height: 24px;
  font-weight: 700;
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &:focus,
  &:hover,
  &:active {
    outline: none;
  }
`;
