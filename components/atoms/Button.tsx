// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useInView } from 'react-intersection-observer';
import styled, { css } from 'styled-components';

import RippleAnimation from './RippleAnimation';

type TButton = React.ComponentPropsWithoutRef<'button'>;
type TView = 'primary' | 'primaryGrad' | 'primaryProgress' | 'secondary' | 'tertiary' | 'quaternary' | 'changeLanguage' | 'transparent';
type TSize = 'sm' | 'lg';

interface IButton {
  size?: TSize,
  view?: TView,
  progress?: number,
  iconOnly?: boolean,
  withDim?: boolean,
  withShadow?: boolean,
  withRipple?: boolean,
  withShrink?: boolean,
  withProgress?: boolean,
}

const Button: React.FunctionComponent<IButton & TButton> = (props) => {
  const {
    children,
    disabled,
    withRipple,
    withProgress,
    onClick,
    ...rest
  } = props;
  const { ref, inView }: { ref: any, inView: boolean } = useInView();
  // Progress effect
  const [progress, setProgress] = useState(0);
  // Ripple effect
  const [rippleOrigin, setRippleOrigin] = useState<{ x: string, y: string }>({
    x: '50%',
    y: '50%',
  });
  const [isRippling, setIsRippling] = useState(false);

  const handleClickDebounced = useMemo(() => debounce(onClick!!, 800),
    [onClick]);
  const handleRestoreRippling = useMemo(() => debounce(() => {
    if (!withRipple) return;
    setIsRippling(false);
  }, 750),
  [withRipple, setIsRippling]);

  const handleOnBlurCapture = () => setIsRippling(false);
  const handleOnMouseDown = (e: any) => {
    if (disabled || !withRipple) return;
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
    if (disabled || !withRipple) return;
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
    if (disabled || !withRipple) return;
    setRippleOrigin({
      x: '50%',
      y: '50%',
    });
    setIsRippling(true);
  };

  useEffect(() => {
    if (inView) {
      setProgress(rest.progress ?? 0);
    }
  }, [rest.progress, inView]);

  return (
    <SButton
      ref={ref}
      onClick={!withRipple ? onClick : handleClickDebounced}
      disabled={disabled}
      withRipple={withRipple}
      isRippling={!withRipple ? false : isRippling}
      onMouseDown={handleOnMouseDown}
      withProgress={withProgress}
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
      {withProgress && (
        <SProgress view={rest.view} progress={progress} />
      )}
    </SButton>
  );
};

Button.defaultProps = {
  size: 'sm',
  view: 'primary',
  withDim: false,
  progress: 0,
  iconOnly: false,
  withShadow: false,
  withShrink: false,
  withRipple: false,
  withProgress: false,
  onClick: () => {
  },
};

export default Button;

interface ISButton {
  size?: TSize;
  view?: TView;
  iconOnly?: boolean;
  withDim?: boolean;
  withShadow?: boolean;
  withShrink?: boolean;
  withRipple?: boolean;
  withProgress?: boolean;
  elementWidth: number;
  isRippling: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

interface ISProgress {
  view?: TView;
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
  align-items: center;
  justify-content: center;
  
  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${(props) => (props.size === 'lg' ? 16 : 14)}px;
  }

  ${(props) => (props.size === 'sm' ? css`
    padding: ${props.iconOnly ? '12px' : '12px 24px'}
  ` : css`
    padding: ${props.iconOnly ? '16px' : '16px 24px'}
  `)};

  ${(props) => (props.size === 'lg' && !props.iconOnly && css`min-width: 343px;`)}

  border: transparent;
  border-radius: ${(props) => props.theme.borderRadius.medium};

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

  ${(props) => props.withShadow && css`
    box-shadow: ${props.theme.shadows.mediumBlue};
  `}

  &:active:enabled {
    outline: none;
    background: ${(props) => props.theme.colorsThemed.button.active[props.view ?? 'primary']};
    
    ${(props) => props.withShadow && css`
      box-shadow: none;
    `}
  }
  
  &:focus:enabled,
  &:hover:enabled {
    outline: none;
    background: ${(props) => props.theme.colorsThemed.button.hover[props.view ?? 'primary']};

    ${(props) => props.withShadow && css`
      box-shadow: ${props.theme.shadows.intenseBlue};
    `}
  }
  
  &:disabled {
    cursor: default;
    opacity: .5;
    outline: none;
  }

  span {
    z-index: 1;
    font-weight: 700;
  }
  
  ${(props) => props.withRipple && css`
    &::before {
    position: absolute;
    
    top: ${`calc(${props.rippleOrigin.y} - ${props.elementWidth}px)`};
    left: ${`calc(${props.rippleOrigin.x} - ${props.elementWidth}px)`};

    border-radius: 50%;

    width: ${props.elementWidth * 2}px;
    height: ${props.elementWidth * 2}px;

    transform: scale(0);
    transform-origin: center;

    // NB! Temp
    content: '';

    background: ${props.theme.colorsThemed.button.ripple[props.view ?? 'primary']};

    ${(props.isRippling && css`
      animation-duration: .9s;
      animation-fill-mode: forwards;
      animation-name: ${RippleAnimation};
  `)}
  }
  `}
  
  ${(props) => (props.withShrink && css`
    &:active {
      transform: scale(0.9);
    }
  `)}

  ${(props) => (props.withDim && css`
    &:active {
      opacity: 0.5;
    }
  `)}
`;
