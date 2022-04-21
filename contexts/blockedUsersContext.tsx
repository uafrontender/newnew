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
import { getMyBlockedUsers } from '../api/endpoints/user';

const BlockedUsersContext = createContext({
  usersBlockedMe: [] as string[],
  usersIBlocked: [] as string[],
  blockUser: (uuid: string) => {},
  unblockUser: (uuid: string) => {},
  usersBlockedLoading: false,
});

export const BlockedUsersProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [usersBlockedMe, setUsersBlockedMe] = useState<string[]>([]);
  const [usersIBlocked, setUsersIBlocked] = useState<string[]>([]);
  const [usersBlockedLoading, setUsersBlockedLoading] = useState(false);

  const blockUser = (uuid: string) => {
    setUsersIBlocked((curr) => [...curr, uuid]);
  };

  const unblockUser = (uuid: string) => {
    setUsersIBlocked((curr) => curr.filter((i) => i !== uuid));
  };

  const contextValue = useMemo(
    () => ({
      usersBlockedMe,
      usersIBlocked,
      usersBlockedLoading,
      blockUser,
      unblockUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usersBlockedMe, usersIBlocked, blockUser, unblockUser]
  );

  useEffect(() => {
    async function fetchBlockedUsers() {
      if (!user.loggedIn) return;
      try {
        setUsersBlockedLoading(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getMyBlockedUsers(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        setUsersIBlocked(res.data.userUuidsIBlocked);
        setUsersBlockedMe(res.data.userUuidsBlockedMe);
      } catch (err) {
        console.error(err);
        setUsersBlockedLoading(false);
      }
    }
    fetchBlockedUsers();
  }, [user.loggedIn]);

  return (
    <BlockedUsersContext.Provider value={contextValue}>
      {children}
    </BlockedUsersContext.Provider>
  );
};

export function useGetBlockedUsers() {
  const context = useContext(BlockedUsersContext);
  if (!context)
    throw new Error(
      'useGetBlockedUsers must be used inside a `BlockedUsersProvider`'
    );
  return context;
}
