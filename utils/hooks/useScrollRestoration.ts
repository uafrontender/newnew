import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

interface IScrollPositions {
  [url: string]: {
    offsetTop: number;
    numberOfPostCards?: number;
  };
}

const useScrollRestoration = () => {
  const router = useRouter();
  const scrollPositions = useRef<IScrollPositions>({});
  const isBack = useRef(false);
  const scrollRestorationAttemptsAmount = useRef<number>(0);

  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  useEffect(() => {
    if (window && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    router.beforePopState(({url, as}) => {
      isBack.current = true;

      if (scrollPositions.current[url]?.numberOfPostCards) {
        sessionStorage.setItem('cardsLimit', (scrollPositions.current[url]?.numberOfPostCards as number).toString())
      } else if (scrollPositions.current[as]?.numberOfPostCards) {
        sessionStorage.setItem('cardsLimit', (scrollPositions.current[as]?.numberOfPostCards as number).toString())
      }
      return true;
    });

    const onRouteChangeStart = () => {
      const url = router.asPath || router.pathname;
      const numberOfPostCards =
        document?.getElementsByClassName('postcard-identifier')?.length ??
        undefined;
      scrollPositions.current[url] = {
        offsetTop: window.scrollY,
        ...(numberOfPostCards
          ? {
              numberOfPostCards,
            }
          : {}),
      };

      console.log(scrollPositions.current)
    };

    const onRouteChangeComplete = (
      url: keyof IScrollPositions,
      recursion?: boolean
    ) => {
      if (
        (isBack.current && scrollPositions.current[url]?.offsetTop) ||
        recursion
      ) {
        // console.log(`Should scroll to: ${scrollPositions.current[url]}`);
        setTimeout(() => {
          window.scroll({
            top: scrollPositions.current[url]?.offsetTop,
            behavior: 'auto',
          });
          console.log(`Aiming at: ${scrollPositions.current[url]?.offsetTop}`);
          console.log(`Current: ${window.scrollY}`);
          const target = scrollPositions.current[url]?.offsetTop ?? 0;
          const current = window.scrollY;
          if (target > current && scrollRestorationAttemptsAmount.current < 8) {
            scrollRestorationAttemptsAmount.current += 1;
            setIsRestoringScroll(true);
            onRouteChangeComplete(url, true);
          } else {
            scrollRestorationAttemptsAmount.current = 0;
            setIsRestoringScroll(false);
          }
        }, recursion ? 200 : 350);
      }

      isBack.current = false;
    };

    router.events.on('routeChangeStart', onRouteChangeStart);
    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [router]);

  return {
    isRestoringScroll,
  };
};

export default useScrollRestoration;
