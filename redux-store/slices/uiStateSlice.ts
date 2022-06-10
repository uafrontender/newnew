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

export type TOverlay = true | false;
export type TColorMode = 'light' | 'dark' | 'auto';
export type TGlobalSearchActive = true | false;
export type TResizeMode =
  | 'mobile'
  | 'mobileS'
  | 'mobileM'
  | 'mobileL'
  | 'tablet'
  | 'laptop'
  | 'laptopL'
  | 'desktop';
export type TBanner = {
  show: boolean;
  title: string;
};

export interface UIStateInterface {
  banner: TBanner;
  overlay: TOverlay;
  colorMode: TColorMode;
  resizeMode: TResizeMode;
  mutedMode: boolean;
  globalSearchActive: TGlobalSearchActive;
}

export const defaultUIState: UIStateInterface = {
  banner: {
    // show: true,
    show: false,
    title:
      'Few minutes left to find out who will be new Iron Man. Hurry up and make your choice.',
  },
  overlay: false,
  colorMode: 'auto',
  // colorMode: 'dark',
  resizeMode: 'laptop',
  mutedMode: true,
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
    setGlobalSearchActive(
      state,
      { payload }: PayloadAction<TGlobalSearchActive>
    ) {
      state.globalSearchActive = payload;
    },
    setOverlay(state, { payload }: PayloadAction<TOverlay>) {
      state.overlay = payload;
    },
    setBanner(state, { payload }: PayloadAction<TBanner>) {
      state.banner = payload;
    },
    toggleMutedMode(state) {
      state.mutedMode = !state.mutedMode;
    },
  },
});

export const {
  setBanner,
  setOverlay,
  setColorMode,
  setResizeMode,
  toggleMutedMode,
  setGlobalSearchActive,
} = uiSlice.actions;

export default uiSlice.reducer;
