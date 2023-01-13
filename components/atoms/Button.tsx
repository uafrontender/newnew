// @ts-nocheck
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import styled, { css } from 'styled-components';

import Lottie from './Lottie';
import RippleAnimation from './RippleAnimation';

import logoAnimation from '../../public/animations/mobile_logo.json';
import logoAnimationWhite from '../../public/animations/mobile_logo_white.json';

type TButton = React.ComponentPropsWithoutRef<'button'>;
export type TView =
  | 'primary'
  | 'primaryGrad'
  | 'primaryProgress'
  | 'secondary'
  | 'modalSecondary'
  | 'modalSecondarySelected'
  | 'tertiary'
  | 'quaternary'
  | 'changeLanguage'
  | 'transparent'
  | 'danger'
  | 'common';
type TSize = 'sm' | 'lg';

interface IButton {
  size?: TSize;
  view?: TView;
  loading?: boolean;
  progress?: number;
  iconOnly?: boolean;
  withDim?: boolean;
  withShadow?: boolean;
  withRipple?: boolean;
  withShrink?: boolean;
  withProgress?: boolean;
  customDebounce?: number;
}

// Arguable optimization, depends on unstable onClick, but works according to profiling (1.8% => 0%)
const Button = React.memo(
  React.forwardRef<HTMLAnchorElement & HTMLButtonElement, IButton & TButton>(
    (props, parentRef) => {
      const {
        loading,
        children,
        disabled,
        withRipple,
        withProgress,
        customDebounce,
        onClick,
        ...rest
      } = props;

      const ref = useRef();
      const [inView, setInView] = useState(false);

      useEffect(() => {
        if (withProgress) {
          const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              setInView(entry.isIntersecting);
            });
          });

          obs.observe(ref.current);
        }
      }, [withProgress]);

      // Progress effect
      const [progress, setProgress] = useState(0);
      // Ripple effect
      const [rippleOrigin, setRippleOrigin] = useState<{
        x: string;
        y: string;
      }>({
        x: '50%',
        y: '50%',
      });
      const [isRippling, setIsRippling] = useState(false);

      const handleClickDebounced = useMemo(
        () => debounce(onClick!!, 800),
        [onClick]
      );
      const handleRestoreRippling = useMemo(
        () =>
          debounce(() => {
            if (!withRipple) return;
            setIsRippling(false);
          }, customDebounce ?? 750),
        [withRipple, setIsRippling, customDebounce]
      );

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
          ref={(el) => {
            ref.current = el;

            if (parentRef) {
              // eslint-disable-next-line no-param-reassign
              parentRef.current = el;
            }
          }}
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
          <span
            style={{
              ...(loading
                ? {
                    color: 'transparent',
                  }
                : {}),
            }}
          >
            {children}
          </span>
          {withProgress && <SProgress view={rest.view} progress={progress} />}
          {loading && (
            <SLoader size={rest.size}>
              <Lottie
                width={25}
                height={20}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData:
                    props.view === 'primary' || props.view === 'primaryGrad'
                      ? logoAnimationWhite
                      : logoAnimation,
                }}
              />
            </SLoader>
          )}
        </SButton>
      );
    }
  )
);

