import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// Import reducers
import uiReducer from './slices/uiStateSlice'

const rootReducer = combineReducers({
  ui: uiReducer,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NEXT_PUBLIC_NODE_ENV !== 'production',
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

// Used in application instead of regular `useDispatch` and `useSelector` to support correct typings
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
