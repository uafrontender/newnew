/* eslint-disable no-unused-vars */
import React, { useEffect, createContext, useContext, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';
import { getTotalUnreadMessageCounts } from '../api/endpoints/chat';

const ChatsContext = createContext({
  unreadCountForUser: 0,
  unreadCountForCreator: 0,
  unreadCount: 0,
});

export const ChatsProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [unreadCountForUser, setUnreadCountForUser] = useState<number>(0);
  const [unreadCountForCreator, setUnreadCountForCreator] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketConnection = useContext(SocketContext);

  useEffect(() => {
    async function getUnread() {
      if (!user.loggedIn) return;
      try {
        // setLoadingRooms(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getTotalUnreadMessageCounts(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        console.log(res.data);

        if (res.data.unreadCountForCreator) setUnreadCountForCreator(res.data.unreadCountForCreator);
        if (res.data.unreadCountForUser) setUnreadCountForUser(res.data.unreadCountForUser);

        if (res.data.unreadCountForCreator || res.data.unreadCountForUser)
          setUnreadCount(res.data.unreadCountForCreator + res.data.unreadCountForUser);
      } catch (err) {
        console.error(err);
        // setLoadingRooms(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getUnread();
  }, [user.loggedIn]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      console.log('1');
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (!decoded) return;
    };

    if (socketConnection) {
      console.log('1');
      socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
    }
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      unreadCountForUser,
      unreadCountForCreator,
      unreadCount,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadCount, unreadCountForUser, unreadCountForCreator]
  );

  return <ChatsContext.Provider value={contextValue}>{children}</ChatsContext.Provider>;
};

export function useGetChats() {
  const context = useContext(ChatsContext);
  if (!context) throw new Error('useGetChat must be used inside a `ChatProvider`');
  return context;
}
