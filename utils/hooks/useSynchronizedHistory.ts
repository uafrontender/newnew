import { useRouter } from 'next/router';
import { useCallback } from 'react';
import isBrowser from '../isBrowser';

const useSynchronizedHistory = () => {
  const router = useRouter();

  const syncedHistoryPushState = useCallback(
    (data: any, url: string) => {
      if (!isBrowser) {
        return;
      }

      const idx = window?.history?.state?.idx ?? 0;
      const { locale } = router;

      window.history.pushState(
        {
          ...data,
          url,
          as: url,
          options: {
            shallow: true,
            locale,
            _shouldResolveHref: true,
          },
          __N: true,
          idx: idx + 1,
        },
        '',
        url
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // router, - can cause excessive calls, needs investigation
    ]
  );

  const syncedHistoryReplaceState = useCallback(
    (data: any, url: string) => {
      if (!isBrowser) {
        return;
      }

      const idx = window?.history?.state?.idx ?? 0;
      const { locale } = router;

      window.history.replaceState(
        {
          ...data,
          url,
          as: url,
          options: {
            shallow: true,
            locale,
            _shouldResolveHref: true,
          },
          __N: true,
          idx,
        },
        '',
        url
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // router, - can cause excessive calls, needs investigation
    ]
  );

  return { syncedHistoryPushState, syncedHistoryReplaceState };
};

export default useSynchronizedHistory;
