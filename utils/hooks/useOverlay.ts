import { useEffect, useRef } from 'react';

import { useAppSelector } from '../../redux-store/store';

import { usePostModalState } from '../../contexts/postModalContext';

export const useOverlay = (ref: any) => {
  const { overlay } = useAppSelector((state) => state.ui);
  const { postOverlayOpen } = usePostModalState();

  const scrollPosition = useRef(0);

  useEffect(() => {
    if (overlay) {
      scrollPosition.current = window ? window.scrollY : 0;

      // eslint-disable-next-line no-param-reassign
      ref.current.style.cssText = `
        overflow: hidden;
        position: fixed;
     `;
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
      `;

    } else if (!overlay && !postOverlayOpen) {
      // eslint-disable-next-line no-param-reassign
      ref.current.style.cssText = ``;
      document.body.style.cssText = '';
      window?.scroll(0, scrollPosition.current);
      scrollPosition.current = 0;
    }
  }, [ref, overlay, postOverlayOpen]);
};

export default useOverlay;
