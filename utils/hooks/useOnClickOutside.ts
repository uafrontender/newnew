import { useEffect, useRef } from 'react';

export const useOnClickOutside = (
  ref: any | any[],
  // Don't forget to wrap callback into usecallback
  handler: (e: Event) => void,
  listenerName?: 'mousedown' | 'touchstart'
) => {
  const refs = useRef(Array.isArray(ref) ? ref : [ref]);
  useEffect(() => {
    const listener = (event: Event) => {
      const noRefs = refs.current.every((r) => !r?.current);

      if (noRefs) {
        return;
      }

      const inside = refs.current.some((r) => {
        if (r.current && r.current.contains(event.target)) {
          return true;
        }

        return false;
      });

      if (!inside) {
        handler(event);
      }
    };

    document.addEventListener(listenerName || 'mousedown', listener);

    return () => {
      document.removeEventListener(listenerName || 'mousedown', listener);
    };
  }, [refs, handler, listenerName]);
};

export default useOnClickOutside;
