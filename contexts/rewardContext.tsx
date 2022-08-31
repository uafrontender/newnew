/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { getRewardBalance } from '../api/endpoints/payments';
import { useAppSelector } from '../redux-store/store';
import { ModalNotificationsContext } from './modalNotificationsContext';
import { SocketContext } from './socketContext';

export const RewardContext = createContext<{
  rewardBalance?: newnewapi.MoneyAmount;
  isRewardBalanceLoading: boolean;
  handleSetRewardBalance: (newAmount: newnewapi.MoneyAmount) => void;
}>({
  rewardBalance: undefined,
  isRewardBalanceLoading: false,
  handleSetRewardBalance: (newAmount: newnewapi.MoneyAmount) => {},
});

interface IRewardContextProvider {
  children: React.ReactNode;
}

const RewardContextProvider: React.FC<IRewardContextProvider> = ({
  children,
}) => {
  const { show } = useContext(ModalNotificationsContext);
  const user = useAppSelector((state) => state.user);
  // Socket
  const socketConnection = useContext(SocketContext);

  const [rewardBalance, setRewardBalance] = useState<
    newnewapi.MoneyAmount | undefined
  >(new newnewapi.MoneyAmount());
  const [isLoading, setIsLoading] = useState(false);

  const handleSetRewardBalance = useCallback(
    (newAmount: newnewapi.MoneyAmount) => {
      setRewardBalance(newAmount);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      rewardBalance,
      isRewardBalanceLoading: isLoading,
      handleSetRewardBalance,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [rewardBalance, isLoading]
  );

  // Set up initial balance
  useEffect(() => {
    async function fetchBalance() {
      if (!user.loggedIn) {
        setRewardBalance(undefined);
        return;
      }

      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});
        const res = await getRewardBalance(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        setRewardBalance(
          (res.data.rewardBalance as newnewapi.MoneyAmount) ?? undefined
        );

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [user.loggedIn]);

  // Listen for socket updates
  useEffect(() => {
    const handlerBalanceUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.RewardBalanceChanged.decode(arr);

      if (!decoded) return;

      setRewardBalance(
        (decoded.currentBalance as newnewapi.MoneyAmount) ?? undefined
      );
    };

    const handleRewardReceived = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.RewardReceived.decode(arr);

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
      socketConnection?.on('RewardBalanceChanged', handlerBalanceUpdated);
      socketConnection?.on('RewardReceived', handleRewardReceived);
    }

    return () => {
      if (socketConnection && socketConnection?.connected && user.loggedIn) {
        socketConnection?.off('RewardBalanceChanged', handlerBalanceUpdated);
        socketConnection?.off('RewardReceived', handleRewardReceived);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.loggedIn]);

  return (
    <RewardContext.Provider value={contextValue}>
      {children}
    </RewardContext.Provider>
  );
};

export default RewardContextProvider;
