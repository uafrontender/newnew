import React from 'react';
import styled from 'styled-components';
import Button from '../Button';

interface IHighlightedButton {
  id?: string;
  className?: string;
  size?: 'small' | 'normal';
  disabled?: boolean;
  children: string;
  onClick?: () => void;
  onClickCapture?: () => void;
}

// Remove some styles as now yellow button exits in Button component but not removed component completely because paddings are different
const HighlightedButton: React.FC<IHighlightedButton> = ({
  id,
  className,
  size = 'normal',
  disabled,
  children,
  onClick,
  onClickCapture,
}) => (
  <SButton
    id={id}
    view='brandYellow'
    className={className}
    disabled={disabled}
    $size={size}
    onClick={onClick}
    onClickCapture={onClickCapture}
  >
    {children}
  </SButton>
);

export default HighlightedButton;

const SButton = styled(Button)<{ $size?: 'small' | 'normal' }>`
  padding: ${({ $size }) => ($size === 'small' ? '8px 16px' : '12px 24px')};
  width: 100%;
  font-size: ${({ $size }) => ($size === 'small' ? '14px' : '16px')};
`;
