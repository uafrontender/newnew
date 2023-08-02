import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
  MutableRefObject,
  useRef,
  useCallback,
} from 'react';
import Router from 'next/router';
import { parse } from 'next-useragent';
import styled from 'styled-components';
import jwtDecode from 'jwt-decode';
import { newnewapi } from 'newnew-api';

import isBrowser from '../utils/isBrowser';
import { sizes, TResizeMode } from '../styles/media';
import { cookiesInstance, refreshCredentials } from '../api/apiConfigs';

// TODO: Add info after user being White Listed
export const AppStateContext = createContext<{
  resizeMode: TResizeMode;
  userUuid: string | undefined;
  userLoggedIn: boolean;
  userIsCreator: boolean;
  // Must be optional until 30 days since token change is merged to BE prod
  // IDEA: we can replace it with "canBEcomeCreator" from BE (DoB + appConstants needed)
  userDateOfBirth: newnewapi.IDateComponents | undefined;
  handleUserLoggedIn: (isCreator: boolean) => void;
  handleBecameCreator: () => void;
  logoutAndRedirect: (redirectUrl?: string) => void;
}>({
  // Default values are irrelevant as state gets it on init
  resizeMode: 'mobile',
  userUuid: undefined,
  userLoggedIn: false,
  userIsCreator: false,
  userDateOfBirth: undefined,
  handleUserLoggedIn: () => {},
  handleBecameCreator: () => {},
  logoutAndRedirect: () => {},
});

interface IAppStateContextProvider {
  accessToken?: string;
  uaString: string;
  children: React.ReactNode;
}

function getResizeMode(uaString: string): TResizeMode {
  const ua = parse(
    uaString || (isBrowser() ? window?.navigator?.userAgent : '')
  );

  if (ua.isTablet) {
    return 'tablet';
  }

  if (ua.isDesktop) {
    // Use laptop L as a default size
    return 'laptopL';
  }

  return 'mobile';
}

interface IDecodedToken {
  account_id: string;
  account_type: string;
  date: string;
  is_creator: boolean;
  iat: number;
  dob: string;
  exp: number;
  aud: string;
  iss: string;
  uuid: string;
}

function getDecodedToken(accessToken?: string): IDecodedToken | undefined {
  if (accessToken) {
    const decodedToken: IDecodedToken = jwtDecode(accessToken);
    return decodedToken;
  }

  return undefined;
}

function getUserDateOfBirth(
  decodedToken: IDecodedToken | undefined
): newnewapi.IDateComponents | undefined {
  if (decodedToken?.dob) {
    const date = new Date(decodedToken.dob);

    return new newnewapi.DateComponents({
      day: date.getDay(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return undefined;
}

const AppStateContextProvider: React.FC<IAppStateContextProvider> = ({
  accessToken,
  uaString,
  children,
}) => {
  // Should we check that token is valid or just it's presence here?
  const decodedToken = useRef(getDecodedToken(accessToken));
  const [userUuid, setUserUuid] = useState(
    decodedToken.current?.uuid || undefined
  );
  const [userLoggedIn, setUserLoggedIn] = useState(!!accessToken);
  const [userIsCreator, setUserIsCreator] = useState(
    decodedToken.current?.is_creator || false
  );
  const [userDateOfBirth] = useState(getUserDateOfBirth(decodedToken.current));
  const [resizeMode, setResizeMode] = useState<TResizeMode>(
    getResizeMode(uaString)
  );
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const refreshTokens = useCallback(async () => {
    const refreshToken = cookiesInstance.get('refreshToken');
    if (!refreshToken) {
      // Should it logoutAndRedirect?
      return;
    }

    const refreshPayload = new newnewapi.RefreshCredentialRequest({
      refreshToken,
    });

    const resRefresh = await refreshCredentials(refreshPayload);

    // Refresh failed, session "expired"
    // (i.e. user probably logged in from another device, or exceeded
    // max number of logged in devices/browsers)
    if (!resRefresh?.data || resRefresh.error) {
      throw new Error('Refresh token invalid');
    }

    if (resRefresh.data.credential?.expiresAt?.seconds) {
      cookiesInstance.set(
        'accessToken',
        resRefresh.data.credential?.accessToken,
        {
          expires: new Date(
            (resRefresh.data.credential.expiresAt.seconds as number) * 1000
          ),
          path: '/',
        }
      );
    }

    cookiesInstance.set(
      'refreshToken',
      resRefresh.data.credential?.refreshToken,
      {
        // Expire in 10 years
        maxAge: 10 * 365 * 24 * 60 * 60,
        path: '/',
      }
    );
  }, []);

  const handleUserLoggedIn = useCallback(
    (isCreator: boolean) => {
      setUserLoggedIn(true);
      setUserIsCreator(isCreator);
    },
    [setUserLoggedIn]
  );

  const handleBecameCreator = useCallback(() => {
    setUserIsCreator((curr) => {
      if (!curr) {
        // Refresh token to get the one with is_creator true
        refreshTokens();
      }
      return true;
    });
  }, [refreshTokens]);

  const logoutAndRedirect = useCallback((redirectUrl?: string) => {
    setUserUuid(undefined);
    setUserLoggedIn(false);
    setUserIsCreator(false);
    cookiesInstance.remove('accessToken', {
      path: '/',
    });
    cookiesInstance.remove('refreshToken', {
      path: '/',
    });
    Router.push(redirectUrl ?? '/');
  }, []);

  const handleResizeObserver = useCallback(() => {
    let newResizeMode: TResizeMode | undefined;
    Object.entries(sizes).forEach(([key, value]) => {
      const element = ref.current;
      if (!newResizeMode && element && element.offsetWidth >= value) {
        newResizeMode = key as TResizeMode;
      }
    });

    if (newResizeMode) {
      setResizeMode(newResizeMode);
    }
  }, []);

  useEffect(() => {
    const cookiesListener = (options: { name: string; value?: string }) => {
      if (options.name === 'accessToken' && !options.value) {
        setUserLoggedIn(false);
        setUserIsCreator(false);
      }
    };

    cookiesInstance.addChangeListener(cookiesListener);

    return () => {
      cookiesInstance.removeChangeListener(cookiesListener);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const newDecodedToken = getDecodedToken(accessToken);

    if (newDecodedToken) {
      decodedToken.current = newDecodedToken;
      setUserIsCreator(newDecodedToken.is_creator);
      setUserUuid(newDecodedToken.uuid);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ref.current) {
      return () => {};
    }

    const resizeObserver = new ResizeObserver(handleResizeObserver);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResizeObserver]);

  const contextValue = useMemo(
    () => ({
      resizeMode,
      userUuid,
      userLoggedIn,
      userIsCreator,
      userDateOfBirth,
      handleUserLoggedIn,
      handleBecameCreator,
      logoutAndRedirect,
    }),
    [
      resizeMode,
      userUuid,
      userLoggedIn,
      userIsCreator,
      userDateOfBirth,
      handleUserLoggedIn,
      handleBecameCreator,
      logoutAndRedirect,
    ]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      <SContainer ref={ref}>{children}</SContainer>
    </AppStateContext.Provider>
  );
};

export default AppStateContextProvider;

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error(
      'useAppState must be used inside a `AppStateContext.Provider`'
    );
  }

  return context;
}

const SContainer = styled.div`
  max-width: 100%;
  width: 100%;
  height: 100%;
  /* overflow-x: hidden; */
`;
