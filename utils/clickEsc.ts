import { useEffect } from 'react';

export const useOnClickEsc = (ref: any, handler: (e: Event) => void) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target) || event.keyCode !== 27) {
        return;
      }
      handler(event);
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [ref, handler]);
};

export default useOnClickEsc;
