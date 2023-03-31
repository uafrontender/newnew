/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
// TODO: adjust eslint no-param-reassign for Slices
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { cookiesInstance } from '../../api/apiConfigs';
import isBrowser from '../../utils/isBrowser';
import { AppThunk } from '../store';
import getColorMode from '../../utils/getColorMode';

// This slice will be responsible for major UI state data:
// the app' color mode; are some global, app-wide components
// open or closed (e.g. navigation sidebars, modals)

// NB!
// I had a great experience having a stack-like structure for
// handling a relatively complex system of side bars and modals,
// maybe we could use something similar for the user "tutorials"?
// NB!

export type TColorMode = 'light' | 'dark' | 'auto';
export type TGlobalSearchActive = true | false;
export type TBanner = {
  show: boolean;
  title: string;
};

export interface UIStateInterface {
  banner: TBanner;
  colorMode: TColorMode;
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
  colorMode: 'auto',
  // colorMode: 'dark',
  mutedMode: true,
  globalSearchActive: false,
};

export const uiSlice: Slice<UIStateInterface> = createSlice({
  name: 'uiState',
  initialState: defaultUIState,
  reducers: {
    _setColorMode(state, { payload }: PayloadAction<TColorMode>) {
      state.colorMode = payload;
    },
    setGlobalSearchActive(
      state,
      { payload }: PayloadAction<TGlobalSearchActive>
    ) {
      state.globalSearchActive = payload;
    },
    setBanner(state, { payload }: PayloadAction<TBanner>) {
      state.banner = payload;
    },
    toggleMutedMode(state) {
      state.mutedMode = !state.mutedMode;
    },
    setMutedMode(state, { payload }) {
      state.mutedMode = payload;
    },
  },
});

export const {
  setBanner,
  _setColorMode,
  toggleMutedMode,
  setMutedMode,
  setGlobalSearchActive,
} = uiSlice.actions;

export const setColorMode =
  (payload: TColorMode): AppThunk =>
  (dispatch, getState) => {
    const currentColorMode = getState().ui.colorMode;

    dispatch(_setColorMode(payload));

    cookiesInstance.set('colorMode', payload, {
      // Expire in 10 years
      maxAge: 10 * 365 * 24 * 60 * 60,
      path: '/',
    });

    const shouldAddTheming = getColorMode(currentColorMode) !== getColorMode(payload)

    // Smooth theming
    if (isBrowser() && shouldAddTheming) {
      document?.documentElement?.classList?.add('theming');
      document?.documentElement?.addEventListener(
        'transitionend',
        () => {
          if (document?.documentElement) {
            document?.documentElement?.classList?.remove('theming');
          }
        },
        { once: true }
      );
      // document?.documentElement?.classList?.toggle('theme-change');
    }
  };

export default uiSlice.reducer;
