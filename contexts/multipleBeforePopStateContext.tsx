/* eslint-disable no-plusplus */
import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';

interface ITransitionOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

export interface INextHistoryState {
  url: string;
  as: string;
  options: ITransitionOptions;
}

type TBeforePopStateCallback = {
  cbFunction: (state: INextHistoryState) => void;
  overrideReturn?: boolean;
};

const MultipleBeforePopStateContext = createContext<{
  callbacks: Map<string, TBeforePopStateCallback>;
  handleAddBeforePopStateCallback: (
    id: string,
    cb: TBeforePopStateCallback
  ) => void;
  handleRemoveBeforePopStateCallback: (id: string) => void;
}>({
  callbacks: new Map(),
  handleAddBeforePopStateCallback: (
    id: string,
    cb: TBeforePopStateCallback
  ) => {},
  handleRemoveBeforePopStateCallback: (id: string) => {},
});

interface IMultipleBeforePopStateContextProvider {
  children: React.ReactNode;
}

const MultipleBeforePopStateContextProvider: React.FC<
  IMultipleBeforePopStateContextProvider
> = ({ children }) => {
  const router = useRouter();

  const [callbacks, setCallbacks] = useState<
    Map<string, TBeforePopStateCallback>
  >(new Map());

  /**
   * Adds a callback to be executed in the onBeforePopState
   * @param id A unique identifier (e.g. an element/component, or a page)
   * @param cb An object of type `TBeforePopStateCallback`, containing a `cbFunction` to be executed, and an optional `overrideReturn` which will prevent next.js/router default behaviour
   */
  const handleAddBeforePopStateCallback = useCallback(
    (id: string, cb: TBeforePopStateCallback) => {
      setCallbacks((cbs) => {
        const mapCopy = new Map(cbs);

        mapCopy.set(id, cb);

        return mapCopy;
      });
    },
    []
  );
  /**
   * Removes a callback from the onBeforePopState Map
   * @param id A unique identifier (e.g. an element/component, or a page)
   */
  const handleRemoveBeforePopStateCallback = useCallback((id: string) => {
    setCallbacks((cbs) => {
      const mapCopy = new Map(cbs);

      mapCopy.delete(id);

      return mapCopy;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      callbacks,
      handleAddBeforePopStateCallback,
      handleRemoveBeforePopStateCallback,
    }),
    [
      callbacks,
      handleAddBeforePopStateCallback,
      handleRemoveBeforePopStateCallback,
    ]
  );

  useEffect(() => {
    router.beforePopState((nextHistoryState) => {
      let returnValue = true;
      if (callbacks.size === 0) {
        return returnValue;
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const [, cb] of callbacks) {
        cb?.cbFunction?.(nextHistoryState);
        // If `overrideReturn` is provided, break the loop and prevent the default
        // behaviour (i.e. the page won't go back)
        if (cb?.overrideReturn) {
          returnValue = false;
          break;
        }
      }

      return returnValue;
    });
  }, [callbacks, router]);

  return (
    <MultipleBeforePopStateContext.Provider value={contextValue}>
      {children}
    </MultipleBeforePopStateContext.Provider>
  );
};

export default MultipleBeforePopStateContextProvider;

export const useMultipleBeforePopState = () => {
  const context = useContext(MultipleBeforePopStateContext);
  if (!context) {
    throw new Error(
      'useMultipleBeforePopState must be used inside a `MultipleBeforePopStateContext.Provider`'
    );
  }

  const {
    handleAddBeforePopStateCallback,
    handleRemoveBeforePopStateCallback,
  } = context;

  return {
    handleAddBeforePopStateCallback,
    handleRemoveBeforePopStateCallback,
  };
};
