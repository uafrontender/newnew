import { Events } from 'react-scroll';
import { useEffect } from 'react';

export const useRefreshOnScrollTop = () => {
  useEffect(() => {
    Events.scrollEvent.register('end', (to) => {
      if (to === 'top-reload') {
        window.location.reload();
      }
    });

    return () => {
      Events.scrollEvent.remove('end');
    };
  }, []);
};

export default useRefreshOnScrollTop;
