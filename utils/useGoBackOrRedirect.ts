import { useRouter } from 'next/router';

interface IUseGoBackOrRedirect {
  goBackOrRedirect: (pathname: string) => void;
}

function useGoBackOrRedirect(): IUseGoBackOrRedirect {
  const router = useRouter();

  function goBackOrRedirect(pathname: string) {
    if (window.history.state.idx > 0) {
      router.back();
    } else {
      router.replace(pathname);
    }
  }

  return { goBackOrRedirect };
}

export default useGoBackOrRedirect;
