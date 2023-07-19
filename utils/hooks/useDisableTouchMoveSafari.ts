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
      const container = containerRef?.current as HTMLElement | null;

      if (
        targetEl.getAttribute('data-body-scroll-lock-ignore') ||
        (container && container.contains(targetEl))
      ) {
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
