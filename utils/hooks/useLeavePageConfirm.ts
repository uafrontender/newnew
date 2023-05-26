import Router from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBeforeUnload } from 'react-use';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import isBrowser from '../isBrowser';

function getPathFromUrl(url: string) {
  const queryStartsAt = url.indexOf('?');
  return url.slice(0, queryStartsAt !== -1 ? queryStartsAt : undefined);
}

export const useLeavePageConfirm = (
  isConfirm: boolean,
  message: string,
  allowedRoutes: string[],
  callback?: () => void
) => {
  const initialPageIdx = useRef<number>(
    typeof window !== 'undefined' && window?.history?.state?.idx
      ? window.history.state.idx
      : NaN
  );

  const [actionToCancel, setActionToCancel] = useState<
    'redirect' | 'back' | 'forward' | ''
  >('');
  const allowedRoutesWithLocales = useMemo(() => {
    let routes = [...allowedRoutes];

    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i += 1) {
      const localeRoutes = routes.map((r) => `/${SUPPORTED_LANGUAGES[i]}${r}`);
      routes = [...routes, ...localeRoutes];
    }

    return routes;
  }, [allowedRoutes]);

  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    if (actionToCancel === 'back') {
      window.history.forward();
    }

    if (actionToCancel === 'forward') {
      Router.back();
    }

    if (actionToCancel === 'redirect') {
      Router.replace(Router.pathname, Router.asPath, { shallow: true });
    }

    setActionToCancel('');
  }, [actionToCancel]);

  useEffect(() => {
    const beforeHistoryChangeHandler = (route: string) => {
      if (isBrowser()) {
        const currentPageIdx = window?.history?.state?.idx;
        const routeTrimmed = getPathFromUrl(route);

        if (
          !allowedRoutesWithLocales.includes(routeTrimmed) &&
          isConfirm &&
          !actionToCancel
        ) {
          // Prevent reacting when there is nothing to change (double acting)
          if (
            Router.pathname === routeTrimmed &&
            !Number.isNaN(initialPageIdx.current) &&
            currentPageIdx === initialPageIdx.current
          ) {
            return;
          }

          // eslint-disable-next-line no-alert
          const isConfirmed = window.confirm(message);
          if (!isConfirmed) {
            Router.events.emit('routeChangeError', '', '', { shallow: false });

            if (
              !Number.isNaN(initialPageIdx.current) &&
              currentPageIdx > initialPageIdx.current
            ) {
              setActionToCancel('forward');
            } else if (
              !Number.isNaN(initialPageIdx.current) &&
              currentPageIdx < initialPageIdx.current
            ) {
              setActionToCancel('back');
            } else {
              setActionToCancel('redirect');
            }

            // eslint-disable-next-line no-throw-literal
            throw 'Route Canceled';
          } else {
            callback?.();
          }
        }
      }
    };

    Router.events.on('beforeHistoryChange', beforeHistoryChangeHandler);

    return () => {
      Router.events.off('beforeHistoryChange', beforeHistoryChangeHandler);
    };
  }, [isConfirm, message, allowedRoutesWithLocales, actionToCancel, callback]);
};

export default useLeavePageConfirm;
