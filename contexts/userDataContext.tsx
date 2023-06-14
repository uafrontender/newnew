import { newnewapi } from 'newnew-api';
import { useCookies } from 'react-cookie';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';

import {
  getMe,
  getMyOnboardingState,
  setMyTimeZone,
} from '../api/endpoints/user';

import { SocketContext } from './socketContext';
import useRunOnReturnOnTab from '../utils/hooks/useRunOnReturnOnTab';
import { useAppState } from './appStateContext';
import { loadStateLS, saveStateLS } from '../utils/localStorage';
import isBrowser from '../utils/isBrowser';

const USER_DATA_KEY = 'userData';

export type TUserData = Omit<
  newnewapi.Me,
  'toJSON' | '_nickname' | '_email' | '_dateOfBirth' | 'timeZone'
>;

export const UserDataContext = createContext<{
  userData: TUserData | undefined;
  userTimezone: string | undefined;
  creatorData: newnewapi.IGetMyOnboardingStateResponse | undefined;
  creatorDataLoaded: boolean;
  updateUserData: (data: Partial<TUserData>) => void;
  updateCreatorData: (
    data: Partial<newnewapi.IGetMyOnboardingStateResponse>
  ) => void;
  setCreatorDataLoaded: (loaded: boolean) => void;
}>({
  userData: undefined,
  userTimezone: undefined,
  creatorData: undefined,
  creatorDataLoaded: false,
  updateUserData: () => {},
  updateCreatorData: () => {},
  setCreatorDataLoaded: () => {},
});

interface IUserDataContextProvider {
  children: React.ReactNode;
}

// TODO: Can be a UserDataContext
export const UserDataContextProvider: React.FunctionComponent<
  IUserDataContextProvider
