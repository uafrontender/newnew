import { useEffect, useState } from 'react';

export const useDropDownDirection = (ref: any, listHeight: number) => {
  const [direction, setDirection] = useState('down');

  useEffect(() => {
    if (ref.current) {
      const pos = ref.current.getBoundingClientRect();

      setDirection(window.innerHeight - pos.y < listHeight ? 'up' : ' down');
    }
  }, [ref, listHeight]);

  return direction;
};

export default useDropDownDirection;
