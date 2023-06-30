import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const ResponseNumberFromUrlContext = createContext<{
  responseFromUrl?: string | undefined;
  handleSetResponseFromUrl?: (newValue: number) => void;
  handleResetResponseFromUrl?: () => void;
}>({
  responseFromUrl: undefined,
  handleSetResponseFromUrl: () => {},
  handleResetResponseFromUrl: () => {},
});

interface IResponseNumberFromUrlContextProvider {
  responseFromUrlInitial?: string;
  children: React.ReactNode;
}

const ResponseNumberFromUrlContextProvider: React.FC<
  IResponseNumberFromUrlContextProvider
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
    []
  );

  return (
    <ResponseNumberFromUrlContext.Provider value={contextValue}>
      {children}
    </ResponseNumberFromUrlContext.Provider>
  );
};

export default ResponseNumberFromUrlContextProvider;

export function useResponseNumberFromUrl() {
  const context = useContext(ResponseNumberFromUrlContext);
  if (!context) {
    throw new Error(
      'useResponseNumberFromUrl must be used inside a `ResponseNumberFromUrlContextProvider`'
    );
  }

  return context;
}
