/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import { getCreatorsIFollow } from '../api/endpoints/user';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { logoutUserClearCookiesAndRedirect } from '../redux-store/slices/userStateSlice';
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { setUserLoggedIn } = useAppState();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [followingsIds, removeId, addId, removeId]
  );

  useEffect(() => {
    async function fetchIds() {
      if (!user.loggedIn) return;
      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});

        const res = await getCreatorsIFollow(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        setFollowingsIds(res.data.userUuids);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
          setUserLoggedIn(false);
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
          setUserLoggedIn(false);
        }
      }
    }

    fetchIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  return (
    <FollowingsContext.Provider value={contextValue}>
      {children}
    </FollowingsContext.Provider>
  );
};

export default FollowingsContextProvider;
