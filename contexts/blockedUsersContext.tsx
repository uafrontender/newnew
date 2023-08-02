import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { newnewapi } from 'newnew-api';
import { getMyBlockedUsers, markUser } from '../api/endpoints/user';
import { SocketContext } from './socketContext';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import { useAppState } from './appStateContext';

const BlockedUsersContext = createContext({
  usersBlockedMe: [] as string[],
  usersIBlocked: [] as string[],
  usersBlockedLoaded: false,
  changeUserBlockedStatus: async (
    uuid: string | null | undefined,
    block: boolean
  ) => {},
  isChangingUserBlockedStatus: false,
});

interface IBlockedUsersProvider {
  children: React.ReactNode;
}

export const BlockedUsersProvider: React.FC<IBlockedUsersProvider> = ({
  children,
}) => {
  const { userLoggedIn } = useAppState();
  const [usersBlockedMe, setUsersBlockedMe] = useState<string[]>([]);
  const [usersIBlocked, setUsersIBlocked] = useState<string[]>([]);
  const usersBlockedLoading = useRef(false);
  const [usersBlockedLoaded, setUsersBlockedLoaded] = useState(false);
  const [isChangingUserBlockedStatus, setIsChangingUserBlockedStatus] =
    useState(false);
  const { socketConnection } = useContext(SocketContext);
  const { showErrorToastPredefined } = useErrorToasts();

  const changeUserBlockedStatus = useCallback(
    async (uuid: string | null | undefined, block: boolean) => {
      setIsChangingUserBlockedStatus(true);
      try {
        if (!uuid) {
          throw new Error('No uuid provided');
        }

        const payload = new newnewapi.MarkUserRequest({
          markAs: block
            ? newnewapi.MarkUserRequest.MarkAs.BLOCKED
            : newnewapi.MarkUserRequest.MarkAs.NOT_BLOCKED,
          userUuid: uuid,
        });
        const res = await markUser(payload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }

        if (block) {
          setUsersIBlocked((curr) => [...curr, uuid]);
        } else {
          setUsersIBlocked((curr) => curr.filter((i) => i !== uuid));
        }
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      } finally {
        setIsChangingUserBlockedStatus(false);
      }
    },
    [showErrorToastPredefined]
  );

  useEffect(() => {
    async function fetchBlockedUsers() {
      if (!userLoggedIn) {
        setUsersBlockedMe([]);
        setUsersIBlocked([]);
      }

      if (!userLoggedIn || usersBlockedLoading.current) {
        return;
      }

      usersBlockedLoading.current = true;

      try {
        const payload = new newnewapi.EmptyRequest();
        const res = await getMyBlockedUsers(payload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }

        setUsersIBlocked(res.data.userUuidsIBlocked);
        setUsersBlockedMe(res.data.userUuidsBlockedMe);
        setUsersBlockedLoaded(true);
      } catch (err) {
        console.error(err);
      } finally {
        usersBlockedLoading.current = false;
      }
    }

    fetchBlockedUsers();
  }, [userLoggedIn]);

  useEffect(() => {
    const socketHandlerUserBlockStatusChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.BlockStatusChanged.decode(arr);
      if (!decoded) {
        return;
      }

      if (decoded.isBlocked) {
        setUsersBlockedMe((curr) => [...curr, decoded.userUuid]);
      } else {
        setUsersBlockedMe((curr) =>
          curr.filter((uuid) => uuid !== decoded.userUuid)
        );
      }
    };
    if (socketConnection) {
      socketConnection?.on(
        'BlockStatusChanged',
        socketHandlerUserBlockStatusChanged
      );
    }
  }, [socketConnection]);

  const contextValue = useMemo(
    () => ({
      usersBlockedMe,
      usersIBlocked,
      usersBlockedLoaded,
      changeUserBlockedStatus,
      isChangingUserBlockedStatus,
    }),
    [
      usersBlockedMe,
      usersIBlocked,
      changeUserBlockedStatus,
      usersBlockedLoaded,
      isChangingUserBlockedStatus,
    ]
  );

  return (
    <BlockedUsersContext.Provider value={contextValue}>
      {children}
    </BlockedUsersContext.Provider>
  );
};

export function useGetBlockedUsers() {
  const context = useContext(BlockedUsersContext);
  if (!context) {
    throw new Error(
      'useGetBlockedUsers must be used inside a `BlockedUsersProvider`'
    );
  }

  return context;
}
