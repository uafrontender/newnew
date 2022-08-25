import { useEffect, useCallback } from 'react';

export const useScrollPosition = () => {
  const setScrollPosition = useCallback(() => {
    localStorage.setItem(
      'scrollPosition',
      document.documentElement.scrollTop.toString()
    );
  }, []);

  useEffect(() => {
    const oldScrollPosition = Number(localStorage.getItem('scrollPosition'));

    if (oldScrollPosition > 0) {
      // A delay to let page load
      setTimeout(() => {
        window.scroll(0, oldScrollPosition);
      }, 300);
    }

    window.addEventListener('pagehide', setScrollPosition);

    return () => {
      window.removeEventListener('pagehide', setScrollPosition);
    };
  }, [setScrollPosition]);
};

export default useScrollPosition;
