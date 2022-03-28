/* eslint-disable react/require-default-props */
import React from 'react';
import styled from 'styled-components';

interface IGradientMaskHorizontal {
  active: boolean;
  positionLeft?: string;
  positionRight?: string;
  positionBottom?: string;
  height?: string;
  gradientType?: 'primary' | 'secondary' | 'tertiary';
  additonalZ?: number;
}

const GradientMaskHorizontal: React.FC<IGradientMaskHorizontal> = ({
  active,
  positionLeft,
  positionRight,
  positionBottom,
  height,
  gradientType,
  additonalZ,
}) => (
  <SGradientMaskHorizontal
    active={active}
    positionLeft={positionLeft}
    positionRight={positionRight}
    positionBottom={positionBottom}
    height={height}
    gradientType={gradientType ?? undefined}
    additonalZ={additonalZ ?? undefined}
  />
);

export default GradientMaskHorizontal;

const SGradientMaskHorizontal = styled.div<IGradientMaskHorizontal>`
  ${(props) => {
    if (props.positionLeft) {
      return `left: ${props.positionLeft}`;
    }
    return `right: ${props.positionRight}`;
  }};
  bottom: ${({ positionBottom }) => positionBottom ?? '0px'};
  height: ${({ height }) => height ?? '100%'};
  z-index: ${({ additonalZ }) => additonalZ ?? 1};
  position: absolute;
  transition: opacity linear 0.1s;
  background: ${(props) => {
    if (props.positionLeft) {
      return props.theme.gradients.listLeft[props.gradientType ?? 'primary'];
    }
    return props.theme.gradients.listRight[props.gradientType ?? 'primary'];
  }};
  pointer-events: none;

  opacity: ${(props) => (props.active ? 1 : 0)};

  ${(props) => props.theme.media.tablet} {
    width: 80px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: 100px;
  }
`;

GradientMaskHorizontal.defaultProps = {
  positionLeft: undefined,
  positionRight: undefined,
};
