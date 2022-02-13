import React, { useEffect } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { getMySubscribers, getCreatorsImSubscribedTo } from '../api/endpoints/subscription';
import { useAppSelector } from '../redux-store/store';

const SubscriptionsContext = createContext({
  mySubscribers: [] as newnewapi.IUser[],
  addSubscriber: (subscriber: newnewapi.IUser) => {},
  removeSubscriber: (subscriber: newnewapi.IUser) => {},
  creatorsImSubscribedTo: [] as string[],
  addCreatorsImSubscribedTo: (creatorId: string) => {},
  removeCreatorsImSubscribedTo: (creatorId: string) => {},
  isMySubscribersIsLoading: false,
  isCreatorsImSubscribedToLoading: false,
});

export const SubscriptionsProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.IUser[]>([]);
  const [creatorsImSubscribedTo, setCreatorsImSubscribedTo] = useState<string[]>([]);
  const [isMySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [isCreatorsImSubscribedToLoading, setCreatorsImSubscribedToLoading] = useState(false);

  const addSubscriber = (subscriber: newnewapi.IUser) => {
    setMySubscribers((curr) => [...curr, subscriber]);
  };

  const removeSubscriber = (subscriber: newnewapi.IUser) => {
    setMySubscribers((curr) => curr.filter((i) => i.uuid !== subscriber.uuid));
  };

  const addCreatorsImSubscribedTo = (creatorId: string) => {
    setCreatorsImSubscribedTo((curr) => [...curr, creatorId]);
  };

  const removeCreatorsImSubscribedTo = (creatorId: string) => {
    setCreatorsImSubscribedTo((curr) => curr.filter((i) => i !== creatorId));
  };

  const contextValue = useMemo(
    () => ({
      mySubscribers,
      addSubscriber,
      removeSubscriber,
      creatorsImSubscribedTo,
      addCreatorsImSubscribedTo,
      removeCreatorsImSubscribedTo,
      isMySubscribersIsLoading,
      isCreatorsImSubscribedToLoading,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [
      mySubscribers,
      addSubscriber,
      removeSubscriber,
      creatorsImSubscribedTo,
      addCreatorsImSubscribedTo,
      removeCreatorsImSubscribedTo,
    ]
  );

  useEffect(() => {
    async function fetchMySubscribers() {
      if (!user.loggedIn) return;
      try {
        setMySubscribersIsLoading(true);
        const payload = new newnewapi.GetMySubscribersRequest({
          paging: null,
        });
        const res = await getMySubscribers(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setMySubscribers(res.data.subscribers as newnewapi.IUser[]);
      } catch (err) {
        console.error(err);
        setMySubscribersIsLoading(false);
      }
    }

    async function fetchCreatorsImSubscribedTo() {
      if (!user.loggedIn) return;
      try {
        setCreatorsImSubscribedToLoading(true);
        const payload = new newnewapi.EmptyRequest({});
        const res = await getCreatorsImSubscribedTo(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setCreatorsImSubscribedTo(res.data.creatorUuids as []);
      } catch (err) {
        console.error(err);
        setCreatorsImSubscribedToLoading(false);
      }
    }

    fetchMySubscribers();
    fetchCreatorsImSubscribedTo();
  }, [user.loggedIn]);

  return <SubscriptionsContext.Provider value={contextValue}>{children}</SubscriptionsContext.Provider>;
};

export function getSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) throw new Error('getSubscriptions must be used inside a `SubscriptionsProvider`');
  return context;
}
