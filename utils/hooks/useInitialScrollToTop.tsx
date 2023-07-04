import { useEffect } from 'react';

function useInitialScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
}

export default useInitialScrollToTop;
