import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

export const OverlayModeContext = createContext<{
  overlayModeEnabled: boolean;
  enableOverlayMode: (id: string) => void;
  disableOverlayMode: (id: string) => void;
}>({
  overlayModeEnabled: false,
  enableOverlayMode: (id: string) => {},
  disableOverlayMode: (id: string) => {},
});

interface IOverlayModeProvider {
  children: React.ReactNode;
}

export const OverlayModeProvider: React.FC<IOverlayModeProvider> = ({
  children,
}) => {
  const [requests, setRequests] = useState<string[]>([]);

  const enableOverlayMode = useCallback((id: string) => {
    setRequests((curr) => {
      if (curr.includes(id)) {
        return curr;
      }
      return [...curr, id];
    });
  }, []);

  const disableOverlayMode = useCallback((id: string) => {
    setRequests((curr) => curr.filter((request) => request !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      overlayModeEnabled: requests.length > 0,
      enableOverlayMode,
      disableOverlayMode,
    }),
    [requests, enableOverlayMode, disableOverlayMode]
  );

  return (
    <OverlayModeContext.Provider value={contextValue}>
      {children}
    </OverlayModeContext.Provider>
  );
};

export function useOverlayMode() {
  const context = useContext(OverlayModeContext);
  const id = useRef(uuidv4());

  if (!context) {
    throw new Error(
      'useOverlayMode must be used inside a `OverlayModeProvider`'
    );
  }

  // Adding context to deps results in infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const enable = useCallback(() => context.enableOverlayMode(id.current), []);

  // Adding context to deps results in infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const disable = useCallback(() => context.disableOverlayMode(id.current), []);

  return {
    overlayModeEnabled: context.overlayModeEnabled,
    enableOverlayMode: enable,
    disableOverlayMode: disable,
  };
}
