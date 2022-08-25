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
        window.scrollTo(0, oldScrollPosition);
      }, 100);
    }

    window.addEventListener('beforeunload', setScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', setScrollPosition);
    };
  }, [setScrollPosition]);
};

export default useScrollPosition;
