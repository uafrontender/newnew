import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';
import { getTotalUnreadMessageCounts } from '../api/endpoints/chat';
import { useBundles } from './bundlesContext';

interface IChatsUnreadMessagesContext {
  unreadCountForUser: number;
  unreadCountForCreator: number;
  unreadCount: number;
}

const ChatsUnreadMessagesContext = createContext<IChatsUnreadMessagesContext>({
  unreadCountForUser: 0,
  unreadCountForCreator: 0,
  unreadCount: 0,
});

interface IChatsUnreadMessagesProvider {
  children: React.ReactNode;
}

export const ChatsUnreadMessagesProvider: React.FC<
  IChatsUnreadMessagesProvider
> = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const { bundles } = useBundles();

  const [unreadCountForUser, setUnreadCountForUser] = useState<number>(0);
  const [unreadCountForCreator, setUnreadCountForCreator] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { socketConnection } = useContext(SocketContext);

  const setData = useCallback((data: newnewapi.TotalUnreadMessageCounts) => {
    setUnreadCountForCreator(data.unreadCountForCreator);
    setUnreadCountForUser(data.unreadCountForUser);
    setUnreadCount(data.unreadCountForCreator + data.unreadCountForUser);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function getUnread() {
      if (!user.loggedIn) {
        return;
      }

      try {
        const payload = new newnewapi.EmptyRequest();
        const res = await getTotalUnreadMessageCounts(
          payload,
          controller.signal
        );

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    getUnread();

    return () => {
      if (controller) {
        controller.abort();
      }
    };
    // Need dependency on bundles to refetch data on bundles changed
  }, [user.loggedIn, setData, bundles?.length]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatUnreadCountsChanged.decode(arr);

      if (!decoded) {
        return;
      }

      setData(decoded.chatUnreadCounts as newnewapi.TotalUnreadMessageCounts);
    };

    if (user.loggedIn && socketConnection) {
      socketConnection?.on(
        'ChatUnreadCountsChanged',
        socketHandlerMessageCreated
      );
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'ChatUnreadCountsChanged',
          socketHandlerMessageCreated
        );
      }
    };
  }, [socketConnection, user.loggedIn, setData]);

  const resetState = useCallback(() => {
    setUnreadCountForUser(0);
    setUnreadCountForCreator(0);
    setUnreadCount(0);
  }, []);

  const userWasLoggedIn = useRef(false);

  useEffect(() => {
    if (userWasLoggedIn.current && !user.loggedIn) {
      resetState();
    }

    if (user.loggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [user.loggedIn, resetState]);

  const contextValue = useMemo(
    () => ({
      unreadCountForUser,
      unreadCountForCreator,
      unreadCount,
    }),
    [unreadCount, unreadCountForUser, unreadCountForCreator]
  );

  return (
    <ChatsUnreadMessagesContext.Provider value={contextValue}>
      {children}
    </ChatsUnreadMessagesContext.Provider>
  );
};

export function useChatsUnreadMessages() {
  const context = useContext(ChatsUnreadMessagesContext);
  if (!context) {
    throw new Error(
      'useChatsUnreadMessages must be used inside a `ChatProvider`'
    );
  }

  return context;
}
