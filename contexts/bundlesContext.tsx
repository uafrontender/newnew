import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import { getMyBundles } from '../api/endpoints/bundles';
import { useAppSelector } from '../redux-store/store';
import dateToTimestamp from '../utils/dateToTimestamp';
import { SocketContext } from './socketContext';

export const BundlesContext = createContext<{
  bundles: newnewapi.ICreatorBundle[] | undefined;
  bundlesLoading: boolean;
  handleSetBundles: (newPacks: newnewapi.ICreatorBundle[]) => void;
}>({
  bundles: undefined,
  bundlesLoading: false,
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
      handleSetBundles,
    }),
    [bundles, isLoading, handleSetBundles]
  );

  // TODO: Remove test data
  useEffect(() => {
    setBundles([
      new newnewapi.CreatorBundle({
        creator: new newnewapi.User({
          uuid: '3d537e81-d2dc-4bb3-9698-39152a817ab5',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        bundle: new newnewapi.Bundle({
          accessExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 4,
        }),
      }),
      new newnewapi.CreatorBundle({
        creator: new newnewapi.User({
          uuid: 'c82f8990-5ef3-4a6f-b289-b14117a1094a',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        bundle: new newnewapi.Bundle({
          accessExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 4200,
        }),
      }),
      new newnewapi.CreatorBundle({
        creator: new newnewapi.User({
          uuid: '9972ee11-beba-418e-980a-1d115e691116',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        bundle: new newnewapi.Bundle({
          accessExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 4,
        }),
      }),
      new newnewapi.CreatorBundle({
        creator: new newnewapi.User({
          uuid: '4590b3a8-1610-4ba5-b82f-894fd5e89aa0',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        bundle: new newnewapi.Bundle({
          accessExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 342,
        }),
      }),
      new newnewapi.CreatorBundle({
        creator: new newnewapi.User({
          uuid: '5f3c11d0-082c-45b4-aeb5-51e97f85111b',
          avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
          nickname: 'CreatorDisplayName',
          username: 'username',
        }),
        bundle: new newnewapi.Bundle({
          accessExpiresAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
          votesLeft: 123,
        }),
      }),
    ]);
  }, []);

  // TODO: Integrate bundle loading
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

    // fetchBundles();
  }, [user.loggedIn]);

  // TODO: Integrate bundle updates
  // Listen for socket updates
  useEffect(() => {
    const handlerBundleCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorBundleCreated.decode(arr);

      if (!decoded) {
        return;
      }

      setBundles((curr) => {
        if (curr && decoded.creatorBundle) {
          return curr.concat(decoded.creatorBundle);
        }

        return curr;
      });
    };

    const handlePackChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorBundleChanged.decode(arr);

      if (!decoded) {
        return;
      }

      setBundles((curr) => {
        const updatedBundle = decoded.creatorBundle;

        if (curr && updatedBundle) {
          const bundleIndex = curr?.findIndex((bundle) => {
            bundle.creator?.uuid === updatedBundle.creator?.uuid;
          });

          if (bundleIndex) {
            return [
              ...curr.slice(0, bundleIndex),
              updatedBundle,
              ...curr.slice(bundleIndex + 1),
            ];
          }
        }

        return curr;
      });
    };

    if (socketConnection && user.loggedIn) {
      socketConnection?.on('CreatorBundleCreated', handlerBundleCreated);
      socketConnection?.on('CreatorBundleChanged', handlePackChanged);
    }

    return () => {
      if (socketConnection && socketConnection?.connected && user.loggedIn) {
        socketConnection?.off('CreatorBundleCreated', handlerBundleCreated);
        socketConnection?.off('CreatorBundleChanged', handlePackChanged);
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
