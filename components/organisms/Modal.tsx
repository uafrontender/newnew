import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import isBrowser from '../../utils/isBrowser';
import { setOverlay } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch } from '../../redux-store/store';

interface IModal {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<IModal> = (props) => {
  const {
    show,
    onClose,
    children,
  } = props;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOverlay(show));
  }, [show, dispatch]);

  if (isBrowser()) {
    return ReactDOM.createPortal(
      <StyledModalOverlay show={show} onClick={onClose}>
        {children}
      </StyledModalOverlay>,
      document.getElementById('modal-root') as HTMLElement,
    );
  }

  return null;
};

interface IStyledModalOverlay {
  show: boolean;
}

const StyledModalOverlay = styled.div<IStyledModalOverlay>`
  left: 0;
  width: 100vw;
  bottom: 0;
  height: ${(props) => (props.show ? '100%' : 0)};
  z-index: 10;
  overflow: hidden;
  position: fixed;
  transition: height ease 0.5s;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundT};
  -webkit-backdrop-filter: blur(16px);

  ::before {
    width: 100%;
    height: 100%;
    content: '';
    z-index: -1;
    position: absolute;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
`;

export default Modal;
