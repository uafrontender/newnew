import Router from 'next/router';
import { useEffect, useMemo } from 'react';
import { useBeforeUnload } from 'react-use';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

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
  const allowedRoutesWithLocales = useMemo(() => {
    let routes = [...allowedRoutes];

    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      const localeRoutes = routes.map((r) => `/${SUPPORTED_LANGUAGES[i]}${r}`);
      routes = [...routes, ...localeRoutes];
    }

    return routes;
  }, [allowedRoutes]);

  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    const beforeHistoryChangeHandler = (route: string) => {
      const routeTrimmed = getPathFromUrl(route);
      if (!allowedRoutesWithLocales.includes(routeTrimmed) && isConfirm) {
        if (!window.confirm(message)) {
          // eslint-disable-next-line no-throw-literal
          throw 'Route Canceled';
        } else {
          callback?.();
        }
      }
    };

    Router.events.on('beforeHistoryChange', beforeHistoryChangeHandler);

    return () => {
      Router.events.off('beforeHistoryChange', beforeHistoryChangeHandler);
    };
  }, [isConfirm, message, allowedRoutesWithLocales, callback]);
};

export default useLeavePageConfirm;
