import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { debounce } from 'lodash';

import { setOverlay } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch } from '../../redux-store/store';

import isBrowser from '../../utils/isBrowser';
import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import Text from './Text';

const getTopPosition = (
  verticalOrigin: 'top' | 'center' | 'bottom',
  anchorElRect?: DOMRect
) => {
  if (!anchorElRect) {
    return 0;
  }

  switch (verticalOrigin) {
    case 'top':
      return anchorElRect.top;
    case 'bottom':
      return anchorElRect.bottom;
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
      return anchorElRect.left + anchorElRect.width / 2;
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
  isCloseOnItemClick?: boolean;
  anchorElement?: HTMLElement;
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  offsetRight?: string;
  offsetTop?: string;
}

const EllipseMenu: React.FunctionComponent<IEllipseMenu> = ({
  isOpen,
  zIndex,
  children,
  maxWidth,
  onClose,
  isCloseOnItemClick,
  anchorElement,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  },
  offsetRight,
  offsetTop,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const dispatch = useAppDispatch();

  useOnClickEsc(containerRef, onClose);
  useOnClickOutside(containerRef, onClose);

  useEffect(() => {
    dispatch(setOverlay(isOpen));
  }, [isOpen, dispatch]);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(
        child,
        isCloseOnItemClick
          ? { isCloseMenuOnClick: isCloseOnItemClick, onCloseMenu: onClose }
          : {}
      );
    }
    return child;
  });

  const [position, setPosition] = useState(() => ({
    top: getTopPosition(
      anchorOrigin.vertical,
      anchorElement?.getBoundingClientRect()
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
        anchorElement?.getBoundingClientRect()
      ),
      right: getRightPosition(
        anchorOrigin.horizontal,
        anchorElement?.getBoundingClientRect()
      ),
    });
  }, [anchorElement, anchorOrigin.horizontal, anchorOrigin.vertical]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);

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
            {...rest}
          >
            {childrenWithProps}
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
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: React.ReactNode;
  isCloseMenuOnClick?: boolean;
  onCloseMenu?: () => void;
}

export const EllipseMenuButton: React.FC<IEllipseMenuButton> = ({
  onClick,
  children,
  tone,
  isCloseMenuOnClick,
  onCloseMenu,
}) => (
  <SButton
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);

      if (isCloseMenuOnClick && onCloseMenu) {
        onCloseMenu();
      }
    }}
  >
    <Text variant={2} tone={tone}>
      {children}
    </Text>
  </SButton>
);

const SContainer = styled(motion.div)<{
  top?: string;
  right?: string;
  $zIndex?: number;
  $maxWidth?: string;
  $transformX?: string;
  $transformY?: string;
}>`
  position: absolute;
  top: ${({ top }) => top};
  right: ${({ right }) => right};
  z-index: ${({ $zIndex }) => $zIndex || 10};
  min-width: 180px;
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'unset'};
  transform: ${({ $transformX, $transformY }) =>
    `translate(${$transformX ?? 0}, ${$transformY ?? 0})`};

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
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
  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;
