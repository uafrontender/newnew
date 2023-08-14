import React, { useCallback, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import styled, { css, useTheme } from 'styled-components';
import { useIsomorphicLayoutEffect } from 'react-use';
import Skeleton from 'react-loading-skeleton';

import InlineSvg from '../../atoms/InlineSVG';
import RippleAnimation from '../../atoms/RippleAnimation';

type TSignInButton = React.ComponentPropsWithoutRef<'button'> & {
  svg: string;
  hoverSvg?: string;
  title?: string;
  noRipple?: boolean;
  hoverBgColor?: string;
  hoverContentColor?: string;
  pressedBgColor: string;
  textWidth?: number;
  loading?: boolean;
  setTextWidth: (width: number) => void;
};

const SignInButton: React.FunctionComponent<TSignInButton> = ({
  title,
  svg,
  hoverSvg,
  noRipple,
  children,
  textWidth,
  loading,
  setTextWidth,
  onClick,
  disabled,
  ...rest
}) => {
  const theme = useTheme();

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Element ref
  const ref = useRef<HTMLButtonElement>();
  const spanRef = useRef<HTMLSpanElement>();

  const [rippleOrigin, setRippleOrigin] = useState<{ x: string; y: string }>({
    x: '50%',
    y: '50%',
  });
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = useMemo(
    () => debounce(onClick!!, noRipple ? 300 : 900),
    [noRipple, onClick]
  );

  const handleRestoreRippling = useMemo(
    () =>
      debounce(() => {
        if (noRipple) return;
        setIsRippling(false);
      }, 750),
    [noRipple, setIsRippling]
  );

  const handleEnableHovered = useCallback(() => {
    if (disabled || window?.matchMedia('(hover: none)').matches) return;
    setHovered(true);
  }, [disabled, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (!focused) setHovered(false);
  }, [disabled, focused, setHovered]);

  const handleFocusCapture = useCallback(() => {
    if (disabled || window?.matchMedia('(hover: none)').matches) return;
    setHovered(true);
    setFocused(true);
  }, [disabled, setFocused, setHovered]);

  const handleBlurCapture = useCallback(() => {
    if (disabled) return;
    setHovered(false);
    setFocused(false);
    setIsRippling(false);
  }, [disabled, setFocused, setHovered]);

  const handleSetRippleOnMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRippleOrigin({ x: `${x}px`, y: `${y}px` });
      setIsRippling(true);
    },
    [disabled, setRippleOrigin, setIsRippling]
  );

  const handleSetRippleOnTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      setRippleOrigin({ x: `${x}px`, y: `${y}px` });
      setIsRippling(true);
    },
    [disabled, setRippleOrigin, setIsRippling]
  );

  const handleSetRippleOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === 'Enter') {
        setRippleOrigin({ x: '50%', y: '50%' });
        setIsRippling(true);
      }
    },
    [disabled, setRippleOrigin, setIsRippling]
  );

  useIsomorphicLayoutEffect(() => {
    if (spanRef.current) {
      setTextWidth(spanRef.current.getBoundingClientRect().width);
    }
  });

  return (
    <SContainer>
      <SSignInButton
        disabled={disabled || loading}
        ref={(el) => {
          ref.current = el!!;
        }}
        elementWidth={ref.current?.getBoundingClientRect().width ?? 800}
        textWidth={textWidth}
        rippleOrigin={rippleOrigin}
        isRippling={noRipple ? false : isRippling}
        noRipple={noRipple ?? false}
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
          svg={!hovered ? svg : hoverSvg ?? svg}
          height='20px'
          width='20px'
        />
        <span
          ref={(el) => {
            spanRef.current = el!!;
          }}
        >
          {title ?? children}
        </span>
      </SSignInButton>
      {loading && (
        <SSkeleton
          count={1}
          borderRadius={16}
          duration={2}
          className='expiresSkeleton'
          containerClassName='expiresSkeletonContainer'
          baseColor={theme.colorsThemed.background.secondary}
          highlightColor={theme.colorsThemed.background.quaternary}
        />
      )}
    </SContainer>
  );
};

SignInButton.defaultProps = {
  title: undefined,
  hoverSvg: undefined,
  noRipple: false,
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
  textWidth?: number;
  isRippling: boolean;
  noRipple: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

const SContainer = styled.div`
  display: flex;
  position: relative;
`;

const SSignInButton = styled.button<SISignInButton>`
  position: relative;
  overflow: hidden;

  /* Fix Safari bug */
  z-index: 0;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ elementWidth, textWidth }) =>
    textWidth
      ? `16px 20px 16px ${(elementWidth - textWidth - 36) / 2}px`
      : '16px 20px 16px 22%'};

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme, hoverBgColor, hoverContentColor }) =>
    hoverBgColor && hoverContentColor
      ? css`
          & path {
            fill: ${theme.name === 'light' ? hoverBgColor : hoverContentColor};
          }
        `
      : null};

  &::before {
    position: absolute;
    top: ${({ rippleOrigin, elementWidth }) =>
      `calc(${rippleOrigin.y} - ${elementWidth}px)`};
    left: ${({ rippleOrigin, elementWidth }) =>
      `calc(${rippleOrigin.x} - ${elementWidth}px)`};

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

  div,
  span {
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

  @media (hover: hover) {
    &:hover:enabled,
    &:focus:enabled {
      background-color: ${({ theme, hoverBgColor, hoverContentColor }) => {
        if (hoverBgColor && hoverContentColor) {
          return theme.name === 'light' ? hoverBgColor : hoverContentColor;
        }
        return hoverBgColor;
      }};

      color: ${({ theme, hoverBgColor, hoverContentColor }) => {
        if (hoverBgColor && hoverContentColor) {
          return theme.name === 'light' ? hoverContentColor : hoverBgColor;
        }
        return 'white';
      }};

      & path {
        fill: ${({ theme, hoverBgColor, hoverContentColor }) => {
          if (hoverBgColor && hoverContentColor) {
            return theme.name === 'light' ? hoverContentColor : hoverBgColor;
          }
          return 'white';
        }};
      }

      transition: 0.15s linear;
    }
  }

  &:focus,
  &:hover {
    outline: transparent;
  }

  ${({ isRippling }) =>
    isRippling
      ? css`
          &::before {
            animation-duration: 0.9s;
            animation-fill-mode: forwards;
            animation-name: ${RippleAnimation};
          }
        `
      : null}

  ${({ isRippling }) =>
    isRippling
      ? css`
          &::before {
            animation-duration: 0.9s;
            animation-fill-mode: forwards;
            animation-name: ${RippleAnimation};
          }
        `
      : null}

  &:enabled:active {
    transform: scale(0.9);
    transition: 0.2s linear;
  }

  @media (hover: hover) {
    &:enabled:active {
      transform: scale(0.9);
      background: ${({ noRipple, pressedBgColor }) =>
        noRipple ? pressedBgColor : 'initial'};
      transition: 0.2s linear;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;

    transition: 0.2s linear;
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

const SSkeleton = styled(Skeleton)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  zindex: 1;
`;
