import { useEffect } from 'react';

function useInitialScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
}

export default useInitialScrollToTop;
