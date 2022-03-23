import { isNumber } from 'lodash';
import React from 'react';
import styled from 'styled-components';

interface IGradientMask {
  active: boolean;
  positionTop?: boolean | number;
  positionBottom?: number;
  gradientType?: 'primary' | 'secondary' | 'tertiary';
}

const GradientMask: React.FC<IGradientMask> = ({
  active, positionTop, positionBottom, gradientType,
}) => (
  <SGradientMask active={active} positionTop={positionTop} positionBottom={positionBottom} gradientType={gradientType ?? undefined} />
);

GradientMask.defaultProps = {
  gradientType: undefined,
}

export default GradientMask;

const SGradientMask = styled.div<IGradientMask>`
  ${(props) => {
    if (props.positionTop) {
      return `top: ${isNumber(props.positionTop) ? props.positionTop : 0}px`;
    }
    return `bottom: ${props.positionBottom ?? 0}px`;
  }};
  left: 0;
  right: 0;
  height: ${(props) => (props.active ? '40px' : 0)};
  z-index: 1;
  position: absolute;
  transition: height ease 0.5s;
  background: ${(props) => {
    if (props.positionTop) {
      return props.theme.gradients.listTop[props.gradientType ?? 'primary'];
    }
    return props.theme.gradients.listBottom[props.gradientType ?? 'primary'];
  }};
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    height: ${(props) => (props.active ? '60px' : 0)};
  }

  ${(props) => props.theme.media.laptopL} {
    height: ${(props) => (props.active ? '80px' : 0)};
  }
`;

GradientMask.defaultProps = {
  positionTop: false,
  positionBottom: undefined,
};
