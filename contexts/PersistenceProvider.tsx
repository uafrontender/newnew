/* eslint-disable no-underscore-dangle */
import { AnyAction, Store } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { EnhancedStoreWithPersistor } from '../redux-store/store';
import useHasMounted from '../utils/hooks/useHasMounted';

const PersistanceProvider: React.FC<{
  store: Store<any, AnyAction>;
  children: React.ReactNode;
}> = React.memo(({ store, children }) => {
  const hasMounted = useHasMounted();

  // Causes all pages to render TWICE, generates excessive load.
  // Without it SSR does not work
  // isBrowser causes a hydration error
  // TODO: Remove Redux
  if (!hasMounted) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <PersistGate
      loading={null}
      persistor={(store as EnhancedStoreWithPersistor).__persistor}
    >
      {children}
    </PersistGate>
  );
});

export default PersistanceProvider;
