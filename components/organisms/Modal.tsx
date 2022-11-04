import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import isBrowser from '../../utils/isBrowser';
import { useOverlayMode } from '../../contexts/overlayModeContext';

interface IModal {
  className?: string;
  show: boolean;
  transitionspeed?: number;
  overlaydim?: boolean;
  additionalz?: number;
  custombackdropfiltervalue?: number;
  children: ReactNode;
  onClose?: () => void;
}

const Modal: React.FC<IModal> = React.memo((props) => {
  const {
    className,
    show,
    transitionspeed,
    overlaydim,
    additionalz,
    custombackdropfiltervalue,
    children,
    onClose,
  } = props;
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  useEffect(() => {
    if (show) {
      enableOverlayMode();
    }

    return () => {
      disableOverlayMode();
    };
  }, [show, enableOverlayMode, disableOverlayMode]);

  useEffect(() => {
    const blurredBody = document.getElementById('__next');

    if (blurredBody) {
      blurredBody.classList.toggle('blurred', show);
    }
  }, [show]);

  if (!show || !isBrowser()) {
    return null;
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      <StyledModalOverlay
        className={className}
        key='modal-overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: 'tween',
          duration: transitionspeed ?? 0.15,
          delay: 0,
        }}
        // show={show}
        // onClick={onClose}
        overlaydim={!overlaydim ? 'false' : overlaydim.toString()}
        additionalz={additionalz ?? undefined}
        custombackdropfiltervalue={custombackdropfiltervalue ?? undefined}
        transitionspeed={transitionspeed ?? 0.15}
      >
        <SClickableDiv
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
        {children}
      </StyledModalOverlay>
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
});

interface IStyledModalOverlay {
  transitionspeed?: number;
  overlaydim?: string;
  additionalz?: number;
  custombackdropfiltervalue?: number;
}

const StyledModalOverlay = styled(motion.div)<IStyledModalOverlay>`
  left: 0;
  width: 100vw;
  height: 100%;
  bottom: 0;
  z-index: ${({ additionalz }) => additionalz ?? 10};
  overflow: hidden;
  position: fixed;
  backdrop-filter: ${({ custombackdropfiltervalue }) =>
    custombackdropfiltervalue
      ? `blur(${custombackdropfiltervalue}px)`
      : 'blur(16px)'};
  -webkit-backdrop-filter: ${({ custombackdropfiltervalue }) =>
    custombackdropfiltervalue
      ? `blur(${custombackdropfiltervalue}px)`
      : 'blur(16px)'};

  // To avoid overlapping dim color with this bg color
  background-color: ${({ theme, overlaydim }) =>
    overlaydim === 'true'
      ? 'transparent'
      : theme.colorsThemed.background.backgroundT};

  overscroll-behavior: 'none';

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
    background-color: ${({ overlaydim, theme }) =>
      overlaydim ? theme.colorsThemed.background.overlaydim : null};
  }
`;

const SClickableDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export default Modal;
