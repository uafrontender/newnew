import React, { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import isBrowser from '../../utils/isBrowser';
import { useOverlayMode } from '../../contexts/overlayModeContext';

const MODAL_TYPES = ['initial', 'covered', 'following'] as const;
export type ModalType = typeof MODAL_TYPES[number];

interface IModal {
  className?: string;
  show: boolean;
  // Modal type is used to remove dimming for Modals that were 'covered' by another modal
  // and remove animation for modals which are 'following' the previous modal (case where dimming already faded in)
  // TODO: how to add smooth transition on close when all modals are closed?
  modalType?: ModalType;
  transitionspeed?: number;
  additionalz?: number;
  custombackdropfiltervalue?: number;
  children: ReactNode;
  onClose?: () => void;
  onEnterKeyUp?: () => void;
}

const Modal: React.FC<IModal> = React.memo((props) => {
  const {
    className,
    show,
    modalType = 'initial',
    transitionspeed,
    additionalz,
    custombackdropfiltervalue,
    children,
    onClose,
    onEnterKeyUp,
  } = props;

  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  const elementRef = useRef(null);

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

  useEffect(() => {
    const enterKeyUpHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnterKeyUp?.();
      }
    };

    if (isBrowser() && onEnterKeyUp) {
      window.addEventListener('keyup', enterKeyUpHandler);
    }

    return () => {
      window.removeEventListener('keyup', enterKeyUpHandler);
    };
  }, [onEnterKeyUp]);

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
          duration: modalType === 'initial' ? transitionspeed ?? 0.15 : 0,
          delay: 0,
        }}
        nodimming={modalType === 'covered' ? 'true' : 'false'}
        additionalz={additionalz ?? undefined}
        custombackdropfiltervalue={custombackdropfiltervalue ?? undefined}
        transitionspeed={modalType === 'initial' ? transitionspeed ?? 0.15 : 0}
      >
        <SClickableDiv
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        />
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              ref: elementRef,
            })
          : children}
      </StyledModalOverlay>
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
});

interface IStyledModalOverlay {
  transitionspeed?: number;
  // Fix for a 'received `false` for a non-boolean attribute' issue
  nodimming?: string;
  additionalz?: number;
  custombackdropfiltervalue?: number;
}

// NOTE: 'transform: translateZ(0);', ' height: calc(100% + 2px);',  'top: -1px;' and 'bottom: -1px;' needed to fix mobile Safari issue with transparent line above
const StyledModalOverlay = styled(motion.div)<IStyledModalOverlay>`
  position: fixed;
  left: 0;
  bottom: -1px;
  top: -1px;

  width: 100vw;
  height: calc(100% + 2px);
  transform: translateZ(0);
  overflow: hidden;
  z-index: ${({ additionalz }) => additionalz ?? 10};

  backdrop-filter: ${({ custombackdropfiltervalue, nodimming }) =>
    // eslint-disable-next-line no-nested-ternary
    nodimming === 'true'
      ? 'none'
      : custombackdropfiltervalue
      ? `blur(${custombackdropfiltervalue}px)`
      : 'blur(16px)'};

  -webkit-backdrop-filter: ${({ custombackdropfiltervalue, nodimming }) =>
    // eslint-disable-next-line no-nested-ternary
    nodimming === 'true'
      ? 'none'
      : custombackdropfiltervalue
      ? `blur(${custombackdropfiltervalue}px)`
      : 'blur(16px)'};

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
    backdrop-filter: ${({ nodimming }) =>
      nodimming === 'false' ? 'blur(16px)' : null};
    -webkit-backdrop-filter: ${({ nodimming }) =>
      nodimming === 'false' ? 'blur(16px)' : null};

    /* Some screens have dimmed overlay */
    background-color: ${({ nodimming, theme }) =>
      nodimming === 'false' ? theme.colorsThemed.background.overlaydim : null};
  }
`;

const SClickableDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export default Modal;
