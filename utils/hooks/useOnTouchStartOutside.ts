import { useEffect } from 'react';

export const useOnTouchStartOutside = (ref: any, handler: (e: Event) => void) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useOnTouchStartOutside;
