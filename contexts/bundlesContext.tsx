import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import {
  getBundleStatus,
  getMyBundleEarnings,
  getMyBundles,
  setBundleStatus,
} from '../api/endpoints/bundles';
import { useAppSelector } from '../redux-store/store';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import { loadStateLS, saveStateLS } from '../utils/localStorage';
import { SocketContext } from './socketContext';

export const BundlesContext = createContext<{
  bundles: newnewapi.ICreatorBundle[] | undefined;
  directMessagesAvailable: boolean;
  isSellingBundles: boolean;
  hasSoldBundles: boolean;
  toggleIsSellingBundles: () => Promise<void>;
}>({
  bundles: undefined,
  directMessagesAvailable: false,
  isSellingBundles: false,
  hasSoldBundles: false,
  toggleIsSellingBundles: async () => {},
});

interface IBundleContextProvider {
  children: React.ReactNode;
}

export const BundlesContextProvider: React.FC<IBundleContextProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);
  const socketConnection = useContext(SocketContext);
  const { showErrorToastPredefined } = useErrorToasts();

  const [bundles, setBundles] = useState<
    newnewapi.ICreatorBundle[] | undefined
  >(undefined);
  const [isSellingBundles, setIsSellingBundles] = useState(false);
  const [isSellingBundlesStatusLoaded, setIsSellingBundlesStatusLoaded] =
    useState(false);
  const [busyTogglingSellingBundles, setBusyTogglingSellingBundles] =
    useState(false);
  const [hasSoldBundles, setHasSoldBundles] = useState(false);

  const fetchBundles = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest({});
    const res = await getMyBundles(payload);

    if (!res.data || res.error)
      throw new Error(res.error?.message ?? 'Request failed');

    return res.data.creatorBundles;
  }, []);

  const fetchIsSellingBundles = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest();

    const res = await getBundleStatus(payload);

    if (!res.data || res.error) {
      throw new Error('Request failed');
    }

    return res.data.bundleStatus === newnewapi.CreatorBundleStatus.ENABLED;
  }, []);

  const fetchHasSoldBundles = useCallback(async () => {
    // Do we really need it?
    // Optimized by using state stored in LS
    const localHasSoldBundles = loadStateLS('creatorHasSoldBundles') as boolean;

    if (localHasSoldBundles) {
      return true;
    }

    const payload = new newnewapi.GetMyBundleEarningsRequest();
    const res = await getMyBundleEarnings(payload);

    if (!res.data || res.error)
      throw new Error(res.error?.message ?? 'Request failed');

    const earnings = res.data.totalBundleEarnings?.usdCents ?? 0;
    return earnings > 0;
  }, []);

  // Load data
  useEffect(() => {
    // Wait fo user data to load
    if (!user._persist?.rehydrated) {
      return;
    }

    if (user.loggedIn) {
      fetchBundles()
        .then((creatorBundles) => {
          setBundles(creatorBundles);
        })
        .catch((err) => {
          console.error(err);
          if (
            err.message !== 'Refresh token invalid' &&
            err.message !== 'No token'
          ) {
            showErrorToastPredefined();
          }
          setBundles(undefined);
        });

      if (
        user.userData?.options?.creatorStatus !==
        newnewapi.Me.CreatorStatus.NOT_CREATOR
      ) {
        fetchIsSellingBundles()
          .then((creatorIsSellingBundles) => {
            setIsSellingBundles(creatorIsSellingBundles);
            setIsSellingBundlesStatusLoaded(true);
          })
          .catch((err) => {
            console.error(err);
            if (
              err.message !== 'Refresh token invalid' &&
              err.message !== 'No token'
            ) {
              showErrorToastPredefined();
            }
            setIsSellingBundles(false);
            setIsSellingBundlesStatusLoaded(false);
          });

        fetchHasSoldBundles()
          .then((creatorHasSoldBundles) => {
            setHasSoldBundles(creatorHasSoldBundles);
            saveStateLS('creatorHasSoldBundles', creatorHasSoldBundles);
          })
          .catch((err) => {
            console.error(err);
            if (
              err.message !== 'Refresh token invalid' &&
              err.message !== 'No token'
            ) {
              showErrorToastPredefined();
            }
            setHasSoldBundles(false);
            saveStateLS('creatorHasSoldBundles', false);
          });
      } else {
        setIsSellingBundles(false);
        setHasSoldBundles(false);
      }
    } else {
      // Clear state
      setBundles(undefined);
      setIsSellingBundles(false);
      setIsSellingBundlesStatusLoaded(false);
      setHasSoldBundles(false);
      saveStateLS('creatorHasSoldBundles', false);
    }
  }, [
    user._persist?.rehydrated,
    user.loggedIn,
    user.userData?.options?.creatorStatus,
    fetchBundles,
    showErrorToastPredefined,
    fetchIsSellingBundles,
    fetchHasSoldBundles,
  ]);

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
        }

        return curr.concat(updatedBundle);
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
  }, [socketConnection, user.loggedIn]);

  const toggleIsSellingBundles = useCallback(async () => {
    if (busyTogglingSellingBundles || !isSellingBundlesStatusLoaded) {
      throw new Error('Busy or status is not loaded yet');
    }

    setBusyTogglingSellingBundles(true);

    try {
      const payload = new newnewapi.SetBundleStatusRequest({
        bundleStatus: isSellingBundles
          ? newnewapi.CreatorBundleStatus.DISABLED
          : newnewapi.CreatorBundleStatus.ENABLED,
      });

      const res = await setBundleStatus(payload);

      if (!res.data || res.error) {
        throw new Error('Request failed');
      }

      setIsSellingBundles(!isSellingBundles);
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
      throw err;
    } finally {
      setBusyTogglingSellingBundles(false);
    }
  }, [
    busyTogglingSellingBundles,
    isSellingBundlesStatusLoaded,
    isSellingBundles,
  ]);

  // A single place to set up the rules for all elements navigating to DM views
  const directMessagesAvailable = useMemo(
    () => (bundles && bundles.length > 0) || isSellingBundles || hasSoldBundles,
    [bundles, isSellingBundles, hasSoldBundles]
  );

  const contextValue = useMemo(
    () => ({
      bundles,
      // This has no WS update, could cause troubles with other tabs
      directMessagesAvailable,
      // This has no WS update, could cause troubles with other tabs
      isSellingBundles,
      hasSoldBundles,
      // Could cause troubles if used on different tabs
      toggleIsSellingBundles,
    }),
    [
      bundles,
      directMessagesAvailable,
      isSellingBundles,
      hasSoldBundles,
      toggleIsSellingBundles,
    ]
  );

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
