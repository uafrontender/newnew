/* eslint-disable no-param-reassign */
import { MutableRefObject, useEffect } from 'react';
import isIOS from '../isIOS';
import isSafari from '../isSafari';

const usePreventLayoutMoveOnInputFocusIOS = (
  inputRef: MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null>
) => {
  useEffect(() => {
    let lastActiveElement = document.activeElement;
    const handleFocusIn = (e: Event) => {
      lastActiveElement = e.target as HTMLElement;

      if (inputRef.current && e.target === inputRef.current) {
        inputRef.current.style.transform = 'translateY(-99999px)';

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.style.transform = '';
          }
        }, 100);
      }
    };

    const handleFocusOut = (e: Event) => {
      if (inputRef.current && lastActiveElement === inputRef.current) {
        inputRef.current.style.transform = '';

        if (!isSafari()) {
          inputRef.current.blur();
        }
      }
    };

    if (isIOS()) {
      window.addEventListener('focusin', handleFocusIn);

      window.addEventListener('focusout', handleFocusOut);

      if (!isSafari()) {
        window.addEventListener('blur', handleFocusOut);
      }
    }

    return () => {
      if (isIOS()) {
        window.removeEventListener('focusin', handleFocusIn);

        window.removeEventListener('focusout', handleFocusOut);

        if (!isSafari()) {
          window.removeEventListener('blur', handleFocusOut);
        }
      }
    };
  }, [inputRef]);
};

export default usePreventLayoutMoveOnInputFocusIOS;
