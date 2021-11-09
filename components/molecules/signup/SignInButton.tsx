import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { debounce } from 'lodash';
import styled, { css } from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';
import RippleAnimation from '../../atoms/RippleAnimation';

type TSignInButton = React.ComponentPropsWithoutRef<'button'> & {
  svg: string;
  hoverSvg?: string;
  title?: string;
  hoverBgColor?: string;
  hoverContentColor?: string;
  pressedBgColor: string;
}

const SignInButton: React.FunctionComponent<TSignInButton> = ({
  title, svg, hoverSvg, children, onClick, disabled, ...rest
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Element ref
  const ref = useRef<HTMLButtonElement>();

  const [rippleOrigin, setRippleOrigin] = useState<{x: string, y: string}>({ x: '50%', y: '50%' });
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = useMemo(() => debounce(onClick!!, 900), [onClick]);
  const handleRestoreRippling = useMemo(() => debounce(() => setIsRippling(false), 750),
    [setIsRippling]);

  const handleEnableHovered = useCallback(() => {
    if (disabled) return;
    setHovered(true);
  },
  [disabled, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (!focused) setHovered(false);
  },
  [disabled, focused, setHovered]);

  const handleFocusCapture = useCallback(() => {
    if (disabled) return;
    setHovered(true);
    setFocused(true);
  },
  [disabled, setFocused, setHovered]);

  const handleBlurCapture = useCallback(() => {
    if (disabled) return;
    setHovered(false);
    setFocused(false);
    setIsRippling(false);
  },
  [disabled, setFocused, setHovered]);

  const handleSetRippleOnMouseDown = useCallback((
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRippleOrigin({ x: `${x}px`, y: `${y}px` });
    setIsRippling(true);
  },
  [
    disabled,
    setRippleOrigin,
    setIsRippling,
  ]);

  const handleSetRippleOnTouchStart = useCallback((
    e: React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    setRippleOrigin({ x: `${x}px`, y: `${y}px` });
    setIsRippling(true);
  },
  [
    disabled,
    setRippleOrigin,
    setIsRippling,
  ]);

  const handleSetRippleOnKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      setRippleOrigin({ x: '50%', y: '50%' });
      setIsRippling(true);
    }
  },
  [
    disabled,
    setRippleOrigin,
    setIsRippling,
  ]);

  return (
    <SSignInButton
      disabled={disabled}
      ref={(el) => {
        ref.current = el!!;
      }}
      elementWidth={ref.current?.getBoundingClientRect().width ?? 800}
      rippleOrigin={rippleOrigin}
      isRippling={isRippling}
      onMouseOver={handleEnableHovered}
      onTouchStartCapture={handleEnableHovered}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onMouseDown={handleSetRippleOnMouseDown}
      onTouchStart={handleSetRippleOnTouchStart}
      onKeyDownCapture={handleSetRippleOnKeyDown}
      onMouseLeave={handleMouseLeave}
      onMouseUpCapture={handleRestoreRippling}
      onTouchEndCapture={handleRestoreRippling}
      onKeyUpCapture={handleRestoreRippling}
      onClick={handleClick}
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
  onClick: () => {},
};

export default SignInButton;

interface SISignInButton {
  hoverBgColor?: string;
  hoverContentColor?: string;
  pressedBgColor: string;
  elementWidth: number;
  isRippling: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

const SSignInButton = styled.button<SISignInButton>`
  position: relative;
  overflow: hidden;

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

  &::before {
    position: absolute;
    top: ${({ rippleOrigin, elementWidth }) => `calc(${rippleOrigin.y} - ${elementWidth}px)`};
    left: ${({ rippleOrigin, elementWidth }) => `calc(${rippleOrigin.x} - ${elementWidth}px)`};

    border-radius: 50%;

    width: ${({ elementWidth }) => elementWidth * 2}px;
    height: ${({ elementWidth }) => elementWidth * 2}px;

    transform: scale(0);
    transform-origin: center;

    background: ${({ pressedBgColor }) => pressedBgColor};

    content: '';
  }

  span {
    margin-left: 16px;

    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
  }

  div, span {
    z-index: 1;
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

    transition: .15s linear;
  }

  &:focus {
    outline: transparent;
  }

  ${({ isRippling }) => (isRippling ? css`
    &::before {
      animation-duration: .9s;
      animation-fill-mode: forwards;
      animation-name: ${RippleAnimation};
    }
  ` : null)}

  &:disabled {
    opacity: .5;
    cursor: default;

    transition: .2s linear;
  }

  ${({ theme }) => theme.media.mobileL} {
    padding-left: 33%;
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
