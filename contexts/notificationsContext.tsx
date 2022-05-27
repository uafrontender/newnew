/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import { getUnreadNotificationCount } from '../api/endpoints/notification';
import { SocketContext } from './socketContext';

const NotificationsContext = createContext({
  unreadNotificationCount: 0,
});

export const NotificationsProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const socketConnection = useContext(SocketContext);

  const contextValue = useMemo(
    () => ({
      unreadNotificationCount,
      notificationsLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadNotificationCount]
  );

  useEffect(() => {
    async function fetchNotificationCount() {
      if (!user.loggedIn) return;
      try {
        setNotificationsLoading(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getUnreadNotificationCount(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (
          res.data.unreadNotificationCount !== undefined &&
          res.data.unreadNotificationCount > 0
        ) {
          setUnreadNotificationCount(res.data.unreadNotificationCount);
        } else {
          setUnreadNotificationCount(0);
        }
        console.log(`Unread ${res.data.unreadNotificationCount}`);
      } catch (err) {
        console.error(err);
        setNotificationsLoading(false);
        setUnreadNotificationCount(0);
      }
    }
    fetchNotificationCount();
  }, [user.loggedIn]);

  useEffect(() => {
    const socketHandlerNotificationUnreadCountsChanged = async (data: any) => {
      console.log(`1`);
      const arr = new Uint8Array(data);
      const decoded = newnewapi.NotificationUnreadCountsChanged.decode(arr);
      console.log(`Decoded ${decoded.unreadCount}`);
      if (!decoded) return;
      if (decoded.unreadCount !== undefined && decoded.unreadCount > 0) {
        setUnreadNotificationCount(decoded.unreadCount);
      } else {
        setUnreadNotificationCount(0);
      }
    };
    if (socketConnection) {
      socketConnection.on(
        'NotificationUnreadCountsChanged',
        socketHandlerNotificationUnreadCountsChanged
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

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
