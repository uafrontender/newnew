import Router from 'next/router';
import { useEffect } from 'react';
import { useBeforeUnload } from 'react-use';

export const useLeavePageConfirm = (
  isConfirm: boolean,
  message: string,
  allowedRoutes: string[],
) => {
  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    const handler = (route: string) => {
      const r = route.slice(0, route.indexOf('?'));
      if (!allowedRoutes.includes(r) && isConfirm && !window.confirm(message)) {
        // eslint-disable-next-line no-throw-literal
        throw 'Route Canceled';
      }
    };

    Router.events.on('beforeHistoryChange', handler);

    return () => {
      Router.events.off('beforeHistoryChange', handler);
    };
  }, [isConfirm, message, allowedRoutes]);
};

export default useLeavePageConfirm;
