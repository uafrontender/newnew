/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import { getUnreadNotificationCount } from '../api/endpoints/notification';
import { SocketContext } from './socketContext';

const NotificationsContext = createContext({
  unreadNotificationCount: 0,
  fetchNotificationCount: () => {},
});

interface INotificationsProvider {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<INotificationsProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { socketConnection } = useContext(SocketContext);

  const fetchNotificationCount = useCallback(async () => {
    if (!user.loggedIn) {
      return;
    }

    try {
      setNotificationsLoading(true);
      const payload = new newnewapi.EmptyRequest();
      const res = await getUnreadNotificationCount(payload);
      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      if (
        res.data.unreadNotificationCount !== undefined &&
        res.data.unreadNotificationCount > 0
      ) {
        setUnreadNotificationCount(res.data.unreadNotificationCount);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (err) {
      console.error(err);
      setNotificationsLoading(false);
      setUnreadNotificationCount(0);
    }
  }, [user.loggedIn]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount, user.userData?.userUuid]);

  useEffect(() => {
    const socketHandlerNotificationUnreadCountsChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.NotificationUnreadCountsChanged.decode(arr);
      if (!decoded) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      unreadNotificationCount,
      notificationsLoading,
      fetchNotificationCount,
    }),
    [unreadNotificationCount, fetchNotificationCount, notificationsLoading]
  );

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      'useNotifications must be used inside a `NotificationsProvider`'
    );
  return context;
}
