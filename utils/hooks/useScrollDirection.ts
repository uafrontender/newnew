import { useEffect, useState } from 'react';

export const useScrollDirection = (shouldListen: boolean) => {
  const [scrollDirection, setScrollDirection] = useState('');

  useEffect(() => {
    const threshold = 10;
    let lastScrollY = window?.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window?.scrollY;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    if (shouldListen) {
      document?.addEventListener('scroll', onScroll);
    }

    return () => {
      document?.removeEventListener('scroll', onScroll);
    };
  }, [scrollDirection, shouldListen]);

  return {
    scrollDirection,
  };
};

export default useScrollDirection;
