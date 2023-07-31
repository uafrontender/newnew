import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const ResponseUuidFromUrlContext = createContext<{
  responseFromUrl?: string | undefined;
  handleSetResponseFromUrl?: (newValue: number) => void;
  handleResetResponseFromUrl?: () => void;
}>({
  responseFromUrl: undefined,
  handleSetResponseFromUrl: () => {},
  handleResetResponseFromUrl: () => {},
});

interface IResponseUuidFromUrlContextProvider {
  responseFromUrlInitial?: string;
  children: React.ReactNode;
}

const ResponseUuidFromUrlContextProvider: React.FC<
  IResponseUuidFromUrlContextProvider
> = ({ responseFromUrlInitial, children }) => {
  const [responseNumber, setResponseNumber] = useState(
    responseFromUrlInitial || undefined
  );

  const handleResetCommentIdFromUrl = useCallback(
    () => setResponseNumber(undefined),
    []
  );

  const contextValue = useMemo(
    () => ({
      responseFromUrl: responseNumber,
      handleSetCommentIdFromUrl: (newValue: string) =>
        setResponseNumber(newValue),
      handleResetCommentIdFromUrl,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // responseNumber, - reason unknown, we need initial only? extremely dangerous here
      handleResetCommentIdFromUrl,
    ]
  );

  return (
    <ResponseUuidFromUrlContext.Provider value={contextValue}>
      {children}
    </ResponseUuidFromUrlContext.Provider>
  );
};

export default ResponseUuidFromUrlContextProvider;

export function useResponseUuidFromUrl() {
  const context = useContext(ResponseUuidFromUrlContext);
  if (!context) {
    throw new Error(
      'useResponseUuidFromUrl must be used inside a `ResponseUuidFromUrlContextProvider`'
    );
  }

  return context;
}
