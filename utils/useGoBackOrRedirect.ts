import Router from 'next/router';
import { useCallback } from 'react';

interface IUseGoBackOrRedirect {
  goBackOrRedirect: (pathname: string) => void;
}

function useGoBackOrRedirect(): IUseGoBackOrRedirect {
  const goBackOrRedirect = useCallback((pathname: string) => {
    if (window?.history?.state?.idx && window.history.state.idx > 0) {
      Router.back();
    } else {
      Router.replace(pathname);
    }
  }, []);

  return { goBackOrRedirect };
}

export default useGoBackOrRedirect;
