import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';

const POINTER_HEIGHT = 5;

interface ITooltip {
  target: React.MutableRefObject<HTMLElement | undefined>;
  topGap?: number;
  children: React.ReactNode;
}

const Tooltip: React.FC<ITooltip> = ({ target, topGap, children }) => {
  const contentRef = useRef<HTMLDivElement>();
  const [visible, setVisible] = useState(false);

  // top-center
  const point = {
    x:
      (target.current?.getBoundingClientRect().left ?? 0) +
      (target.current?.getBoundingClientRect().width ?? 0) / 2,

    y: target.current?.getBoundingClientRect().top ?? 0,
  };

  useEffect(() => {
    if (contentRef.current) {
      setVisible(true);
    }
  }, [contentRef]);

  if (typeof window === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      <SContainer
        ref={(e) => {
          if (e) {
            contentRef.current = e;
          }
        }}
        key='helper-div'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: 'tween',
          duration: 0.15,
          delay: 0,
        }}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'all' : 'none',
          top:
            point.y -
            (contentRef.current?.getBoundingClientRect().height ?? 0) -
            POINTER_HEIGHT -
            (topGap ?? 0),
          left:
            point.x -
            (contentRef.current?.getBoundingClientRect().width ?? 0) / 2,
        }}
      >
        <SContent>{children}</SContent>
        <SPointer />
        <SPointerHelper />
      </SContainer>
    </AnimatePresence>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default Tooltip;

const SContainer = styled(motion.div)`
  position: fixed;
  z-index: 10;
`;

const SContent = styled.div`
  z-index: 11;
  width: 100px;
  background: white;
  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colors.dark};

  padding: 6px 10px;

  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const SPointer = styled.div`
  z-index: -1;
  position: absolute;
  bottom: -3px;
  left: calc(50% - 8px);

  width: 14px;
  height: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;

  background: #ffffff;
  transform: matrix(0.71, -0.61, 0.82, 0.71, 0, 0);
`;

const SPointerHelper = styled.div`
  z-index: -1;
  position: absolute;
  bottom: -2px;
  left: calc(50% - 7px);

  width: 12px;
  height: 12px;
  border-radius: 3px;

  background: #ffffff;
  transform: matrix(0.71, -0.61, 0.82, 0.71, 0, 0);
  z-index: 1000;
`;
