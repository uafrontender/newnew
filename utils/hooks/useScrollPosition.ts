import { useEffect, useCallback } from 'react';

export const useScrollPosition = (ref: any) => {
  const setScrollPosition = useCallback(() => {
    localStorage.setItem('scrollPosition', ref.current?.scrollTop);
  }, [ref]);

  useEffect(() => {
    window.addEventListener('beforeunload', setScrollPosition);

    const oldScrollPosition = localStorage.getItem('scrollPosition');

    if (typeof oldScrollPosition !== 'undefined') {
      // eslint-disable-next-line no-param-reassign
      ref.current.scrollTop = oldScrollPosition;
      localStorage.removeItem('scrollPosition');
    }

    return () => {
      window.removeEventListener('beforeunload', setScrollPosition);
    };
  }, [ref, setScrollPosition]);
};

export default useScrollPosition;
