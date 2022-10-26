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

const ScrollArrow: React.FC<IScrollArrow> = (props) => {
  const { active, position, handleClick } = props;
  const theme = useTheme();

  return (
    <SArrowHolder active={active} onClick={handleClick} position={position}>
      <InlineSVG
        svg={ICONS[position]}
        fill={theme.colorsThemed.background.outlines2}
        width='24px'
        height='24px'
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
  top: 49%;
  height: 36px;
  width: 36px;
  cursor: pointer;
  z-index: 2;
  display: flex;
  opacity: ${(props) => (props.active ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  transition: all linear 0.2s;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  border: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines2};
  border-radius: 50%;

  div {
    width: 100%;
  }

  ${(props) =>
    props.position === 'left'
      ? css`
          left: 12px;

          ${props.theme.media.laptop} {
            left: -80px;
          }
          ${props.theme.media.laptopM} {
            left: -65px;
          }
        `
      : css`
          right: 12px;
          justify-content: flex-end;

          ${props.theme.media.laptop} {
            right: -80px;
          }
          ${props.theme.media.laptopM} {
            right: -65px;
          }
        `}

  &:hover {
    border-color: ${({ theme }) => theme.colorsThemed.text.primary};

    path {
      fill: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;
