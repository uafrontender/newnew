/* eslint-disable no-param-reassign */
// TODO: adjust eslint no-param-reassign for Slices
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

// This slice will be responsible for major UI state data:
// the app' color mode; are some global, app-wide components
// open or closed (e.g. navigation sidebars, modals)

// NB!
// I had a great experience having a stack-like structure for
// handling a relatively complex system of side bars and modals,
// maybe we could use something similar for the user "tutorials"?
// NB!

export type TColorMode = 'light' | 'dark';
export type TGlobalSearchActive = true | false;
export type TResizeMode =
  'mobile'
  | 'mobileS'
  | 'mobileM'
  | 'mobileL'
  | 'tablet'
  | 'laptop'
  | 'laptopL'
  | 'desktop';

export interface UIStateInterface {
  colorMode: TColorMode;
  resizeMode: TResizeMode;
  globalSearchActive: TGlobalSearchActive;
}

export const defaultUIState: UIStateInterface = {
  colorMode: 'light',
  resizeMode: 'mobile',
  globalSearchActive: false,
};

export const uiSlice: Slice<UIStateInterface> = createSlice({
  name: 'uiState',
  initialState: defaultUIState,
  reducers: {
    setColorMode(state, { payload }: PayloadAction<TColorMode>) {
      state.colorMode = payload;
    },
    setResizeMode(state, { payload }: PayloadAction<TResizeMode>) {
      state.resizeMode = payload;
    },
    setGlobalSearchActive(state, { payload }: PayloadAction<TGlobalSearchActive>) {
      state.globalSearchActive = payload;
    },
  },
});

export const {
  setColorMode,
  setResizeMode,
  setGlobalSearchActive,
} = uiSlice.actions;

export default uiSlice.reducer;
