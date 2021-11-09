import { useEffect, useRef } from 'react';

import { useAppSelector } from '../../redux-store/store';

export const useOverlay = (ref: any) => {
  const { overlay } = useAppSelector((state) => state.ui);
  const scrollPosition = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    ref.current.style.overflow = overlay ? 'hidden' : 'visible';

    if (overlay) {
      scrollPosition.current = window ? window.scrollY : 0;

      // eslint-disable-next-line no-param-reassign
      ref.current.style.cssText = `
          top: -${scrollPosition.current}px;
          left: 0px;
          right: 0px;
          position: fixed;
       `;
    } else {
      // eslint-disable-next-line no-param-reassign
      ref.current.style.cssText = '';
      window.scroll(0, scrollPosition.current);
      scrollPosition.current = 0;
    }
  }, [ref, overlay]);
};

export default useOverlay;
