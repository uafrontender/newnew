import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useOverlayMode } from '../../contexts/overlayModeContext';

interface IBaseLayout {
  id?: string;
  className?: string;
  containerRef?: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}
// This is a component which must wrap all existing Layouts
const BaseLayout: React.FunctionComponent<IBaseLayout> = React.memo(
  ({ id, className, containerRef, children }) => {
    const { overlayModeEnabled } = useOverlayMode();
    const savedScrollPosition = useRef(0);

    useEffect(() => {
      if (overlayModeEnabled) {
        savedScrollPosition.current = window ? window.scrollY : 0;

        document.body.style.cssText = `
            overflow: hidden;
            position: fixed;
            top: -${savedScrollPosition.current}px;
          `;
      } else {
        // eslint-disable-next-line no-param-reassign
        document.body.style.cssText = '';
        window?.scroll(0, savedScrollPosition.current);
        savedScrollPosition.current = 0;
      }
    }, [overlayModeEnabled]);

    return (
      <SWrapper
        id={id}
        className={className}
        ref={(element) => {
          if (containerRef) {
            // eslint-disable-next-line no-param-reassign
            containerRef.current = element;
          }
        }}
      >
        {children}
      </SWrapper>
    );
  }
);

export default BaseLayout;

const SWrapper = styled.div`
  position: relative;

  min-height: 100vh;
  width: 100vw;
`;
