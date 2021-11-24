import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import isBrowser from '../../utils/isBrowser';
import { setOverlay } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch } from '../../redux-store/store';

interface IModal {
  show: boolean;
  transitionSpeed?: number;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<IModal> = (props) => {
  const {
    show,
    transitionSpeed,
    onClose,
    children,
  } = props;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOverlay(show));
  }, [show, dispatch]);

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <StyledModalOverlay
        show={show}
        transitionSpeed={transitionSpeed ?? 0.5}
        onClick={onClose}
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
}

const StyledModalOverlay = styled.div<IStyledModalOverlay>`
  left: 0;
  width: 100vw;
  bottom: 0;
  height: ${(props) => (props.show ? '100%' : 0)};
  z-index: 10;
  overflow: hidden;
  position: fixed;
  transition: ${({ transitionSpeed }) => `height ease ${transitionSpeed ?? 0.5}s`};
  backdrop-filter: blur(16px);
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundT};
`;

export default Modal;
