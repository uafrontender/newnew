import React from 'react';
import styled from 'styled-components';

interface ISBasicButton {
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const SBasicButton = styled.button<ISBasicButton>`
  display: block;

  font-weight: bold;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: transparent;

  color: ${({ theme }) => theme.colors.baseLight0};
  background: ${({ theme }) => theme.gradients.blue};

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

type TBasicButton = React.ComponentPropsWithoutRef<'button'>;

const BasicButton: React.FunctionComponent<TBasicButton> = ({ children, ...rest }) => (
  <SBasicButton
    {...rest}
  >
    { children }
  </SBasicButton>
);

export default BasicButton;
