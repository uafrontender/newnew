import Router from 'next/router';
import { useEffect } from 'react';
import { useBeforeUnload } from 'react-use';

export const useLeavePageConfirm = (
  isConfirm: boolean,
  message: string,
  allowedRoutes: string[],
  callback?: () => void,
) => {
  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    const handler = (route: string) => {
      const routeTrimmed = route.slice(
        0,
        route.indexOf('?') !== -1 ? route.indexOf('?') : undefined
      );

      if (
        !allowedRoutes.includes(routeTrimmed) &&
        isConfirm
      ) {
        if (!window.confirm(message)) {
          // eslint-disable-next-line no-throw-literal
          throw 'Route Canceled';
        } else {
          callback?.();
        }
      }
    };

    Router.events.on('beforeHistoryChange', handler);

    return () => {
      Router.events.off('beforeHistoryChange', handler);
    };
  }, [isConfirm, message, allowedRoutes, callback]);
};

export default useLeavePageConfirm;
