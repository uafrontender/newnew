/* eslint-disable object-shorthand */
import { useRouter } from 'next/router';
import isBrowser from '../isBrowser';

const useSynchronizedHistory = () => {
  const router = useRouter();

  const syncedHistoryPushState = (data: any, url: string) => {
    if (!isBrowser) return;

    const idx = window?.history?.state?.idx ?? 0;
    const { locale } = router;

    console.log(window.history.state)
    console.log(window.history.length)

    window.history.pushState({
      ...data,
      url: url,
      as: url,
      options: {
        shallow: true,
        locale: locale,
        _shouldResolveHref: true,
      },
      __N: true,
      idx: idx + 1,
    }, '', url);
  };

  const syncedHistoryReplaceState = (data: any, url: string) => {
    if (!isBrowser) return;

    const idx = window?.history?.state?.idx ?? 0;
    const { locale } = router;

    window.history.replaceState({
      ...data,
      url: url,
      as: url,
      options: {
        shallow: true,
        locale: locale,
        _shouldResolveHref: true,
      },
      __N: true,
      idx: idx,
    }, '', url);
  };

  return { syncedHistoryPushState, syncedHistoryReplaceState }
};

export default useSynchronizedHistory;
