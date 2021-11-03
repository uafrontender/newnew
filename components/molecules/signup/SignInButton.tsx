import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';

type TSignInButton = React.ComponentPropsWithoutRef<'button'> & {
  svg: string;
  hoverSvg?: string;
  title?: string;
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const SignInButton: React.FunctionComponent<TSignInButton> = ({
  title, svg, hoverSvg, children, ...rest
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <SSignInButton
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      {...rest}
    >
      <InlineSvg
        svg={!hovered ? svg : (hoverSvg ?? svg)}
        height="20px"
        width="20px"
      />
      <span>
        { title ?? children }
      </span>
    </SSignInButton>
  );
};

SignInButton.defaultProps = {
  title: undefined,
  hoverSvg: undefined,
  hoverBgColor: undefined,
  hoverContentColor: undefined,
};

export default SignInButton;

interface SISignInButton {
  hoverBgColor?: string;
  hoverContentColor?: string;
}

const SSignInButton = styled.button<SISignInButton>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 16px 20px 16px 22%;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};

  ${({ theme, hoverBgColor, hoverContentColor }) => (hoverBgColor && hoverContentColor
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


  &:hover:enabled {
    background-color: ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (hoverBgColor && hoverContentColor) {
      return theme.name === 'light' ? hoverBgColor : hoverContentColor;
    } return hoverBgColor;
  }};

    color: ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (hoverBgColor && hoverContentColor) {
      return theme.name === 'light' ? hoverContentColor : hoverBgColor;
    } return 'white';
  }};

  & path {
    fill: ${({ theme, hoverBgColor, hoverContentColor }) => {
    if (hoverBgColor && hoverContentColor) {
      return theme.name === 'light' ? hoverContentColor : hoverBgColor;
    } return 'white';
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

SSignInButton.defaultProps = {
  hoverBgColor: undefined,
  hoverContentColor: undefined,
};
