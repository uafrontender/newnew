import { useEffect, useCallback } from 'react';

const SCROLL_POSITION_KEY = 'scrollPosition';

export const useScrollPosition = () => {
  const setScrollPosition = useCallback((event: PageTransitionEvent) => {
    if (!event.persisted) {
      sessionStorage.setItem(
        SCROLL_POSITION_KEY,
        document.documentElement.scrollTop.toString()
      );
    }
  }, []);

  useEffect(() => {
    const oldScrollPosition = Number(
      sessionStorage.getItem(SCROLL_POSITION_KEY)
    );
    sessionStorage.removeItem(SCROLL_POSITION_KEY);

    if (oldScrollPosition > 0) {
      // A delay for letting page to load
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
