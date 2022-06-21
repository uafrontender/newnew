/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import {
  getMySubscribers,
  getCreatorsImSubscribedTo,
} from '../api/endpoints/subscription';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';

const SubscriptionsContext = createContext({
  mySubscribers: [] as newnewapi.ISubscriber[],
  addSubscriber: (subscriber: newnewapi.ISubscriber) => {},
  removeSubscriber: (subscriberUuid: string) => {},
  creatorsImSubscribedTo: [] as newnewapi.IUser[],
  addCreatorsImSubscribedTo: (creator: newnewapi.IUser) => {},
  removeCreatorsImSubscribedTo: (creator: newnewapi.IUser) => {},
  isMySubscribersIsLoading: false,
  isCreatorsImSubscribedToLoading: false,
  newSubscriber: {} as newnewapi.ICreatorSubscriptionChanged,
  mySubscribersTotal: 0,
  fetchCreatorsImSubscribedTo: () => {},
});

interface ISubscriptionsProvider {
  children: React.ReactNode;
}

export const SubscriptionsProvider: React.FC<ISubscriptionsProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.ISubscriber[]>(
    []
  );
  const [mySubscribersTotal, setMySubscribersTotal] = useState<number>(0);
  const [creatorsImSubscribedTo, setCreatorsImSubscribedTo] = useState<
    newnewapi.IUser[]
  >([]);
  const [isMySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [isCreatorsImSubscribedToLoading, setCreatorsImSubscribedToLoading] =
    useState(false);

  const [newSubscriber, setNewSubscriber] =
    useState<newnewapi.ICreatorSubscriptionChanged>({});

  const socketConnection = useContext(SocketContext);

  const addSubscriber = (subscriber: newnewapi.ISubscriber) => {
    setMySubscribers((curr) => [...curr, subscriber]);
    setMySubscribersTotal((curr) => curr + 1);
  };

  const removeSubscriber = (subscriberUuid: string) => {
    setMySubscribers((curr) => {
      let arr = [...curr];
      arr.filter((i) => i.user?.uuid !== subscriberUuid);
      return arr;
    });
    setMySubscribersTotal((curr) => curr - 1);
  };

  const addCreatorsImSubscribedTo = (creator: newnewapi.IUser) => {
    setCreatorsImSubscribedTo((curr) => [...curr, creator]);
  };

  const removeCreatorsImSubscribedTo = (creator: newnewapi.IUser) => {
    setCreatorsImSubscribedTo((curr) =>
      curr.filter((i) => i.uuid !== creator.uuid)
    );
  };

  // useEffect(() => {
  //   if (newSubscriber.subscriberUuid) {
  //     console.log(newSubscriber);

  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [newSubscriber]);

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
      mySubscribersTotal,
      fetchCreatorsImSubscribedTo,
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
      mySubscribersTotal,
      fetchCreatorsImSubscribedTo,
    ]
  );

  async function fetchCreatorsImSubscribedTo() {
    if (!user.loggedIn) return;
    try {
      setCreatorsImSubscribedToLoading(true);
      const payload = new newnewapi.EmptyRequest({});
      const res = await getCreatorsImSubscribedTo(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setCreatorsImSubscribedTo(res.data.creators as []);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatorsImSubscribedToLoading(false);
    }
  }

  async function fetchMySubscribers() {
    if (!user.loggedIn) return;
    try {
      setMySubscribersIsLoading(true);
      const payload = new newnewapi.GetMySubscribersRequest({
        paging: null,
      });
      const res = await getMySubscribers(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      setMySubscribers(res.data.subscribers as newnewapi.ISubscriber[]);
      res.data.paging?.total
        ? setMySubscribersTotal(res.data.paging?.total)
        : setMySubscribersTotal(0);
      setMySubscribersIsLoading(false);
    } catch (err) {
      console.error(err);
      setMySubscribersIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMySubscribers();
    fetchCreatorsImSubscribedTo();
  }, [user.loggedIn]);

  useEffect(() => {
    const handlerSubscriptionUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorSubscriptionChanged.decode(arr);

      if (!decoded) return;

      setNewSubscriber(decoded);

      // TODO: Request backend team functionality to send newnewapi.ISubscriber[] or newnewapi.IUser[] in decoded response
      if (decoded.subscriberUuid !== user.userData?.userUuid) {
        fetchMySubscribers();
      } else {
        fetchCreatorsImSubscribedTo();
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'CreatorSubscriptionChanged',
        handlerSubscriptionUpdated
      );
    }
  }, [socketConnection]);

  return (
    <SubscriptionsContext.Provider value={contextValue}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export function useGetSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context)
    throw new Error(
      'useGetSubscriptions must be used inside a `SubscriptionsProvider`'
    );
  return context;
}
