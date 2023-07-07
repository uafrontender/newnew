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
    const isOverlayModeWasEnabled = useRef(overlayModeEnabled);

    useEffect(() => {
      if (overlayModeEnabled) {
        isOverlayModeWasEnabled.current = overlayModeEnabled;
      }
    }, [overlayModeEnabled]);

    useEffect(() => {
      if (overlayModeEnabled) {
        document.body.style.cssText = `
          overflow: hidden;
        `;
      } else if (isOverlayModeWasEnabled.current && !overlayModeEnabled) {
        // eslint-disable-next-line no-param-reassign
        document.body.style.cssText = '';
        isOverlayModeWasEnabled.current = false;
      }
    }, [overlayModeEnabled]);

    useEffect(
      () => () => {
        if (isOverlayModeWasEnabled.current) {
          document.body.style.cssText = '';
        }
      },
      []
    );

    useEffect(() => {
      document.documentElement.style.setProperty(
        '--window-inner-height',
        `${window.visualViewport?.height || window.innerHeight}px`
      );
    }, []);

    useEffect(() => {
      const handleUpdateWindowInnerHeightValue = (event: Event) => {
        document.documentElement.style.setProperty(
          '--window-inner-height',
          `${(event.target as VisualViewport)?.height || window.innerHeight}px`
        );
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener(
          'resize',
          handleUpdateWindowInnerHeightValue
        );
      }

      return () => {
        window.visualViewport?.removeEventListener(
          'resize',
          handleUpdateWindowInnerHeightValue
        );
      };
    }, []);

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
