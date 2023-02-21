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
import isBrowser from '../utils/isBrowser';
import styled from 'styled-components';
import { sizes, TResizeMode } from '../styles/media';

export const AppStateContext = createContext<{
  resizeMode: TResizeMode;
}>({
  // Default value is irrelevant as state gets it on init
  resizeMode: 'mobile',
});

interface IAppStateContextProvider {
  uaString: string;
  children: React.ReactNode;
}

// TODO: remove ResizeModeHoc
// TODO: apply everywhere
// TODO: clear redux store
function getResizeMode(uaString: string): TResizeMode {
  const ua = parse(
    uaString || (isBrowser() ? window?.navigator?.userAgent : '')
  );
  if (ua.isTablet) {
    return 'tablet';
  }

  if (ua.isDesktop) {
    return 'laptop';
  }

  return 'mobile';
}

const AppStateContextProvider: React.FC<IAppStateContextProvider> = ({
  uaString,
  children,
}) => {
  const [resizeMode, setResizeMode] = useState<TResizeMode>(
    getResizeMode(uaString)
  );
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const handleResizeObserver = useCallback(() => {
    let newResizeMode: TResizeMode | undefined;
    Object.entries(sizes).map(([key, value]) => {
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
      return;
    }

    const resizeObserver = new ResizeObserver(handleResizeObserver);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResizeObserver]);

  const contextValue = useMemo(
    () => ({
      resizeMode: resizeMode,
    }),
    [resizeMode]
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
