import React, { useState, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import styled, { css } from 'styled-components';

import RippleAnimation from './RippleAnimation';

type TButton = React.ComponentPropsWithoutRef<'button'>;

interface IButton {
  size?: 'sm' | 'lg',
  view?: 'primary' | 'secondary' | 'tertiary' | 'transparent',
  iconOnly?: boolean,
  noRipple?: boolean,
  debounceClickMs?: number,
  debounceRestoreMs?: number,
}

const Button: React.FunctionComponent<IButton & TButton> = ({
  children,
  disabled,
  noRipple,
  debounceClickMs,
  debounceRestoreMs,
  onClick,
  ...rest
}) => {
  // Element ref
  const ref: any = useRef();
  // Ripple effect
  const [rippleOrigin, setRippleOrigin] = useState<{ x: string, y: string }>({
    x: '50%',
    y: '50%',
  });
  const [isRippling, setIsRippling] = useState(false);

  const handleClickDebounced = useMemo(() => debounce(onClick!!, debounceClickMs ?? 800),
    [onClick, debounceClickMs]);
  const handleRestoreRippling = useMemo(() => debounce(() => {
    if (noRipple) return;
    setIsRippling(false);
  }, debounceRestoreMs ?? 750),
  [noRipple, setIsRippling, debounceRestoreMs]);

  const handleOnBlurCapture = () => setIsRippling(false);
  const handleOnMouseDown = (e: any) => {
    if (disabled || noRipple) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRippleOrigin({
      x: `${x}px`,
      y: `${y}px`,
    });
    setIsRippling(true);
  };
  const handleOnTouchStart = (e: any) => {
    if (disabled || noRipple) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    setRippleOrigin({
      x: `${x}px`,
      y: `${y}px`,
    });
    setIsRippling(true);
  };
  const handleOnKeyDownCapture = () => {
    if (disabled || noRipple) return;
    setRippleOrigin({
      x: '50%',
      y: '50%',
    });
    setIsRippling(true);
  };

  return (
    <SButton
      ref={ref}
      onClick={noRipple ? onClick : handleClickDebounced}
      disabled={disabled}
      isRippling={noRipple ? false : isRippling}
      onMouseDown={handleOnMouseDown}
      rippleOrigin={rippleOrigin}
      onTouchStart={handleOnTouchStart}
      elementWidth={ref.current?.getBoundingClientRect()?.width ?? 800}
      onBlurCapture={handleOnBlurCapture}
      onKeyUpCapture={handleRestoreRippling}
      onMouseUpCapture={handleRestoreRippling}
      onKeyDownCapture={handleOnKeyDownCapture}
      onTouchEndCapture={handleRestoreRippling}
      {...rest}
    >
      <span>
        {children}
      </span>
    </SButton>
  );
};

Button.defaultProps = {
  size: 'sm',
  view: 'primary',
  iconOnly: false,
  noRipple: false,
  debounceClickMs: 800,
  debounceRestoreMs: 750,
  onClick: () => {
  },
};

export default Button;

interface ISButton {
  size?: 'sm' | 'lg';
  view?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  iconOnly?: boolean;
  hoverBgColor?: string;
  hoverContentColor?: string;
  elementWidth: number;
  isRippling: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

const SButton = styled.button<ISButton>`
  position: relative;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    ${(props) => {
    if (props.size === 'sm') {
      return css`
        font-size: 14px;
        line-height: 24px;
      `;
    }

    if (props.size === 'lg') {
      return css`
      font-size: 16px;
      line-height: 24px;
    `;
    }

    return '';
  }}
  }

  ${(props) => {
    if (props.iconOnly) {
      return css`padding: 12px;`;
    }

    if (props.size === 'sm') {
      return css`padding: 12px 24px;`;
    }

    if (props.size === 'lg') {
      return css`padding: 16px 20px;`;
    }

    return '';
  }};

  ${(props) => (props.size === 'lg' ? css`min-width: 343px;` : '')}

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: transparent;

  // NB! Temp
  color: ${(props) => props.theme.colorsThemed.button.color[props.view ?? 'primary']};
  background: ${(props) => props.theme.colorsThemed.button.background[props.view ?? 'primary']};

  cursor: pointer;
  transition: .2s linear;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;


  &::before {
    position: absolute;
    top: ${({
    rippleOrigin,
    elementWidth,
  }) => `calc(${rippleOrigin.y} - ${elementWidth}px)`};
    left: ${({
    rippleOrigin,
    elementWidth,
  }) => `calc(${rippleOrigin.x} - ${elementWidth}px)`};

    border-radius: 50%;

    width: ${({ elementWidth }) => elementWidth * 2}px;
    height: ${({ elementWidth }) => elementWidth * 2}px;

    transform: scale(0);
    transform-origin: center;

    // NB! Temp
    content: '';

    background: ${(props) => props.theme.colorsThemed.button.ripple[props.view ?? 'primary']};
  }

  span {
    z-index: 1;
  }

  ${(props) => {
    if (props.view === 'primary') {
      return css`
        &:focus:enabled {
          outline: none;

          box-shadow: ${props.theme.shadows.mediumBlue};
        }

        &:enabled {
          box-shadow: ${props.theme.shadows.mediumBlue};
        }

        &:hover:enabled {
          box-shadow: ${props.theme.shadows.intenseBlue};
        }

        &:active:enabled {
          box-shadow: ${props.theme.shadows.mediumBlue};
        }
      `;
    }

    if (['secondary', 'tertiary'].includes(props.view ?? 'primary') && !props.isRippling) {
      return css`
          &:hover:enabled,
          &:focus:enabled {
          outline: none;

          background-color: ${props.theme.colorsThemed.button.hover[props.view ?? 'primary']};
        }
      `;
    }

    return '';
  }}
  &:disabled {
    opacity: .5;

    cursor: default;
  }

  ${({ isRippling }) => (isRippling ? css`
    &::before {
      animation-duration: .9s;
      animation-fill-mode: forwards;
      animation-name: ${RippleAnimation};
    }
  ` : null)}
`;
