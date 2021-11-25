import { useEffect, useState } from 'react';

export const useScrollDirection = (ref: any) => {
  const [scrollDirection, setScrollDirection] = useState('');

  useEffect(() => {
    const threshold = 10;
    let lastScrollY = ref.current?.scrollTop;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = ref.current?.scrollTop;

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

    ref.current?.addEventListener('scroll', onScroll);
  }, [ref, scrollDirection]);

  return {
    scrollDirection,
  };
};

export default useScrollDirection;
