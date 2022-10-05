import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import dateToTimestamp from '../utils/dateToTimestamp';
// import { SocketContext } from './socketContext';

export const PacksContext = createContext<{
  packs: newnewapi.Pack[];
  packsLoading: boolean;
  handleSetPacks: (newPacks: newnewapi.Pack[]) => void;
}>({
  packs: [],
  packsLoading: false,
  handleSetPacks: (newPacks: newnewapi.Pack[]) => {},
});

interface IPackContextProvider {
  children: React.ReactNode;
}

const PacksContextProvider: React.FC<IPackContextProvider> = ({ children }) => {
  // const user = useAppSelector((state) => state.user);
  // Socket
  // const socketConnection = useContext(SocketContext);

  const [packs, setPacks] = useState<newnewapi.Pack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPacks = useCallback((newPacks: newnewapi.Pack[]) => {
    setPacks(newPacks);
  }, []);

  const contextValue = useMemo(
    () => ({
      packs,
      packsLoading: isLoading,
      handleSetPacks,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [packs, isLoading]
  );

  // TODO: Remove test data
  useEffect(() => {
    setPacks([
      new newnewapi.Pack({
        creator: new newnewapi.User({
          uuid: '3d537e81-d2dc-4bb3-9698-39152a817ab5',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        createdAt: dateToTimestamp(new Date()),
        subscriptionExpiresAt: dateToTimestamp(
          new Date(Date.now() + 5356800000)
        ),
        votesLeft: 4,
      }),
      new newnewapi.Pack({
        creator: new newnewapi.User({
          uuid: 'c82f8990-5ef3-4a6f-b289-b14117a1094a',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        createdAt: dateToTimestamp(new Date()),
        subscriptionExpiresAt: dateToTimestamp(
          new Date(Date.now() + 8356800000)
        ),
        votesLeft: 4500,
      }),
      /* new newnewapi.Pack({
          creator: new newnewapi.User({
            uuid: 'b8ba2486-48d6-4c55-9cd7-a494d0b79f98',
            avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
            nickname: 'CreatorDisplayName',
            username: 'username',
          }),
          createdAt: dateToTimestamp(new Date()),
          subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 231,
        }),
        new newnewapi.Pack({
          creator: new newnewapi.User({
            uuid:'6702c9e9-9f53-4c98-85d7-d9ffa2f22599',
            avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
            nickname: 'CreatorDisplayName',
            username: 'username',
          }),
          createdAt: dateToTimestamp(new Date()),
          subscriptionExpiresAt: dateToTimestamp(new Date(Date.now() + 7356800000)),
          votesLeft: 19465,
        }), */
    ]);
  }, []);

  // TODO: Integrate pack loading
  // Load packs
  /* useEffect(() => {
    async function fetchBalance() {
      if (!user.loggedIn) {
        setPackBalance(undefined);
        return;
      }

      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});
        const res = await getPackBalance(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        setPackBalance(
          (res.data.rewardBalance as newnewapi.MoneyAmount) ?? undefined
        );

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [user.loggedIn]);*/

  // TODO: Integrate pack updates
  // Listen for socket updates
  /* useEffect(() => {
    const handlerBalanceUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PackBalanceChanged.decode(arr);

      if (!decoded) return;

      setPackBalance(
        (decoded.currentBalance as newnewapi.MoneyAmount) ?? undefined
      );
    };

    const handlePackReceived = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PackReceived.decode(arr);

      if (!decoded || !decoded.reward) {
        return;
      }

      const MAX_SUPPORTED_REWARDS_TYPE = 13;
      const type: number = decoded.reward.type!;

      if (type < 0 || type > MAX_SUPPORTED_REWARDS_TYPE) {
        console.error(`Unsupported reward type ${type}`);
        return;
      }

      show({
        titleKey: `rewards.modalTitle`,
        titleProps: {
          amount: Math.floor(decoded.reward.amount!.usdCents! / 100),
        },
        descriptionKey: `rewards.modalDescription.${type}`,
        descriptionProps: decoded.reward.extra ?? undefined,
        buttonTextKey: `rewards.modalButton`,
      });
    };

    if (socketConnection && user.loggedIn) {
      socketConnection?.on('PackBalanceChanged', handlerBalanceUpdated);
      socketConnection?.on('PackReceived', handlePackReceived);
    }

    return () => {
      if (socketConnection && socketConnection?.connected && user.loggedIn) {
        socketConnection?.off('PackBalanceChanged', handlerBalanceUpdated);
        socketConnection?.off('PackReceived', handlePackReceived);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.loggedIn]);*/

  return (
    <PacksContext.Provider value={contextValue}>
      {children}
    </PacksContext.Provider>
  );
};

export default PacksContextProvider;
