import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import isBrowser from '../utils/isBrowser';
import { cookiesInstance } from '../api/apiConfigs';
import getColorMode from '../utils/getColorMode';

export type TColorMode = 'light' | 'dark' | 'auto';
export type TBanner = {
  show: boolean;
  title: string;
};

export const UiStateContext = createContext<{
  banner: TBanner;
  colorMode: TColorMode;
  mutedMode: boolean;
  globalSearchActive: boolean;
  setColorMode: (payload: TColorMode) => void;
  setGlobalSearchActive: (newValue: boolean) => void;
  setBanner: (newValue: TBanner) => void;
  toggleMutedMode: () => void;
  setMutedMode: (newValue: boolean) => void;
}>({
  banner: {
    show: false,
    title: '',
  },
  colorMode: 'auto',
  mutedMode: false,
  globalSearchActive: false,
  setColorMode: () => {},
  setGlobalSearchActive: () => {},
  setBanner: () => {},
  toggleMutedMode: () => {},
  setMutedMode: () => {},
});

interface IUiStateContextProvider {
  colorModeFromCookie: TColorMode;
  mutedModeFromCookie: boolean;
  children: React.ReactNode;
}

const UiStateContextProvider: React.FC<IUiStateContextProvider> = ({
  colorModeFromCookie,
  mutedModeFromCookie,
  children,
}) => {
  // colorMode
  const [colorMode, _setColorMode] = useState(colorModeFromCookie);

  const setColorMode = useCallback((newValue: TColorMode) => {
    let shouldAddTheming = false;
    _setColorMode((currentColorMode) => {
      shouldAddTheming =
        getColorMode(currentColorMode) !== getColorMode(newValue);

      return newValue;
    });

    cookiesInstance.set('colorMode', newValue, {
      // Expire in 10 years
      maxAge: 10 * 365 * 24 * 60 * 60,
      path: '/',
    });

    // Smooth theming
    if (isBrowser() && shouldAddTheming) {
      document?.documentElement?.classList?.add('theming');
      document?.documentElement?.addEventListener(
        'transitionend',
        () => {
          if (document?.documentElement) {
            document?.documentElement?.classList?.remove('theming');
          }
        },
        { once: true }
      );
    }
  }, []);

  // mutedMode
  const [mutedMode, _setMutedMode] = useState(mutedModeFromCookie);

  const setMutedMode = useCallback((newValue: boolean) => {
    cookiesInstance.set('mutedMode', newValue, {
      // Expire in 10 years
      maxAge: 10 * 365 * 24 * 60 * 60,
      path: '/',
    });

    _setMutedMode(newValue);
  }, []);

  const toggleMutedMode = useCallback(() => {
    _setMutedMode((curr) => {
      cookiesInstance.set('mutedMode', !curr, {
        // Expire in 10 years
        maxAge: 10 * 365 * 24 * 60 * 60,
        path: '/',
      });

      return !curr;
    });
  }, []);

  // globalSearch
  const [globalSearchActive, _setGlobalSearchActive] = useState(false);

  const setGlobalSearchActive = useCallback((newValue: boolean) => {
    _setGlobalSearchActive(newValue);
  }, []);

  // Top page banner
  const [banner, _setBanner] = useState<TBanner>({
    show: false,
    title: '',
  });

  const setBanner = useCallback((newValue: TBanner) => {
    _setBanner(newValue);
  }, []);

  const contextValue = useMemo(
    () => ({
      banner,
      colorMode,
      mutedMode,
      globalSearchActive,
      setColorMode,
      setGlobalSearchActive,
      setBanner,
      toggleMutedMode,
      setMutedMode,
    }),
    [
      banner,
      colorMode,
      mutedMode,
      globalSearchActive,
      setColorMode,
      setGlobalSearchActive,
      setBanner,
      toggleMutedMode,
      setMutedMode,
    ]
  );

  return (
    <UiStateContext.Provider value={contextValue}>
      {children}
    </UiStateContext.Provider>
  );
};

export default UiStateContextProvider;

export function useUiState() {
  const context = useContext(UiStateContext);
  if (!context) {
    throw new Error(
      'useUiState must be used inside a `UiStateContext.Provider`'
    );
  }

  return context;
}
