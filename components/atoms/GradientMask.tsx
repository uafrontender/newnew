import React from 'react';
import styled from 'styled-components';

interface IGradientMask {
  active: boolean;
  positionTop?: boolean;
  positionBottom?: number;
}

const GradientMask: React.FC<IGradientMask> = ({ active, positionTop, positionBottom, }) => (
  <SGradientMask active={active} positionTop={positionTop} positionBottom={positionBottom} />
);

export default GradientMask;

const SGradientMask = styled.div<IGradientMask>`
  ${(props) => {
    if (props.positionTop) {
      return 'top: 0';
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
      return props.theme.gradients.listTop;
    }
    return props.theme.gradients.listBottom;
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
