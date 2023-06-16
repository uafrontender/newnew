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
import { useRouter } from 'next/router';
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
  userLoggedIn: boolean;
  userIsCreator: boolean;
  handleUserLoggedIn: (isCreator: boolean) => void;
  handleBecameCreator: () => void;
  logoutAndRedirect: (redirectUrl?: string) => void;
}>({
  // Default values are irrelevant as state gets it on init
  resizeMode: 'mobile',
  userLoggedIn: false,
  userIsCreator: false,
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

function getIsCreator(accessToken: string | undefined): boolean {
  if (accessToken) {
    const decodedToken: {
      account_id: string;
      account_type: string;
      date: string;
      is_creator: boolean;
      iat: number;
      exp: number;
      aud: string;
      iss: string;
    } = jwtDecode(accessToken);

    return decodedToken.is_creator || false;
  }
  return false;
}

const AppStateContextProvider: React.FC<IAppStateContextProvider> = ({
  accessToken,
  uaString,
  children,
}) => {
  const router = useRouter();
  // Should we check that token is valid or just it's presence here?
  const [userLoggedIn, setUserLoggedIn] = useState(!!accessToken);
  const [userIsCreator, setUserIsCreator] = useState(getIsCreator(accessToken));
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
    [setUserLoggedIn, setUserIsCreator]
  );

  const handleBecameCreator = useCallback(() => {
    setUserIsCreator((curr) => {
      if (!curr) {
        // Refresh token to get the one with is_creator true
        refreshTokens();
      }
      return true;
    });
  }, [setUserIsCreator, refreshTokens]);

  const logoutAndRedirect = useCallback(
    (redirectUrl?: string) => {
      setUserLoggedIn(false);
      setUserIsCreator(false);
      cookiesInstance.remove('accessToken');
      cookiesInstance.remove('refreshToken');
      router.push(redirectUrl ?? '/');
    },
    [router, setUserIsCreator]
  );

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
      userLoggedIn,
      userIsCreator,
      resizeMode,
      handleUserLoggedIn,
      handleBecameCreator,
      logoutAndRedirect,
    }),
    [
      userLoggedIn,
      userIsCreator,
      resizeMode,
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
  overflow-x: hidden;
`;
