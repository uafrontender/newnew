/* eslint-disable no-unused-vars */
import React, { useEffect, createContext, useContext, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { getMySubscribers, getCreatorsImSubscribedTo } from '../api/endpoints/subscription';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';

const SubscriptionsContext = createContext({
  mySubscribers: [] as newnewapi.ISubscriber[],
  addSubscriber: (subscriber: newnewapi.ISubscriber) => {},
  removeSubscriber: (subscriber: newnewapi.ISubscriber) => {},
  creatorsImSubscribedTo: [] as newnewapi.IUser[],
  addCreatorsImSubscribedTo: (creator: newnewapi.IUser) => {},
  removeCreatorsImSubscribedTo: (creator: newnewapi.IUser) => {},
  isMySubscribersIsLoading: false,
  isCreatorsImSubscribedToLoading: false,
  newSubscriber: {} as newnewapi.ICreatorSubscriptionChanged,
});

export const SubscriptionsProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.ISubscriber[]>([]);
  const [creatorsImSubscribedTo, setCreatorsImSubscribedTo] = useState<newnewapi.IUser[]>([]);
  const [isMySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [isCreatorsImSubscribedToLoading, setCreatorsImSubscribedToLoading] = useState(false);

  const [newSubscriber, setNewSubscriber] = useState<newnewapi.ICreatorSubscriptionChanged>({});

  const socketConnection = useContext(SocketContext);

  const addSubscriber = (subscriber: newnewapi.ISubscriber) => {
    setMySubscribers((curr) => [...curr, subscriber]);
  };

  const removeSubscriber = (subscriber: newnewapi.ISubscriber) => {
    setMySubscribers((curr) => curr.filter((i) => i.user?.uuid !== subscriber.user?.uuid));
  };

  const addCreatorsImSubscribedTo = (creator: newnewapi.IUser) => {
    setCreatorsImSubscribedTo((curr) => [...curr, creator]);
  };

  const removeCreatorsImSubscribedTo = (creator: newnewapi.IUser) => {
    setCreatorsImSubscribedTo((curr) => curr.filter((i) => i.uuid !== creator.uuid));
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
      newSubscriber,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mySubscribers,
      addSubscriber,
      removeSubscriber,
      creatorsImSubscribedTo,
      addCreatorsImSubscribedTo,
      removeCreatorsImSubscribedTo,
      newSubscriber,
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
        setMySubscribers(res.data.subscribers as newnewapi.ISubscriber[]);
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
        setCreatorsImSubscribedTo(res.data.creators as []);
      } catch (err) {
        console.error(err);
        setCreatorsImSubscribedToLoading(false);
      }
    }

    fetchMySubscribers();
    fetchCreatorsImSubscribedTo();
  }, [user.loggedIn]);

  useEffect(() => {
    const handlerSubscriptionUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorSubscriptionChanged.decode(arr);

      if (!decoded) return;

      setNewSubscriber(decoded);
    };

    if (socketConnection) {
      socketConnection.on('CreatorSubscriptionChanged', handlerSubscriptionUpdated);
    }
  }, [socketConnection]);

  return <SubscriptionsContext.Provider value={contextValue}>{children}</SubscriptionsContext.Provider>;
};

export function useGetSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) throw new Error('useGetSubscriptions must be used inside a `SubscriptionsProvider`');
  return context;
}
