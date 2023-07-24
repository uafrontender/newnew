import React, {
  createContext,
  useCallback,
  useContext,
  // useEffect,
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

  const enableOverlayMode = useCallback(
    (id: string, elementContainer?: HTMLElement | null) => {
      setRequests((curr) => {
        if (curr.includes(id)) {
          return curr;
        }

        return [...curr, id];
      });
    },
    []
  );

  const disableOverlayMode = useCallback(
    (id: string, elementContainer?: HTMLElement | null) => {
      setRequests((curr) => {
        const newRequests = curr.filter((request) => request !== id);

        return newRequests;
      });
    },
    []
  );

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

  const enable = useCallback(
    () => context.enableOverlayMode(id.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // context, - causes infinite loop
    ]
  );

  const disable = useCallback(
    () => context.disableOverlayMode(id.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // context, - causes infinite loop
    ]
  );

  return {
    overlayModeEnabled: context.overlayModeEnabled,
    enableOverlayMode: enable,
    disableOverlayMode: disable,
  };
}
