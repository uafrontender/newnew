/* eslint-disable no-unused-expressions */
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
import { getMyBlockedUsers, markUser } from '../api/endpoints/user';
import { SocketContext } from './socketContext';
import useErrorToasts from '../utils/hooks/useErrorToasts';

const BlockedUsersContext = createContext({
  usersBlockedMe: [] as string[],
  usersIBlocked: [] as string[],
  usersBlockedLoaded: false,
  changeUserBlockedStatus: (
    uuid: string | null | undefined,
    block: boolean
  ) => {},
});

interface IBlockedUsersProvider {
  children: React.ReactNode;
}

export const BlockedUsersProvider: React.FC<IBlockedUsersProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);
  const [usersBlockedMe, setUsersBlockedMe] = useState<string[]>([]);
  const [usersIBlocked, setUsersIBlocked] = useState<string[]>([]);
  const [usersBlockedLoading, setUsersBlockedLoading] = useState(false);
  const [usersBlockedLoaded, setUsersBlockedLoaded] = useState(false);
  const socketConnection = useContext(SocketContext);
  const { showErrorToastPredefined } = useErrorToasts();

  const changeUserBlockedStatus = useCallback(
    async (uuid: string | null | undefined, block: boolean) => {
      try {
        if (!uuid) throw new Error('No uuid provided');
        const payload = new newnewapi.MarkUserRequest({
          markAs: block
            ? newnewapi.MarkUserRequest.MarkAs.BLOCKED
            : newnewapi.MarkUserRequest.MarkAs.NOT_BLOCKED,
          userUuid: uuid,
        });
        const res = await markUser(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        block
          ? setUsersIBlocked((curr) => [...curr, uuid])
          : setUsersIBlocked((curr) => curr.filter((i) => i !== uuid));
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      }
    },
    []
  );

  useEffect(() => {
    async function fetchBlockedUsers() {
      if (!user.loggedIn || usersBlockedLoading) {
        if (!user.loggedIn) {
          setUsersBlockedMe([]);
          setUsersIBlocked([]);
        }

        return;
      }

      try {
        setUsersBlockedLoading(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getMyBlockedUsers(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        setUsersIBlocked(res.data.userUuidsIBlocked);
        setUsersBlockedMe(res.data.userUuidsBlockedMe);
        setUsersBlockedLoaded(true);
      } catch (err) {
        console.error(err);
        setUsersBlockedLoading(false);
      }
    }
    fetchBlockedUsers();
  }, [user.loggedIn]);

  useEffect(() => {
    const socketHandlerUserBlockStatusChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.BlockStatusChanged.decode(arr);
      if (!decoded) return;
      console.log(decoded);

      decoded.isBlocked
        ? setUsersBlockedMe((curr) => [...curr, decoded.userUuid])
        : setUsersBlockedMe((curr) =>
            curr.filter((uuid) => uuid !== decoded.userUuid)
          );
    };
    if (socketConnection) {
      socketConnection?.on(
        'BlockStatusChanged',
        socketHandlerUserBlockStatusChanged
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      usersBlockedMe,
      usersIBlocked,
      usersBlockedLoaded,
      changeUserBlockedStatus,
    }),
    [usersBlockedMe, usersIBlocked, changeUserBlockedStatus, usersBlockedLoaded]
  );

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
