/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, {
  createContext, useState, useMemo, useEffect,
} from 'react';
import { getCreatorsIFollow } from '../api/endpoints/user';
import { useAppSelector } from '../redux-store/store';

export const FollowingsContext = createContext({
  followingsIds: [] as string[],
  isLoading: false,
  addId: (id: string) => {},
  removeId: (id: string) => {},
});

const FollowingsContextProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);

  const [followingsIds, setFollowingsIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addId = (id: string) => {
    setFollowingsIds((curr) => [...curr, id]);
  }

  const removeId = (id: string) => {
    setFollowingsIds((curr) => curr.filter((i) => i !== id));
  }

  const contextValue = useMemo(() => ({
    followingsIds,
    isLoading,
    addId,
    removeId,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [followingsIds, removeId, addId, removeId]);

  useEffect(() => {
    async function fetchIds() {
      if (!user.loggedIn) return;
      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});

        const res = await getCreatorsIFollow(payload);

        console.log(res)

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

        setFollowingsIds(res.data.userUuids);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchIds();
  }, [user.loggedIn]);

  return (
    <FollowingsContext.Provider
      value={contextValue}
    >
      {children}
    </FollowingsContext.Provider>
  );
}

export default FollowingsContextProvider;
