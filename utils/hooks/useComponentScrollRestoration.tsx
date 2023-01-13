import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useComponentScrollRestoration = (
  scrollableRef: HTMLDivElement | undefined,
  elementId: string
) => {
  const router = useRouter();

  useEffect(() => {
    const onRouteChangeStart = () => {
      const url = router.asPath || router.asPath;
      const itemFromSS = sessionStorage.getItem(url) ?? undefined;
      console.log(sessionStorage.getItem(url));
      let parsedItemFromSS = itemFromSS ? JSON.parse(itemFromSS) : {};

      if (scrollableRef && elementId) {
        const working = {
          [elementId]: {
            y: scrollableRef.scrollTop,
            x: scrollableRef.scrollLeft,
          },
        };
        parsedItemFromSS = { ...parsedItemFromSS, ...working };

        sessionStorage.setItem(url, JSON.stringify(parsedItemFromSS));
      }
    };

    router.events.on('routeChangeStart', onRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
    };
  }, [elementId, router, scrollableRef]);
};

export default useComponentScrollRestoration;
