import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import { getCreatorsIFollow } from '../api/endpoints/user';
import { useAppState } from './appStateContext';

export const FollowingsContext = createContext({
  followingsIds: [] as string[],
  isLoading: false,
  addId: (id: string) => {},
  removeId: (id: string) => {},
});

interface IFollowingsContextProvider {
  children: React.ReactNode;
}

const FollowingsContextProvider: React.FC<IFollowingsContextProvider> = ({
  children,
}) => {
  const { userLoggedIn, logoutAndRedirect } = useAppState();

  const [followingsIds, setFollowingsIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addId = useCallback((id: string) => {
    setFollowingsIds((curr) => [...curr, id]);
  }, []);

  const removeId = useCallback((id: string) => {
    setFollowingsIds((curr) => curr.filter((i) => i !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      followingsIds,
      isLoading,
      addId,
      removeId,
    }),
    [followingsIds, isLoading, addId, removeId]
  );

  useEffect(() => {
    async function fetchIds() {
      if (!userLoggedIn) {
        return;
      }

      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});

        const res = await getCreatorsIFollow(payload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }

        setFollowingsIds(res.data.userUuids);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }
      }
    }

    fetchIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn]);

  return (
    <FollowingsContext.Provider value={contextValue}>
      {children}
    </FollowingsContext.Provider>
  );
};

export default FollowingsContextProvider;
