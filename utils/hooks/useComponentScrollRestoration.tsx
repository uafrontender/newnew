import { useEffect } from 'react';
import { useRouter } from 'next/router';

import getElementByIdAsync from '../getElementByIdAsync';
import {
  INextHistoryState,
  useMultipleBeforePopState,
} from '../../contexts/multipleBeforePopStateContext';

const useComponentScrollRestoration = (
  scrollableElement: HTMLElement | undefined,
  elementId: string
) => {
  const router = useRouter();
  const { handleAddBeforePopStateCallback } = useMultipleBeforePopState();

  useEffect(
    () => {
      const beforePopStateHandler = ({ as }: INextHistoryState) => {
        try {
          const itemFromSS = sessionStorage.getItem(as) ?? undefined;
          const parsedItemFromSS = itemFromSS
            ? JSON.parse(itemFromSS)
            : undefined;

          // If there's no identifier with the provided elementId,
          // the rest of the code won't be executed
          if (parsedItemFromSS && parsedItemFromSS[elementId]) {
            getElementByIdAsync(elementId)
              .then((scrollElement) => {
                if (scrollElement) {
                  (scrollElement as HTMLElement)?.scrollTo({
                    top: parsedItemFromSS[elementId].y,
                    left: parsedItemFromSS[elementId].x,
                  });
                }
              })
              .catch((err) => {
                if ((err as Error).message === 'Element not found') {
                  console.error(err);
                }
              });
          }
        } catch (err) {
          console.error(err);
        }
      };

      // Try to retrive scroll position of the element
      handleAddBeforePopStateCallback(`beforePopStateHandler_${elementId}`, {
        cbFunction: beforePopStateHandler,
      });

      // Try to save scroll position of the element on route change
      const onRouteChangeStart = () => {
        const url = router.asPath;
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      elementId,
      router,
      scrollableElement,
      // handleAddBeforePopStateCallback, - reason unknown
    ]
  );
};

export default useComponentScrollRestoration;
