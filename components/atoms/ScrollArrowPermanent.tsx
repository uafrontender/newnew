import React from 'react';
import styled, { css, useTheme } from 'styled-components';

import InlineSVG from './InlineSVG';

import arrowIconLeft from '../../public/images/svg/icons/outlined/ChevronLeft.svg';
import arrowIconRight from '../../public/images/svg/icons/outlined/ChevronRight.svg';

const ICONS = {
  left: arrowIconLeft,
  right: arrowIconRight,
};

interface IScrollArrow {
  active: boolean;
  position: 'left' | 'right';
  handleClick: () => void;
}

export const ScrollArrow: React.FC<IScrollArrow> = (props) => {
  const {
    active,
    position,
    handleClick,
  } = props;
  const theme = useTheme();

  return (
    <SArrowHolder
      active={active}
      onClick={handleClick}
      position={position}
    >
      <InlineSVG
        svg={ICONS[position]}
        fill={theme.colorsThemed.text.primary}
        width="48px"
        height="48px"
      />
    </SArrowHolder>
  );
};

export default ScrollArrow;

interface ISArrowHolder {
  active: boolean;
  position: 'left' | 'right';
}

const SArrowHolder = styled.div<ISArrowHolder>`
  top: 0;
  height: 100%;
  cursor: pointer;
  z-index: 2;
  padding: ${(props) => (props.active ? '16px' : 0)};
  display: flex;
  opacity: ${(props) => (props.active ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  transition: all linear 0.2s;
  align-items: center;

  svg {
    z-index: 3;
  }

  ${(props) => (props.position === 'left' ? css`
    left: -32px;

    ${props.theme.media.laptop} {
      left: -116px;
    }
  ` : css`
    right: -32px;
    justify-content: flex-end;

    ${props.theme.media.laptop} {
      right: -116px;
    }
  `)}
`;
