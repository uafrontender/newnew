import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export const OverlayModeContext = createContext<{
  overlayModeEnabled: boolean;
  enableOverlayMode: (
    id: string,
    elementContainer?: HTMLElement | null
  ) => void;
  disableOverlayMode: (
    id: string,
    elementContainer?: HTMLElement | null
  ) => void;
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

  const enableOverlayMode = useCallback(
    (id: string, elementContainer?: HTMLElement | null) => {
      setRequests((curr) => {
        if (curr.includes(id)) {
          return curr;
        }

        if (elementContainer) {
          disableBodyScroll(elementContainer);
        }
        return [...curr, id];
      });
    },
    []
  );

  const disableOverlayMode = useCallback((id: string) => {
    setRequests((curr) => {
      const newRequests = curr.filter((request) => request !== id);

      if (newRequests.length === 0) {
        clearAllBodyScrollLocks();
      }

      return newRequests;
    });
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

  const enable = useCallback(
    (elementContainer?: HTMLElement | null) =>
      context.enableOverlayMode(id.current, elementContainer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Adding context to deps results in infinite loop

  const disable = useCallback(
    () => context.disableOverlayMode(id.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    overlayModeEnabled: context.overlayModeEnabled,
    enableOverlayMode: enable,
    disableOverlayMode: disable,
  };
}
