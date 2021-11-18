import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { debounce } from 'lodash';
import styled, { css } from 'styled-components';

import RippleAnimation from './RippleAnimation';

type TButton = React.ComponentPropsWithoutRef<'button'>;

interface IButton {
  size?: 'sm' | 'lg',
  view?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'transparent' | 'primaryProgress',
  progress?: number,
  progressDelay?: number,
  animateProgress?: boolean,
  iconOnly?: boolean,
  noRipple?: boolean,
  noShadow?: boolean,
  debounceClickMs?: number,
  debounceRestoreMs?: number,
}

const Button: React.FunctionComponent<IButton & TButton> = (props) => {
  const {
    children,
    disabled,
    noRipple,
    progressDelay,
    animateProgress,
    debounceClickMs,
    debounceRestoreMs,
    onClick,
    ...rest
  } = props;
  // Element ref
  const ref: any = useRef();
  // Progress effect
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    setTimeout(() => {
      setProgress(rest.progress ?? 0);
    }, progressDelay);
  }, [rest.progress, progressDelay]);

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
      {animateProgress && (
        <SProgress view={rest.view} progress={progress} />
      )}
    </SButton>
  );
};

Button.defaultProps = {
  size: 'sm',
  view: 'primary',
  iconOnly: false,
  noRipple: false,
  noShadow: false,
  progress: 0,
  progressDelay: 1500,
  animateProgress: false,
  debounceClickMs: 800,
  debounceRestoreMs: 750,
  onClick: () => {
  },
};

export default Button;

interface ISButton {
  size?: 'sm' | 'lg';
  view?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'transparent' | 'primaryProgress';
  iconOnly?: boolean;
  noShadow?: boolean;
  progress?: number;
  hoverBgColor?: string;
  hoverContentColor?: string;
  elementWidth: number;
  isRippling: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

interface ISProgress {
  view?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'transparent' | 'primaryProgress';
  progress?: number;
}

const SProgress = styled.div<ISProgress>`
  top: 0;
  left: 0;
  width: ${(props) => props.progress ?? 0}%;
  height: 100%;
  padding: 0;
  position: absolute;
  transition: width ease 1s;
  background: ${(props) => props.theme.colorsThemed.button.progress[props.view ?? 'primary']};
`;

const SButton = styled.button<ISButton>`
  position: relative;
  overflow: hidden;

  /* Fix Safari bug */
  z-index: 0;

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
      return css`padding: ${props.size === 'sm' ? '8px' : '12px'};`;
    }

    if (props.size === 'sm') {
      return css`padding: 12px 24px;`;
    }

    if (props.size === 'lg') {
      return css`padding: 16px 20px;`;
    }

    return '';
  }};

  ${(props) => (props.size === 'lg' && !props.iconOnly ? css`min-width: 343px;` : '')}

  border-radius: ${(props) => props.theme.borderRadius[props.size === 'sm' ? 'smallLg' : 'medium']};
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
    if (props.view === 'primary' && !props.noShadow) {
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
