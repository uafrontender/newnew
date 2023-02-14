import React, { ReactNode, useEffect } from 'react';
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
  type?: ModalType;
  transitionspeed?: number;
  additionalz?: number;
  custombackdropfiltervalue?: number;
  children: ReactNode;
  onClose?: () => void;
}

const Modal: React.FC<IModal> = React.memo((props) => {
  const {
    className,
    show,
    type = 'initial',
    transitionspeed,
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
          duration: type === 'initial' ? transitionspeed ?? 0.15 : 0,
          delay: 0,
        }}
        nodimming={type === 'covered' ? 'true' : 'false'}
        additionalz={additionalz ?? undefined}
        custombackdropfiltervalue={custombackdropfiltervalue ?? undefined}
        transitionspeed={type === 'initial' ? transitionspeed ?? 0.15 : 0}
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
  // Fix for a 'received `false` for a non-boolean attribute' issue
  nodimming?: string;
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
