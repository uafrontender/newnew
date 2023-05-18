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
import { parse } from 'next-useragent';
import styled from 'styled-components';

import isBrowser from '../utils/isBrowser';
import { sizes, TResizeMode } from '../styles/media';
import { cookiesInstance } from '../api/apiConfigs';
import jwtDecode from 'jwt-decode';

export const AppStateContext = createContext<{
  resizeMode: TResizeMode;
  userLoggedIn: boolean;
  userIsCreator: boolean;
  setUserLoggedIn: (isLoggedIn: boolean) => void;
  setUserIsCreator: (isCreator: boolean) => void;
}>({
  // Default values are irrelevant as state gets it on init
  resizeMode: 'mobile',
  userLoggedIn: false,
  userIsCreator: false,
  setUserLoggedIn: () => {},
  setUserIsCreator: () => {},
});

interface IAppStateContextProvider {
  uaString: string;
  children: React.ReactNode;
}

// TODO: clear redux store
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

function getIsCreator(): boolean {
  const accessToken = cookiesInstance.get('accessToken');
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
  uaString,
  children,
}) => {
  const [userLoggedIn, setUserLoggedIn] = useState(
    cookiesInstance.get('accessToken') !== undefined
  );
  const [userIsCreator, setUserIsCreator] = useState(getIsCreator());
  const [resizeMode, setResizeMode] = useState<TResizeMode>(
    getResizeMode(uaString)
  );
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const setUserLoggedInState = useCallback((isLoggedIn: boolean) => {
    setUserLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      setUserIsCreator(false);
    }
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
      setUserLoggedIn: setUserLoggedInState,
      setUserIsCreator,
    }),
    [userLoggedIn, resizeMode]
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
  if (!context)
    throw new Error(
      'useAppState must be used inside a `AppStateContext.Provider`'
    );
  return context;
}

const SContainer = styled.div`
  max-width: 100%;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`;
