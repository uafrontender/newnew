import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import { getUnreadNotificationCount } from '../api/endpoints/notification';
import { SocketContext } from './socketContext';
import { useAppState } from './appStateContext';

const NotificationsContext = createContext({
  unreadNotificationCount: 0,
  notificationsDataLoaded: false,
  fetchNotificationCount: () => {},
});

interface INotificationsProvider {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<INotificationsProvider> = ({
  children,
}) => {
  const { userUuid, userLoggedIn } = useAppState();
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>(0);
  const [notificationsDataLoaded, setNotificationsDataLoaded] = useState(false);
  const { socketConnection } = useContext(SocketContext);

  const fetchNotificationCount = useCallback(async () => {
    if (!userLoggedIn) {
      return;
    }

    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getUnreadNotificationCount(payload);
      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Request failed');
      }

      if (
        res.data.unreadNotificationCount !== undefined &&
        res.data.unreadNotificationCount > 0
      ) {
        setUnreadNotificationCount(res.data.unreadNotificationCount);
      } else {
        setUnreadNotificationCount(0);
      }
      setNotificationsDataLoaded(true);
    } catch (err) {
      console.error(err);
      setUnreadNotificationCount(0);
    }
  }, [userLoggedIn]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount, userUuid]);

  useEffect(() => {
    const socketHandlerNotificationUnreadCountsChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.NotificationUnreadCountsChanged.decode(arr);
      if (!decoded) {
        return;
      }

      if (decoded.unreadCount !== undefined && decoded.unreadCount > 0) {
        setUnreadNotificationCount(decoded.unreadCount);
      } else {
        setUnreadNotificationCount(0);
      }
    };
    if (socketConnection) {
      socketConnection?.on(
        'NotificationUnreadCountsChanged',
        socketHandlerNotificationUnreadCountsChanged
      );
    }
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      unreadNotificationCount,
      notificationsDataLoaded,
      fetchNotificationCount,
    }),
    [unreadNotificationCount, notificationsDataLoaded, fetchNotificationCount]
  );

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used inside a `NotificationsProvider`'
    );
  }

  return context;
}
