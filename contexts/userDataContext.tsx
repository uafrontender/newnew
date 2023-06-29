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
import { useIsomorphicLayoutEffect } from 'react-use';

import {
  getMe,
  getMyOnboardingState,
  setMyTimeZone,
} from '../api/endpoints/user';

import { SocketContext } from './socketContext';
import useRunOnReturnOnTab from '../utils/hooks/useRunOnReturnOnTab';
import { useAppState } from './appStateContext';
import { loadStateLS, saveStateLS, removeStateLS } from '../utils/localStorage';
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

export const UserDataContextProvider: React.FunctionComponent<
  IUserDataContextProvider
> = ({ children }) => {
  const {
    userLoggedIn,
    userIsCreator,
    handleBecameCreator,
    logoutAndRedirect,
  } = useAppState();
  const { socketConnection } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const [, setCookie] = useCookies();

  const [userData, setUserData] = useState<TUserData | undefined>();
  const [userTimezone, setUserTimezone] = useState<string | undefined>();
  const [creatorData, setCreatorData] = useState<
    newnewapi.IGetMyOnboardingStateResponse | undefined
  >();
  const [creatorDataLoaded, setCreatorDataLoaded] = useState(false);

  const userWasLoggedIn = useRef(false);

  const updateUserData = useCallback((data: Partial<TUserData>) => {
    setUserData((curr) => {
      // Wait for data from API to load
      // Possible race condition?
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

  const syncUserData = useCallback(
    async (retry?: boolean) => {
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
          handleBecameCreator();
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

        // Retry once if loading failed for some other reason
        if (!retry) {
          syncUserData(true);
        } else {
          logoutAndRedirect();
        }
      }
    },
    [handleBecameCreator, logoutAndRedirect]
  );

  const syncCreatorData = useCallback(async (retry?: boolean) => {
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
      // Retry once if loading failed
      if (!retry) {
        await syncCreatorData(true).catch((e) => {
          console.error(e);
        });
      }
      setCreatorDataLoaded(true);
    }
  }, []);

  const postUserTimeZone = useCallback(async () => {
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
  }, [userTimezone, logoutAndRedirect, setCookie]);

  const setUserTimezoneCookieOnly = useCallback(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    setCookie('timezone', timezone, {
      // Expire in 10 years
      maxAge: 10 * 365 * 24 * 60 * 60,
      path: '/',
    });
  }, [setCookie]);

  // TODO: Is it necessary? Why? Do WS updates fail?
  const syncUserDataOnReturnOnTab = useCallback(() => {
    if (userLoggedIn) {
      syncUserData();
    }
  }, [userLoggedIn, syncUserData]);

  // TODO: Do we need it?
  useRunOnReturnOnTab(syncUserDataOnReturnOnTab);

  useIsomorphicLayoutEffect(() => {
    // Can't load on first render as it breaks hydration (server has no access to LS for SSR)
    if (!isBrowser) {
      return;
    }

    if (userLoggedIn) {
      const savedUserDate = loadStateLS(USER_DATA_KEY) as TUserData | undefined;
      setUserData(savedUserDate);
    } else {
      setUserData(undefined);
      setCreatorData(undefined);
      setCreatorDataLoaded(false);
      // If we don't remove it here, it can get loaded on next login (even if there will be other account)
      removeStateLS(USER_DATA_KEY);
    }
  }, [userLoggedIn]);

  useEffect(() => {
    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    } else if (userWasLoggedIn.current) {
      queryClient.removeQueries({ queryKey: ['private'] });
      userWasLoggedIn.current = false;
    }
  }, [userLoggedIn, queryClient]);

  useEffect(() => {
    if (userLoggedIn) {
      syncUserData();
    } else {
      setUserTimezoneCookieOnly();
    }
  }, [userLoggedIn, syncUserData, setUserTimezoneCookieOnly]);

  useEffect(() => {
    if (userLoggedIn) {
      postUserTimeZone();
    }
  }, [userLoggedIn, postUserTimeZone]);

  useEffect(() => {
    if (userIsCreator) {
      syncCreatorData();
    }
  }, [userIsCreator, syncCreatorData]);

  useEffect(() => {
    if (socketConnection) {
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
    }
    return () => {};
  }, [socketConnection, updateUserData]);

  useEffect(() => {
    if (
      socketConnection &&
      !creatorData?.isCreatorConnectedToStripe &&
      creatorData?.stripeConnectStatus ===
        newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus.PROCESSING
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

    return () => {};
  }, [
    creatorData?.isCreatorConnectedToStripe,
    creatorData?.stripeConnectStatus,
    socketConnection,
    updateCreatorData,
  ]);

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
