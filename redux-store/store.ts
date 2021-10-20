import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// React-persist
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import persistStore from 'redux-persist/lib/persistStore';
import storage from 'redux-persist/lib/storage';

// Import reducers
import uiReducer from './slices/uiStateSlice';

// Persisted reducer configs
// Root
const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['ui']
};
// UI
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['colorMode']
};

const rootReducer = combineReducers({
  ui: persistReducer(uiPersistConfig, uiReducer)
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    });
  }
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

// Used in application instead of regular `useDispatch` and `useSelector` to support correct typings
export const useAppDispatch = (): any => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
