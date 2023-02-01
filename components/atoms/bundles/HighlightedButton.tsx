import React from 'react';
import styled from 'styled-components';
import Button from '../Button';

interface IHighlightedButton {
  id?: string;
  className?: string;
  size?: 'small' | 'normal';
  children: string;
  onClick?: () => void;
}

// Remove some styles as now yellow button exits in Button component but not removed component completely because paddings are different
const HighlightedButton: React.FC<IHighlightedButton> = ({
  id,
  className,
  size = 'normal',
  children,
  onClick,
}) => (
  <SButton
    id={id}
    view='brandYellow'
    className={className}
    $size={size}
    onClick={onClick}
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
