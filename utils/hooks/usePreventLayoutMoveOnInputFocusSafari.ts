import { useEffect } from 'react';
import isIOS from '../isIOS';
import isSafari from '../isSafari';

const usePreventLayoutMoveOnInputFocusSafari = (inputDataAttribute: string) => {
  useEffect(() => {
    let input: HTMLInputElement | null = null;

    const handleFocusIn = (e: Event) => {
      input = e.target as HTMLInputElement;

      if (input && input.getAttribute(inputDataAttribute)) {
        input.style.transform = 'translateY(-99999px)';

        setTimeout(() => {
          if (input) {
            input.style.transform = '';
          }
        }, 100);
      }
    };

    const handleFocusOut = (e: Event) => {
      if (input) {
        input.style.transform = '';
      }
    };

    if (isIOS() && isSafari()) {
      document.addEventListener('focusin', handleFocusIn);

      document.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      if (isIOS() && isSafari()) {
        document.removeEventListener('focusin', handleFocusIn);

        document.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [inputDataAttribute]);
};

export default usePreventLayoutMoveOnInputFocusSafari;
