import React, { useState, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import styled, { css } from 'styled-components';
import RippleAnimation from './RippleAnimation';

type TPrimaryLargeButton = React.ComponentPropsWithoutRef<'button'>;

const PrimaryLargeButton: React.FunctionComponent<TPrimaryLargeButton> = ({
  children,
  disabled,
  onClick,
  ...rest
}) => {
  // Element ref
  const ref = useRef<HTMLButtonElement>();
  // Ripple effect
  const [rippleOrigin, setRippleOrigin] = useState<{x: string, y: string}>({ x: '50%', y: '50%' });
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = useMemo(() => debounce(onClick!!, 900), [onClick]);
  const handleRestoreRippling = useMemo(() => debounce(() => setIsRippling(false), 750),
    [setIsRippling]);

  return (
    <SPrimaryLargeButton
      disabled={disabled}
      ref={(el) => {
        ref.current = el!!;
      }}
      elementWidth={ref.current?.getBoundingClientRect().width ?? 800}
      isRippling={isRippling}
      rippleOrigin={rippleOrigin}
      onBlurCapture={() => {
        setIsRippling(false);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRippleOrigin({ x: `${x}px`, y: `${y}px` });
        setIsRippling(true);
      }}
      onMouseUpCapture={handleRestoreRippling}
      onTouchStart={(e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        setRippleOrigin({ x: `${x}px`, y: `${y}px` });
        setIsRippling(true);
      }}
      onTouchEndCapture={handleRestoreRippling}
      onKeyDownCapture={() => {
        if (disabled) return;
        setRippleOrigin({ x: '50%', y: '50%' });
        setIsRippling(true);
      }}
      onKeyUpCapture={handleRestoreRippling}
      onClick={handleClick}
      {...rest}
    >
      { children }
    </SPrimaryLargeButton>
  );
};

PrimaryLargeButton.defaultProps = {
  onClick: () => {},
};

export default PrimaryLargeButton;

interface ISPrimaryLargeButton {
  hoverBgColor?: string;
  hoverContentColor?: string;
  elementWidth: number;
  isRippling: boolean;
  rippleOrigin: {
    x: string;
    y: string;
  };
}

const SPrimaryLargeButton = styled.button<ISPrimaryLargeButton>`
  position: relative;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  font-weight: bold;
  font-size: 14px;
  line-height: 20px;

  padding: 12px 20px 12px 20px;

  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: transparent;

  // NB! Temp
  color: ${({ theme }) => theme.colors.white};
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


  &::before {
    position: absolute;
    top: ${({ rippleOrigin, elementWidth }) => `calc(${rippleOrigin.y} - ${elementWidth}px)`};
    left: ${({ rippleOrigin, elementWidth }) => `calc(${rippleOrigin.x} - ${elementWidth}px)`};

    border-radius: 50%;

    width: ${({ elementWidth }) => elementWidth * 2}px;
    height: ${({ elementWidth }) => elementWidth * 2}px;

    transform: scale(0);
    transform-origin: center;

    // NB! Temp
    background: ${({ theme }) => theme.colors.blue};
    content: '';
  }

  span {
    z-index: 2;
  }

  &:focus:enabled {
    outline: none;

    box-shadow: ${({ theme }) => theme.shadows.mediumBlue};
  }

  &:enabled {
    box-shadow: ${({ theme }) => theme.shadows.mediumBlue};
  }

  &:hover:enabled {
    box-shadow: ${({ theme }) => theme.shadows.intenseBlue};
  }

  &:active:enabled {
    box-shadow: ${({ theme }) => theme.shadows.mediumBlue};
  }

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

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
