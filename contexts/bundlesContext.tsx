import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { getMyBundleEarnings, getMyBundles } from '../api/endpoints/bundles';
import { useAppSelector } from '../redux-store/store';
import { loadStateLS, saveStateLS } from '../utils/localStorage';
import { SocketContext } from './socketContext';

export const BundlesContext = createContext<{
  bundles: newnewapi.ICreatorBundle[] | undefined;
  bundlesLoading: boolean;
  hasSoldBundles: boolean;
  handleSetBundles: (newPacks: newnewapi.ICreatorBundle[]) => void;
}>({
  bundles: undefined,
  bundlesLoading: false,
  hasSoldBundles: false,
  handleSetBundles: (newPacks: newnewapi.ICreatorBundle[]) => {},
});

interface IBundleContextProvider {
  children: React.ReactNode;
}

export const BundlesContextProvider: React.FC<IBundleContextProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);
  // Socket
  const socketConnection = useContext(SocketContext);

  const [bundles, setBundles] = useState<
    newnewapi.ICreatorBundle[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSoldBundles, setHasSoldBundles] = useState<boolean>(false);

  const handleSetBundles = useCallback(
    (newBundles: newnewapi.ICreatorBundle[]) => {
      setBundles(newBundles);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      bundles,
      bundlesLoading: isLoading,
      hasSoldBundles,
      handleSetBundles,
    }),
    [bundles, isLoading, handleSetBundles]
  );

  // Load bundles
  useEffect(() => {
    async function fetchBundles() {
      if (!user.loggedIn) {
        setBundles(undefined);
        return;
      }

      try {
        setIsLoading(true);

        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyBundles(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        setBundles(res.data.creatorBundles);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchBundles();

    // if creator did not sell any bundle we should
    // hide navigation link to direct messages
    async function fetchMyBundlesEarnings() {
      try {
        const payload = new newnewapi.GetMyBundleEarningsRequest();
        const res = await getMyBundleEarnings(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data.totalBundleEarnings?.usdCents) {
          setHasSoldBundles(true);
          saveStateLS('creatorHasSoldBundles', true);
        }
      } catch (err) {
        console.error(err);
        setHasSoldBundles(false);
      }
    }
    const localHasSoldBundles = loadStateLS('creatorHasSoldBundles') as boolean;
    if (localHasSoldBundles) {
      setHasSoldBundles(true);
      // TODO: should we show it only for creators who added a bank account?
      // Reply to TODO: no, creator can sell bundles without verified connected stripe
    } else if (user.userData?.options?.creatorStatus === 2) {
      fetchMyBundlesEarnings();
    }
  }, [user.loggedIn]);

  // Listen for socket updates
  useEffect(() => {
    const handleBundleChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorBundleChanged.decode(arr);

      if (!decoded) {
        return;
      }

      setBundles((curr) => {
        const updatedBundle = decoded.creatorBundle;

        if (!curr || !updatedBundle) {
          return curr;
        }

        const bundleIndex = curr?.findIndex(
          (bundle) => bundle.creator?.uuid === updatedBundle.creator?.uuid
        );

        if (bundleIndex > -1) {
          return [
            ...curr.slice(0, bundleIndex),
            updatedBundle,
            ...curr.slice(bundleIndex + 1),
          ];
        } else {
          return curr.concat(updatedBundle);
        }
      });
    };

    if (socketConnection && user.loggedIn) {
      socketConnection?.on('CreatorBundleChanged', handleBundleChanged);
    }

    return () => {
      if (socketConnection && socketConnection?.connected && user.loggedIn) {
        socketConnection?.off('CreatorBundleChanged', handleBundleChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.loggedIn]);

  return (
    <BundlesContext.Provider value={contextValue}>
      {children}
    </BundlesContext.Provider>
  );
};

export function useBundles() {
  const context = useContext(BundlesContext);
  if (!context)
    throw new Error(
      'useNotifications must be used inside a `NotificationsProvider`'
    );
  return context;
}