Button.defaultProps = {
  size: 'sm',
  view: 'primary',
  withDim: false,
  loading: false,
  progress: 0,
  iconOnly: false,
  withShadow: false,
  withShrink: false,
  withRipple: false,
  withProgress: false,
  customDebounce: undefined,
  onClick: () => {},
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
  background: ${(props) =>
    props.theme.colorsThemed.button.progress[props.view ?? 'primary']};
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

  ${(props) =>
    props.size === 'sm'
      ? css`
          padding: ${props.iconOnly ? '12px' : '12px 24px'};
        `
      : css`
          padding: ${props.iconOnly ? '16px' : '16px 24px'};
        `};

  ${(props) =>
    props.size === 'lg' &&
    !props.iconOnly &&
    css`
      min-width: 343px;
    `}

  border: transparent;
  border-radius: ${(props) => props.theme.borderRadius.medium};

  color: ${(props) =>
    props.theme.colorsThemed.button.color[props.view ?? 'primary']};
  background: ${(props) =>
    props.theme.colorsThemed.button.background[props.view ?? 'primary']};

  cursor: pointer;
  transition: 0.2s linear;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  // for gradient button background animation on hover
  ${(props) =>
    props.view === 'primaryGrad' &&
    css`
      :after {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: '';
        opacity: 0;
        z-index: 1;
        position: absolute;
        background: ${props.theme.colorsThemed.button.hover[
          props.view ?? 'primary'
        ]};
        transition: opacity 0.2s linear;
      }
    `}
  &:active:enabled {
    outline: none;
    background: ${(props) =>
      props.theme.colorsThemed.button.active[props.view ?? 'primary']};
  }

  &:focus:enabled {
    outline: none;

    ${(props) => {
      switch (props.view) {
        case 'primaryGrad': {
          return css`
            // for gradient button background animation on hover
            :after {
              opacity: 1;
            }
          `;
        }
        case 'common': {
          return css`
            color: ${({ theme }) => theme.colors.white};
            background: ${props.theme.colorsThemed.button.hover[
              props.view ?? 'primary'
            ]};
          `;
        }
        default: {
          return css`
            background: ${props.theme.colorsThemed.button.hover[
              props.view ?? 'primary'
            ]};
          `;
        }
      }
    }}

    ${(props) =>
      props.withShadow &&
      css`
        box-shadow: ${props.theme.shadows.intenseBlue};
      `}
  }

  &:hover:enabled {
    outline: none;
  }

  @media (hover: hover) {
    &:hover:enabled {
      ${(props) => {
        switch (props.view) {
          case 'primaryGrad': {
            return css`
              // for gradient button background animation on hover
              :after {
                opacity: 1;
              }
            `;
          }
          case 'common': {
            return css`
              color: ${({ theme }) => theme.colors.white};
              background: ${props.theme.colorsThemed.button.hover[
                props.view ?? 'primary'
              ]};
            `;
          }
          default: {
            return css`
              background: ${props.theme.colorsThemed.button.hover[
                props.view ?? 'primary'
              ]};
            `;
          }
        }
      }}

      ${(props) =>
        props.withShadow &&
        css`
          box-shadow: ${props.theme.shadows.intenseBlue};
        `}
    }
  }

  &:disabled {
    cursor: default;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }

  span {
    z-index: 3;
    font-weight: 700;
  }

  ${(props) =>
    props.withRipple &&
    css`
      &::before {
        position: absolute;

        top: ${`calc(${props.rippleOrigin.y} - ${props.elementWidth}px)`};
        left: ${`calc(${props.rippleOrigin.x} - ${props.elementWidth}px)`};

        border-radius: 50%;

        z-index: 2;

        width: ${props.elementWidth * 2}px;
        height: ${props.elementWidth * 2}px;

        transform: scale(0);
        transform-origin: center;

        // NB! Temp
        content: '';

        background: ${props.theme.colorsThemed.button.ripple[
          props.view ?? 'primary'
        ]};

        ${props.isRippling &&
        css`
          animation-duration: 0.9s;
          animation-fill-mode: forwards;
          animation-name: ${RippleAnimation};
        `}
      }
    `}

  ${(props) =>
    props.withShrink &&
    css`
      &:active {
        transform: scale(0.9);
      }
    `}

  ${(props) =>
    props.withDim &&
    css`
      &:active {
        opacity: 0.5;
      }
    `}

  ${({ theme, withProgress }) =>
    withProgress && theme.name === 'dark'
      ? css`
          background: ${() => theme.colorsThemed.background.tertiary};
        `
      : null}
`;

interface ISLoader {
  size?: TSize;
}

const SLoader = styled.div<ISLoader>`
  top: 50%;
  z-index: 20;
  position: absolute;
  transform: translateY(-50%);
  opacity: 1 !important;
`;
