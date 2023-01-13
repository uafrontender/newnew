import { useEffect } from 'react';
import { useRouter } from 'next/router';

import getElementByIdAsync from '../getElementByIdAsync';

const useComponentScrollRestoration = (
  scrollableElement: HTMLElement | undefined,
  elementId: string
) => {
  const router = useRouter();

  const handleUnsetSessionStorageValue = () => {};

  useEffect(() => {
    // Try to retrive scroll position of the element
    // @ts-ignore
    router.beforePopState(async ({ url, as }) => {
      try {
        const itemFromSS = sessionStorage.getItem(as) ?? undefined;
        const parsedItemFromSS = itemFromSS
          ? JSON.parse(itemFromSS)
          : undefined;

        if (parsedItemFromSS && parsedItemFromSS[elementId]) {
          const scrollElement = await getElementByIdAsync<HTMLElement>(
            elementId
          );

          if (scrollElement) {
            (scrollElement as HTMLElement)?.scrollTo({
              top: parsedItemFromSS[elementId].y,
              left: parsedItemFromSS[elementId].x,
            });
          }
        }

        return true;
      } catch (err) {
        if ((err as Error).message === 'Element not found') {
          console.error(err);
        }
        return true;
      }
    });

    // Try to save scroll position of the element
    const onRouteChangeStart = () => {
      const url = router.asPath || router.asPath;
      const itemFromSS = sessionStorage.getItem(url) ?? undefined;
      let parsedItemFromSS = itemFromSS ? JSON.parse(itemFromSS) : {};

      if (scrollableElement && elementId) {
        const working = {
          [elementId]: {
            y: scrollableElement.scrollTop,
            x: scrollableElement.scrollLeft,
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
  }, [elementId, router, scrollableElement]);

  return {
    handleUnsetSessionStorageValue,
  };
};

export default useComponentScrollRestoration;
