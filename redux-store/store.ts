import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  Action,
  combineReducers,
  configureStore,
  EnhancedStore,
  ReducerFromReducersMapObject,
  StateFromReducersMapObject,
  ThunkAction,
} from '@reduxjs/toolkit';

// React-persist
import storage from 'redux-persist/lib/storage';
import persistStore from 'redux-persist/lib/persistStore';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from 'redux-persist';

// Next-wrapper
import { createWrapper } from 'next-redux-wrapper';

// Import reducers
import uiReducer from './slices/uiStateSlice';
import userReducer from './slices/userStateSlice';

import isBrowser from '../utils/isBrowser';

// Persisted reducer configs
// Root
const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['ui', 'user', 'creation'],
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['colorMode', 'mutedMode'],
};

const userPersistConfig = {
  key: 'user',
  storage,
  serializableCheck: false,
  whitelist: ['userData'],
};

const reducers = {
  ui: persistReducer(uiPersistConfig, uiReducer),
  user: persistReducer(userPersistConfig, userReducer),
};

const combinedReducer = combineReducers({
  ui: uiReducer,
  user: userReducer,
});

export type EnhancedStoreWithPersistor = EnhancedStore & {
  __persistor: any;
};

const makeStore = () => {
  if (!isBrowser()) {
    // If not client, create store
    return configureStore({
      reducer: combinedReducer,
      devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
    });
  }

  // Create a new reducer with our existing reducer
  const persistedReducer = persistReducer(
    rootPersistConfig,
    combineReducers(reducers)
  );

  // If it's on client side, create a persisted store
  const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredPaths: ['user.userData.dateOfBirth'],
        },
      }),
  });

  // Add __persistor to `store`
  // eslint-disable-next-line no-underscore-dangle
  (store as EnhancedStoreWithPersistor).__persistor = persistStore(store);

  return store;
};

export type RootState = StateFromReducersMapObject<typeof reducers>;
export type AppDispatch = ReducerFromReducersMapObject<typeof reducers>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = (): any => useDispatch<any>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

type AppStore = ReturnType<typeof makeStore>;
export const wrapper = createWrapper<AppStore>(makeStore);

export default makeStore;
