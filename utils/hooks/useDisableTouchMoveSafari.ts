import { useEffect, RefObject } from 'react';
import isIOS from '../isIOS';
import isSafari from '../isSafari';

const useDisableTouchMoveSafari = (
  containerRef: RefObject<HTMLElement>,
  disabled?: boolean
) => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const targetEl = e.target as HTMLElement;

      const elementsIgnoredTouchMoveLock = document.querySelectorAll(
        '[data-ignore-touch-move-lock="true"]'
      );

      const parentNode = [...elementsIgnoredTouchMoveLock].filter(
        (elIgnoredTouchMove) => {
          if (elIgnoredTouchMove.contains(targetEl)) {
            return true;
          }

          return false;
        }
      )[0];

      if (targetEl.getAttribute('data-ignore-touch-move-lock') || parentNode) {
        if (parentNode && parentNode.scrollHeight === parentNode.clientHeight) {
          e.preventDefault();

          return false;
        }

        return true;
      }
      e.preventDefault();

      return false;
    };

    if (isIOS() && isSafari() && !disabled) {
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
    }

    return () => {
      if (isIOS() && isSafari()) {
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [disabled, containerRef]);
};

export default useDisableTouchMoveSafari;
