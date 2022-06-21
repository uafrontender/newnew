/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';
import { getTotalUnreadMessageCounts } from '../api/endpoints/chat';

const ChatsContext = createContext({
  unreadCountForUser: 0,
  unreadCountForCreator: 0,
  unreadCount: 0,
});

interface IChatsProvider {
  children: React.ReactNode;
}

export const ChatsProvider: React.FC<IChatsProvider> = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [unreadCountForUser, setUnreadCountForUser] = useState<number>(0);
  const [unreadCountForCreator, setUnreadCountForCreator] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketConnection = useContext(SocketContext);

  const setData = useCallback(
    (data: newnewapi.TotalUnreadMessageCounts) => {
      setUnreadCountForCreator(data.unreadCountForCreator);
      setUnreadCountForUser(data.unreadCountForUser);
      setUnreadCount(data.unreadCountForCreator + data.unreadCountForUser);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    async function getUnread() {
      if (!user.loggedIn) return;
      try {
        // setLoadingRooms(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getTotalUnreadMessageCounts(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        setData(res.data);
      } catch (err) {
        console.error(err);
        // setLoadingRooms(false);
      }
    }
    getUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatUnreadCountsChanged.decode(arr);

      if (!decoded) return;

      setData(decoded.chatUnreadCounts as newnewapi.TotalUnreadMessageCounts);
    };

    if (socketConnection) {
      socketConnection?.on(
        'ChatUnreadCountsChanged',
        socketHandlerMessageCreated
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      unreadCountForUser,
      unreadCountForCreator,
      unreadCount,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadCount, unreadCountForUser, unreadCountForCreator, setData]
  );

  return (
    <ChatsContext.Provider value={contextValue}>
      {children}
    </ChatsContext.Provider>
  );
};

export function useGetChats() {
  const context = useContext(ChatsContext);
  if (!context)
    throw new Error('useGetChat must be used inside a `ChatProvider`');
  return context;
}
