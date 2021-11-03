import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  combineReducers,
  configureStore,
  ReducerFromReducersMapObject,
  StateFromReducersMapObject,
} from '@reduxjs/toolkit';

// React-persist
import storage from 'redux-persist/lib/storage';
import persistStore from 'redux-persist/lib/persistStore';
import {
  FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE,
} from 'redux-persist';

// Import reducers
import uiReducer from './slices/uiStateSlice';
import userReducer from './slices/userStateSlice';

// Persisted reducer configs
// Root
const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['ui', 'user'],
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: [
    'colorMode',
  ],
};

const userPersistConfig = {
  key: 'user',
  storage,
};

const reducers = {
  ui: persistReducer(uiPersistConfig, uiReducer),
  user: persistReducer(userPersistConfig, userReducer),
};

const initStore = (preloadedState: any) => {
  const persistedReducer = persistReducer(rootPersistConfig, combineReducers(reducers));

  const store = configureStore({
    preloadedState,
    reducer: persistedReducer,
    devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => (
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
    ),
  });

  const persistor = persistStore(store);

  return {
    store,
    persistor,
  };
};

export type RootState = StateFromReducersMapObject<typeof reducers>
export type AppDispatch = ReducerFromReducersMapObject<typeof reducers>

export const useAppDispatch = (): any => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default initStore;
