import isNumber from 'lodash/isNumber';
import React from 'react';
import styled, { css } from 'styled-components';

interface IGradientMask {
  active: boolean;
  positionTop?: boolean | number;
  positionBottom?: number;
  width?: string;
  height?: string;
  gradientType?: 'primary' | 'secondary' | 'tertiary' | 'blended';
  animateOpacity?: boolean;
}

const GradientMask: React.FC<IGradientMask> = ({
  active,
  positionTop,
  positionBottom,
  width,
  height,
  gradientType,
  animateOpacity,
}) => (
  <SGradientMask
    active={active}
    positionTop={positionTop}
    positionBottom={positionBottom}
    gradientType={gradientType ?? undefined}
    width={width ?? undefined}
    height={height ?? undefined}
    animateOpacity={animateOpacity}
  />
);

GradientMask.defaultProps = {
  gradientType: undefined,
  width: undefined,
  animateOpacity: false,
};

export default GradientMask;

const SGradientMask = styled.div<IGradientMask>`
  ${(props) => {
    if (props.positionTop) {
      return `top: ${
        isNumber(props.positionTop) ? props.positionTop - 2 : -1
      }px`;
    }
    return `bottom: ${props.positionBottom ? props.positionBottom - 1 : -1}px`;
  }};
  left: 0;
  right: 0;
  width: ${({ width }) => width ?? '100%'};
  height: ${(props) => (props.active ? '40px' : 0)};
  z-index: 1;
  position: absolute;
  transition: all ease 0.5s;
  background: ${(props) => {
    if (props.positionTop) {
      return props.theme.gradients.listTop[props.gradientType ?? 'primary'];
    }
    return props.theme.gradients.listBottom[props.gradientType ?? 'primary'];
  }};
  pointer-events: none;

  ${({ animateOpacity, active }) =>
    animateOpacity &&
    css`
      opacity: ${active ? 1 : 0};
    `}

  ${(props) => props.theme.media.tablet} {
    height: ${(props) => (props.active ? props.height || '60px' : 0)};

    ${(props) => {
      if (props.positionTop) {
        return `top: ${isNumber(props.positionTop) ? props.positionTop : 0}px`;
      }
      return `bottom: ${props.positionBottom ?? 0}px`;
    }}
  }

  ${(props) => props.theme.media.laptopL} {
    height: ${(props) => (props.active ? props.height || '80px' : 0)};
  }
`;

GradientMask.defaultProps = {
  positionTop: false,
  positionBottom: undefined,
};
