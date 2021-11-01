import React from 'react';
import styled, { css } from 'styled-components';
import InlineSvg from '../atoms/InlineSVG';

interface ButtonStyledInterface {
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const ButtonStyled = styled.button<ButtonStyledInterface>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 16px 20px 16px 22%;

  color: ${({ theme }) => theme.colorsThemed.onSurface};
  background-color: ${({ theme }) => theme.colorsThemed.surface};

  ${({ theme, hoverBgColor, hoverContentColor }) => (hoverBgColor
    ? css`& path {
      fill: ${theme.name === 'light' ? hoverBgColor : hoverContentColor};
  };` : null)};

  span {
    margin-left: 16px;

    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
  }

  cursor: pointer;

  /* No select for button */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;


  &:hover:enabled, &:focus:enabled {
    background-color: ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (hoverBgColor) {
      return theme.name === 'light' ? hoverBgColor : hoverContentColor;
    } return theme.colorsThemed.surfaceActive;
  }};

    color: ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (hoverBgColor) {
      return theme.name === 'light' ? hoverContentColor : hoverBgColor;
    } return theme.colorsThemed.onSurfaceActive;
  }};

  & path {
    ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (theme.name === 'light') {
      return !hoverBgColor ? css`fill: white;` : css`fill: ${hoverContentColor};`;
    } return !hoverBgColor ? null : css`fill: ${hoverBgColor};`;
  }};
  }

    transition: .2s linear;
  }

  &:focus {
    outline: transparent;
  }

  &:disabled {
    opacity: .5;
    cursor: default;

    transition: .2s linear;
  }

  ${({ theme }) => theme.media.tablet} {
    padding-left: 16px;

    span {
      font-size: 16px;
      line-height: 24px;
    }

    & > div {
      width: 24px;
      height: 24px;
    }
  }
`;

ButtonStyled.defaultProps = {
  hoverBgColor: undefined,
  hoverContentColor: undefined,
};

type SignInButtonType = React.ComponentPropsWithoutRef<'button'> & {
  svg: string;
  title?: string;
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const SignInButton: React.FunctionComponent<SignInButtonType> = ({
  title, svg, children, ...rest
}) => (
  <ButtonStyled
    {...rest}
  >
    <InlineSvg
      svg={svg}
      height="20px"
      width="20px"
    />
    <span>
      { title ?? children }
    </span>
  </ButtonStyled>
);

SignInButton.defaultProps = {
  title: undefined,
  hoverBgColor: undefined,
  hoverContentColor: undefined,
};

export default SignInButton;
