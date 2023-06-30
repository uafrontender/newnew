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
import { SocketContext } from './socketContext';
import { getTotalUnreadMessageCounts } from '../api/endpoints/chat';
import { useBundles } from './bundlesContext';
import { useAppState } from './appStateContext';

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
  const { userLoggedIn } = useAppState();
  const { bundles, hasSoldBundles } = useBundles();

  const chatsWithCreatorsAvailable = useMemo(
    () => !!bundles && bundles.length > 0,
    [bundles]
  );

  const chatsWithBundleOwnersAvailable = useMemo(
    () => hasSoldBundles,
    [hasSoldBundles]
  );

  const isChatAvailable = useMemo(
    () => chatsWithCreatorsAvailable || chatsWithBundleOwnersAvailable,
    [chatsWithCreatorsAvailable, chatsWithBundleOwnersAvailable]
  );

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
      if (!userLoggedIn) {
        return;
      }

      try {
        const payload = new newnewapi.EmptyRequest();
        const res = await getTotalUnreadMessageCounts(
          payload,
          controller.signal
        );

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    if (isChatAvailable) {
      getUnread();
    }

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [userLoggedIn, isChatAvailable, setData]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatUnreadCountsChanged.decode(arr);

      if (!decoded) {
        return;
      }

      setData(decoded.chatUnreadCounts as newnewapi.TotalUnreadMessageCounts);
    };

    if (userLoggedIn && socketConnection) {
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
  }, [socketConnection, userLoggedIn, setData]);

  const resetState = useCallback(() => {
    setUnreadCountForUser(0);
    setUnreadCountForCreator(0);
    setUnreadCount(0);
  }, []);

  const userWasLoggedIn = useRef(false);

  useEffect(() => {
    if (userWasLoggedIn.current && !userLoggedIn) {
      resetState();
    }

    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [userLoggedIn, resetState]);

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