> = ({ children }) => {
  const { userLoggedIn, handleBecameCreator, logoutAndRedirect } =
    useAppState();
  const { socketConnection } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const [, setCookie] = useCookies();

  // Get initial state from LS
  const [userData, setUserData] = useState<TUserData | undefined>(
    loadStateLS(USER_DATA_KEY) as TUserData | undefined
  );
  const [userTimezone, setUserTimezone] = useState<string | undefined>();
  const [creatorData, setCreatorData] = useState<
    newnewapi.IGetMyOnboardingStateResponse | undefined
  >();
  const [creatorDataLoaded, setCreatorDataLoaded] = useState(false);
  const userWasLoggedIn = useRef(false);

  useEffect(() => {
    // Can't load on first render as it breaks hydration (server has no access to LS for SSR)
    if (isBrowser()) {
      const savedUserDate = loadStateLS(USER_DATA_KEY) as TUserData | undefined;
      setUserData(savedUserDate);
    }
  }, []);

  const updateUserData = useCallback((data: Partial<TUserData>) => {
    setUserData((curr) => {
      if (!curr) {
        return undefined;
      }

      const newUserData = {
        ...curr,
        ...data,
        options: {
          ...curr.options,
          ...data.options,
        },
      };

      saveStateLS(USER_DATA_KEY, newUserData);

      return newUserData;
    });
  }, []);

  const updateCreatorData = useCallback(
    (data: Partial<newnewapi.IGetMyOnboardingStateResponse>) => {
      setCreatorData((curr) => ({
        ...curr,
        ...data,
      }));
    },
    []
  );

  // When user logs out, clear the state
  // Don't clean local storage in tests
  useEffect(() => {
    if (
      userWasLoggedIn.current &&
      !userLoggedIn &&
      process.env.NEXT_PUBLIC_ENVIRONMENT !== 'test'
    ) {
      setUserData(undefined);
      setCreatorData(undefined);
      setCreatorDataLoaded(false);
      userWasLoggedIn.current = false;
      queryClient.removeQueries({ queryKey: ['private'] });
    }

    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [userLoggedIn, queryClient]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (
      !creatorData?.isCreatorConnectedToStripe &&
      creatorData?.stripeConnectStatus ===
        newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus.PROCESSING &&
      socketConnection
    ) {
      const handlerStripeAccountChanged = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.StripeAccountChanged.decode(arr);

        if (!decoded) {
          return;
        }

        if (decoded.isActive) {
          const payload = new newnewapi.EmptyRequest({});
          const res = await getMyOnboardingState(payload);

          if (res.data) {
            updateCreatorData(res.data);
          }
        }
      };

      if (socketConnection) {
        socketConnection.on(
          'StripeAccountChanged',
          handlerStripeAccountChanged
        );
      }

      return () => {
        if (socketConnection && socketConnection.connected) {
          socketConnection.off(
            'StripeAccountChanged',
            handlerStripeAccountChanged
          );
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    creatorData?.isCreatorConnectedToStripe,
    creatorData?.stripeConnectStatus,
    socketConnection,
  ]);

  const syncUserData = useCallback(async () => {
    try {
      const payload = new newnewapi.EmptyRequest({});

      const { data } = await getMe(payload);

      if (data?.me) {
        // Why do we need this constructing
        const newUserData = {
          username: data.me?.username,
          nickname: data.me?.nickname,
          email: data.me?.email,
          avatarUrl: data.me?.avatarUrl,
          coverUrl: data.me?.coverUrl,
          userUuid: data.me?.userUuid,
          bio: data.me?.bio,
          dateOfBirth: {
            day: data.me?.dateOfBirth?.day,
            month: data.me?.dateOfBirth?.month,
            year: data.me?.dateOfBirth?.year,
          },
          countryCode: data.me?.countryCode,
          usernameChangedAt: data.me.usernameChangedAt,
          genderPronouns: data.me.genderPronouns,
          phoneNumber: data.me.phoneNumber,

          options: {
            isActivityPrivate: data.me?.options?.isActivityPrivate,
            isCreator: data.me?.options?.isCreator,
            isVerified: data.me?.options?.isVerified,
            creatorStatus: data.me?.options?.creatorStatus,
            birthDateUpdatesLeft: data.me?.options?.birthDateUpdatesLeft,
            isOfferingBundles: data.me.options?.isOfferingBundles,
            isPhoneNumberConfirmed: data.me.options?.isPhoneNumberConfirmed,
            isWhiteListed: data.me.options?.isWhiteListed,
          },
        } as TUserData;

        saveStateLS(USER_DATA_KEY, newUserData);
        setUserData(newUserData);
      }

      if (data?.me?.options?.isCreator) {
        // TODO: not sure if it is possible, but what if user is creator in state and we got false?
        handleBecameCreator();

        // TODO: Separate out and load right away when user is creator in token
        // But do not load twice, use a state?
        try {
          const getMyOnboardingStatePayload = new newnewapi.EmptyRequest({});
          const res = await getMyOnboardingState(getMyOnboardingStatePayload);

          if (res.data) {
            // Why do we update instead of just setting the data we loaded?
            setCreatorData((curr) => ({
              ...curr,
              ...res.data,
            }));
          }
          setCreatorDataLoaded(true);
        } catch (err) {
          console.error(err);
          setCreatorDataLoaded(true);
        }
      }
    } catch (err) {
      console.error(err);
      if ((err as Error).message === 'No token') {
        logoutAndRedirect();
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        logoutAndRedirect('/sign-up?reason=session_expired');
      }
    }
  }, [handleBecameCreator, logoutAndRedirect]);

  useEffect(() => {
    const postUserTimeZone = async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (userTimezone && userTimezone === timezone) {
        // No need to make the request
        return;
      }

      try {
        const payload = new newnewapi.SetMyTimeZoneRequest({
          name: timezone,
        });

        const response = await setMyTimeZone(payload);

        if (response.error) {
          throw new Error('Cannot set time zone');
        }

        setUserTimezone(timezone);

        setCookie('timezone', timezone, {
          // Expire in 10 years
          maxAge: 10 * 365 * 24 * 60 * 60,
          path: '/',
        });
      } catch (err) {
        console.error(err);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }
      }
    };

    const setUserTimezoneCookieOnly = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      setCookie('timezone', timezone, {
        // Expire in 10 years
        maxAge: 10 * 365 * 24 * 60 * 60,
        path: '/',
      });
    };

    if (userLoggedIn) {
      postUserTimeZone();
      syncUserData();
    } else {
      setUserTimezoneCookieOnly();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn]);

  useEffect(() => {
    const handlerSocketMeUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded || !decoded.me) {
        return;
      }

      // Fields in protobuff are nullable, conflicts with Partial
      updateUserData(decoded.me as any);
    };

    if (socketConnection) {
      socketConnection?.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  // TODO: Is it necessary? Why? Do WS updates fail?
  const syncUserDataOnReturnOnTab = useCallback(() => {
    if (userLoggedIn) {
      syncUserData();
    }
  }, [userLoggedIn, syncUserData]);

  useRunOnReturnOnTab(syncUserDataOnReturnOnTab);

  const contextValue = useMemo(
    () => ({
      userData,
      userTimezone,
      creatorData,
      creatorDataLoaded,
      updateUserData,
      updateCreatorData,
      setCreatorDataLoaded,
    }),
    [
      userData,
      userTimezone,
      creatorData,
      creatorDataLoaded,
      updateUserData,
      updateCreatorData,
      setCreatorDataLoaded,
    ]
  );

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used inside a `UserDataContext`');
  }

  return context;
}
