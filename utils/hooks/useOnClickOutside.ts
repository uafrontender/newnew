import { useEffect, useRef } from 'react';

export const useOnClickOutside = (
  ref: any | any[],
  // Don't forget to wrap callback into usecallback
  handler: (e: Event) => void,
  debug?: boolean
) => {
  const refs = useRef(Array.isArray(ref) ? ref : [ref]);

  useEffect(() => {
    if (debug) {
      console.log('INITIALIZE');
    }

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
        if (debug) {
          console.log('HANDLER CALLED');
        }
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [refs, handler]);
};

export default useOnClickOutside;
