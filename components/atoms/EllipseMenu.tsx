import { AnimatePresence, motion, MotionStyle } from 'framer-motion';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { debounce } from 'lodash';

import isBrowser from '../../utils/isBrowser';
import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import Text from './Text';
import { useOverlayMode } from '../../contexts/overlayModeContext';

const ELLIPSE_MARGIN = 5;

const getTopPosition = (
  verticalOrigin: 'top' | 'center' | 'bottom',
  anchorElRect?: DOMRect,
  ellipseRect?: DOMRect
) => {
  if (!anchorElRect) {
    return 0;
  }

  const ellipseMenuHeight = ellipseRect?.height || 0;

  switch (verticalOrigin) {
    case 'top':
      return anchorElRect.top - ellipseMenuHeight - ELLIPSE_MARGIN;
    case 'bottom':
      return anchorElRect.bottom + ELLIPSE_MARGIN;
    case 'center':
      return anchorElRect.top + anchorElRect.height / 2;
    default:
      return 0;
  }
};

const getRightPosition = (
  horizontalOrigin: 'left' | 'center' | 'right',
  anchorElRect?: DOMRect
) => {
  if (!anchorElRect) {
    return 0;
  }

  switch (horizontalOrigin) {
    case 'left':
      return window.innerWidth - anchorElRect.left;
    case 'center':
      return window.innerWidth - anchorElRect.left - anchorElRect.width / 2;
    case 'right':
      return window.innerWidth - anchorElRect.right;
    default:
      return 0;
  }
};

interface IEllipseMenu {
  isOpen: boolean;
  children: React.ReactNode;
  zIndex?: number;
  maxWidth?: string;
  onClose: () => void;
  anchorElement?: HTMLElement;
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  offsetRight?: string;
  offsetTop?: string;
  withoutContainer?: boolean;
  style?: MotionStyle;
}

const EllipseMenu: React.FunctionComponent<IEllipseMenu> = ({
  isOpen,
  zIndex,
  children,
  maxWidth,
  onClose,
  anchorElement,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  },
  offsetRight,
  offsetTop,
  withoutContainer,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  useOnClickEsc(containerRef, onClose);
  useOnClickOutside(containerRef, onClose);

  useEffect(() => {
    if (isOpen) {
      enableOverlayMode();
    }

    return () => {
      disableOverlayMode();
    };
  }, [isOpen, enableOverlayMode, disableOverlayMode]);

  const [position, setPosition] = useState(() => ({
    top: getTopPosition(
      anchorOrigin.vertical,
      anchorElement?.getBoundingClientRect(),
      containerRef.current?.getBoundingClientRect()
    ),
    right: getRightPosition(
      anchorOrigin.horizontal,
      anchorElement?.getBoundingClientRect()
    ),
  }));

  const calculatePosition = useCallback(() => {
    setPosition({
      top: getTopPosition(
        anchorOrigin.vertical,
        anchorElement?.getBoundingClientRect(),
        containerRef.current?.getBoundingClientRect()
      ),
      right: getRightPosition(
        anchorOrigin.horizontal,
        anchorElement?.getBoundingClientRect()
      ),
    });
  }, [anchorElement, anchorOrigin.horizontal, anchorOrigin.vertical]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [calculatePosition, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onResize = debounce(() => {
      calculatePosition();
    });

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [calculatePosition, isOpen]);

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <AnimatePresence>
        {isOpen && (
          <SContainer
            ref={(el) => {
              containerRef.current = el!!;
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            top={`${position.top}px`}
            right={`${position.right}px`}
            onClick={(e) => e.stopPropagation()}
            $zIndex={zIndex}
            $maxWidth={maxWidth}
            $transformX={offsetRight}
            $transformY={offsetTop}
            $withoutContainer={withoutContainer}
            {...rest}
          >
            {children}
          </SContainer>
        )}
      </AnimatePresence>,
      document.getElementById('modal-root') as HTMLElement
    );
  }

  return null;
};

export default EllipseMenu;

interface IEllipseMenuButton {
  tone?: 'neutral' | 'error';
  onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: React.ReactNode;
  withoutTextWrapper?: boolean;
  variant?: 1 | 2 | 3 | 4 | 5;
  disabled?: boolean;
}

export const EllipseMenuButton: React.FC<IEllipseMenuButton> = ({
  onClick,
  children,
  tone,
  withoutTextWrapper,
  variant = 2,
  disabled,
  ...rest
}) => (
  <SButton
    onClick={(e) => {
      if (onClick) {
        e.stopPropagation();
        onClick(e);
      }
    }}
    disabled={disabled}
    {...rest}
  >
    {withoutTextWrapper && children}
    {!withoutTextWrapper && (
      <Text tone={tone} variant={variant}>
        {children}
      </Text>
    )}
  </SButton>
);

const SContainer = styled(motion.div)<{
  top?: string;
  right?: string;
  $zIndex?: number;
  $maxWidth?: string;
  $transformX?: string;
  $transformY?: string;
  $withoutContainer?: boolean;
}>`
  position: fixed;
  top: ${({ top }) => top};
  right: ${({ right }) => right};
  z-index: ${({ $zIndex }) => $zIndex || 10};
  min-width: ${({ $withoutContainer }) =>
    $withoutContainer ? 'unset' : '180px'};
  max-width: ${({ $maxWidth }) => $maxWidth ?? '300px'};
  transform: ${({ $transformX, $transformY }) =>
    `translate(${$transformX ?? 0}, ${$transformY ?? 0})`};

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${({ $withoutContainer }) => ($withoutContainer ? 0 : '8px')};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.secondary
      : props.theme.colorsThemed.background.tertiary};
`;

const SButton = styled.button`
  background: none;
  border: transparent;
  text-align: left;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};

  &:focus {
    outline: none;
  }
  &:hover:enabled {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
