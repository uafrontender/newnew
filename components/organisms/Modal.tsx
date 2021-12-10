import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import isBrowser from '../../utils/isBrowser';
import { setOverlay } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch } from '../../redux-store/store';

interface IModal {
  show: boolean;
  transitionSpeed?: number;
  overlayDim?: boolean;
  additionalZ?: number;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<IModal> = (props) => {
  const {
    show,
    transitionSpeed,
    overlayDim,
    additionalZ,
    onClose,
    children,
  } = props;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOverlay(show));
  }, [show, dispatch]);
  useEffect(() => {
    const blurredBody = document.getElementById('__next');

    if (blurredBody) {
      blurredBody.classList.toggle('blurred', show);
    }
  }, [show]);

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <StyledModalOverlay
        show={show}
        onClick={onClose}
        transitionSpeed={transitionSpeed ?? 0.5}
        overlayDim={overlayDim ?? false}
        additionalZ={additionalZ ?? undefined}
      >
        {children}
      </StyledModalOverlay>,
      document.getElementById('modal-root') as HTMLElement,
    );
  }

  return null;
};

interface IStyledModalOverlay {
  show: boolean;
  transitionSpeed?: number;
  overlayDim?: boolean;
  additionalZ?: number;
}

const StyledModalOverlay = styled.div<IStyledModalOverlay>`
  left: 0;
  width: 100vw;
  bottom: 0;
  height: ${(props) => (props.show ? '100%' : 0)};
  z-index: ${({ additionalZ }) => additionalZ ?? 10};
  overflow: hidden;
  position: fixed;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: ${({ transitionSpeed }) => `height ease ${transitionSpeed ?? 0.5}s`};
  // To avoid overlapping dim color with this bg color
  background-color: ${({ theme, overlayDim }) => (overlayDim ? 'transparent' : theme.colorsThemed.background.backgroundT)};

  ::before {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    bottom: 0;
    height: 100vh;
    content: '';
    z-index: -1;
    position: absolute;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    /* Some screens have dimmed overlay */
    background-color: ${({ overlayDim, theme }) => (overlayDim ? theme.colorsThemed.background.overlayDim : null)};
  }
`;

export default Modal;
