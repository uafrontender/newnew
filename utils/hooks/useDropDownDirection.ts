import { useEffect, useState, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

export const useDropDownDirection = (ref: any, listHeight: number) => {
  const [direction, setDirection] = useState('down');

  const handleSetDirection = useCallback(() => {
    if (ref.current) {
      const pos = ref.current.getBoundingClientRect();

      const headerHeight =
        document.getElementById('top-nav-header')?.clientHeight || 0;

      const distanceToBottom = window.innerHeight - pos.bottom;
      const distanceToTop =
        window.innerHeight - distanceToBottom - pos.height - headerHeight;

      setDirection(
        window.innerHeight - pos.y < listHeight &&
          distanceToTop > distanceToBottom
          ? 'up'
          : 'down'
      );
    }
  }, [ref, listHeight]);

  const handleSetDirectionDebounced = useMemo(
    () => debounce(handleSetDirection, 500),
    [handleSetDirection]
  );

  useEffect(() => {
    handleSetDirection();
  }, [handleSetDirection]);

  useEffect(() => {
    window?.addEventListener('resize', handleSetDirectionDebounced);
    window?.addEventListener('scroll', handleSetDirectionDebounced);

    return () => {
      window?.removeEventListener('resize', handleSetDirectionDebounced);
      window?.removeEventListener('scroll', handleSetDirectionDebounced);
    };
  }, [handleSetDirectionDebounced]);

  return direction;
};

export default useDropDownDirection;
