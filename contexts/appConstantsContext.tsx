import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import { getAppConstants } from '../api/endpoints/infrastructure';

export const AppConstantsContext = createContext<{
  appConstants: Omit<newnewapi.GetAppConstantsResponse, 'toJSON'>;
}>({
  appConstants: {} as any,
});

interface IAppConstantsContextProvider {
  children: React.ReactNode;
}

const AppConstantsContextProvider: React.FC<IAppConstantsContextProvider> = ({
  children,
}) => {
  const [appConstants, setAppConstants] = useState<
    Omit<newnewapi.GetAppConstantsResponse, 'toJSON'>
  >({} as any);

  const contextValue = useMemo(
    () => ({
      appConstants,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [appConstants]
  );

  useEffect(() => {
    async function fetchAppConstants() {
      try {
        const payload = new newnewapi.EmptyRequest({});

        const { data } = await getAppConstants(payload);

        if (data) {
          setAppConstants(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchAppConstants();
  }, []);

  return (
    <AppConstantsContext.Provider value={contextValue}>
      {children}
    </AppConstantsContext.Provider>
  );
};

export default AppConstantsContextProvider;

export function useGetAppConstants() {
  const context = useContext(AppConstantsContext);
  if (!context) {
    throw new Error(
      'useGetAppConstants must be used inside a `AppConstantsContext.Provider`'
    );
  }

  return context;
}
