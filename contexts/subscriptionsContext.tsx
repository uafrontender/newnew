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
  isLoading: false,
});

export const SubscriptionsProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.IUser[]>([]);
  const [creatorsImSubscribedTo, setCreatorsImSubscribedTo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      isLoading,
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
    async function fetchData() {
      if (!user.loggedIn) return;
      try {
        setIsLoading(true);

        const payloadMySubscribers = new newnewapi.GetMySubscribersRequest({
          paging: null,
        });
        const payloadcCreatorsImSubscribedTo = new newnewapi.EmptyRequest({});

        const resMySubscribers = await getMySubscribers(payloadMySubscribers);
        const resCreatorsImSubscribedTo = await getCreatorsImSubscribedTo(payloadcCreatorsImSubscribedTo);

        if (!resMySubscribers.data || resMySubscribers.error) {
          if (!resCreatorsImSubscribedTo.data || resCreatorsImSubscribedTo.error) {
            throw new Error(
              `${resMySubscribers.error?.message}
              ${resCreatorsImSubscribedTo.error?.message}` ?? 'Request failed'
            );
          } else {
            setCreatorsImSubscribedTo(resCreatorsImSubscribedTo.data?.creatorUuids as []);
            throw new Error(resMySubscribers.error?.message ?? 'Request failed');
          }
        } else {
          setMySubscribers(resMySubscribers.data?.subscribers as newnewapi.IUser[]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user.loggedIn]);

  return <SubscriptionsContext.Provider value={contextValue}>{children}</SubscriptionsContext.Provider>;
};

export function getSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) throw new Error('getSubscriptions must be used inside a `SubscriptionsProvider`');
  return context;
}
