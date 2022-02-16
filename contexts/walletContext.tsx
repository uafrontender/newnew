/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, {
  createContext, useState, useMemo, useEffect, useContext,
} from 'react';
import { getWalletBalance } from '../api/endpoints/payments';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';

export const WalletContext = createContext<{
  walletBalance?: newnewapi.MoneyAmount;
  isBalanceLoading: boolean;
  handleSetWalletBalance: (newAmount: newnewapi.MoneyAmount) => void;
}>({
  walletBalance: undefined,
  isBalanceLoading: false,
  handleSetWalletBalance: (newAmount: newnewapi.MoneyAmount) => {},
});

const WalletContextProvider: React.FC = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  // Socket
  const socketConnection = useContext(SocketContext);

  const [walletBalance, setWalletBalance] = useState<newnewapi.MoneyAmount | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetWalletBalance = (newAmount: newnewapi.MoneyAmount) => {
    setWalletBalance(newAmount);
  }

  const contextValue = useMemo(() => ({
    walletBalance,
    isBalanceLoading: isLoading,
    handleSetWalletBalance,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [walletBalance, isLoading]);

  // Set up initial balance
  useEffect(() => {
    async function fetchIds() {
      if (!user.loggedIn) return;
      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});

        const res = await getWalletBalance(payload);

        console.log(res);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

        setWalletBalance((res.data.walletBalance as newnewapi.MoneyAmount) ?? undefined);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchIds();
  }, [user.loggedIn]);

  // Listen for socket updates
  useEffect(() => {
    const handlerBalanceUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.WalletBalanceChanged.decode(arr);

      if (!decoded) return;

      console.log(decoded);

      setWalletBalance((decoded.currentBalance as newnewapi.MoneyAmount) ?? undefined)
    };

    if (socketConnection && user.loggedIn) {
      socketConnection.on('WalletBalanceChanged', handlerBalanceUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected && user.loggedIn) {
        socketConnection.off('WalletBalanceChanged', handlerBalanceUpdated);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.loggedIn]);

  return (
    <WalletContext.Provider
      value={contextValue}
    >
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContextProvider;
