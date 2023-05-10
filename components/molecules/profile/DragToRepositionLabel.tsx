import React from 'react';
import styled from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import MoveIcon from '../../../public/images/svg/icons/filled/Move.svg';

interface IDragToRepositionLabel {
  text: string;
  top?: string;
  customZ?: number;
  isPressed: boolean;
}

const DragToRepositionLabel: React.FunctionComponent<
  IDragToRepositionLabel
> = ({ text, top, customZ, isPressed }) => (
  <SDraToRepositionLabel
    top={top ?? undefined}
    customZ={customZ ?? undefined}
    isPressed={isPressed}
  >
    <InlineSvg svg={MoveIcon} fill='#FFFFFF' height='24px' width='24px' />
    <div>{text}</div>
  </SDraToRepositionLabel>
);

DragToRepositionLabel.defaultProps = {
  top: undefined,
  customZ: undefined,
};

export default DragToRepositionLabel;

const SDraToRepositionLabel = styled.div<{
  isPressed: boolean;
  top?: string;
  customZ?: number;
}>`
  position: absolute;
  top: ${({ top }) => top || 'calc(50% - 20px)'};
  /* left: calc(50% - 113px); */
  left: 50%;
  white-space: pre;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px 16px;

  z-index: ${({ customZ }) => customZ ?? 12};

  cursor: move;
  transition: transform 0.2s ease-in-out;

  transform: ${({ isPressed }) =>
    isPressed ? 'translateX(-50%) scale(0.95)' : 'translateX(-50%)'};
  transform-origin: center;
  background-color: ${({ isPressed }) =>
    isPressed ? 'rgba(11, 10, 19, 0.85);' : 'rgba(11, 10, 19, 0.65);'};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
