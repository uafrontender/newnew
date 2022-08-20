import React, { useEffect, useCallback, useState } from 'react';

export const useScrollPosition = (
  ref: React.MutableRefObject<HTMLElement | null>
) => {
  const [element, setElement] = useState<HTMLElement | undefined>();

  useEffect(() => {
    const refElement = ref.current;
    if (refElement) {
      setElement((curr) => curr || refElement);
    }
  }, [ref, ref.current]);

  const setScrollPosition = useCallback(() => {
    if (element) {
      localStorage.setItem('scrollPosition', element.scrollTop.toString());
    }
  }, [element]);

  useEffect(() => {
    const oldScrollPosition = localStorage.getItem('scrollPosition');
    if (element && typeof oldScrollPosition !== 'undefined') {
      // eslint-disable-next-line no-param-reassign
      element.scrollTop = Number(oldScrollPosition);
      localStorage.removeItem('scrollPosition');
    }

    window.addEventListener('beforeunload', setScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', setScrollPosition);
    };
  }, [element, setScrollPosition]);
};

export default useScrollPosition;
