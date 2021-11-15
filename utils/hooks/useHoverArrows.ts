import { useState, useEffect, useCallback } from 'react';

export const useHoverArrows = (ref: any) => {
  const [renderLeftArrow, setRenderLeftArrow] = useState(false);
  const [renderRightArrow, setRenderRightArrow] = useState(false);

  const handleMouseMove = useCallback((e: any) => {
    if (!ref.current || !ref.current.contains(e.target)) {
      setRenderLeftArrow(false);
      setRenderRightArrow(false);
      return;
    }

    const offsetLeft = (window.innerWidth - ref.current.offsetWidth) / 2;

    if (e.pageX < (offsetLeft + 100)) {
      setRenderLeftArrow(true);
    } else if (e.pageX > ref.current.offsetWidth + offsetLeft - 100) {
      setRenderRightArrow(true);
    } else {
      setRenderLeftArrow(false);
      setRenderRightArrow(false);
    }
  }, [ref]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [ref, handleMouseMove]);

  return {
    renderLeftArrow,
    renderRightArrow,
  };
};

export default useHoverArrows;
