import React from 'react';
import styled from 'styled-components';

type TGradientButton = React.ComponentPropsWithoutRef<'button'>;

const GradientButton: React.FunctionComponent<TGradientButton> = ({ children, ...rest }) => (
  <SGradientButton
    {...rest}
  >
    { children }
  </SGradientButton>
);

export default GradientButton;

interface ISGradientButton {
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const SGradientButton = styled.button<ISGradientButton>`
  display: block;

  font-weight: bold;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: transparent;

  color: ${({ theme }) => theme.colors.baseLight0};
  background: ${({ theme }) => theme.gradients.blueDiagonal};

  cursor: pointer;
  transition: .2s linear;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &:enabled {
    box-shadow: ${({ theme }) => theme.shadows.mediumBlue};
  }

  &:disabled {
    opacity: .5;

    cursor: default;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
