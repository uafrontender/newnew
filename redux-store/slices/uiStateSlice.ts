import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loadStateLS, saveStateLS } from '../../utils/localStorage'
import { AppThunk } from '../store'

// This slice will be responsible for major UI state data:
// the app' color mode; are some global, app-wide components
// open or closed (e.g. navigation sidebars, modals)

// NB!
// I had a great experience having a stack-like structure for
// handling a relatively complex system of side bars and modals,
// maybe we could use something similar for the user "tutorials"?
// NB!

export interface UIStateInterface {
  colorMode: 'light' | 'dark'
}

const defaultUIState: UIStateInterface = {
  colorMode: loadStateLS<'light' | 'dark'>('colorMode') ?? 'light',
}

export const uiSlice = createSlice({
  name: 'uiState',
  initialState: defaultUIState,
  reducers: {
    _setColorMode(state, { payload }: PayloadAction<'light' | 'dark'>) {
      state.colorMode = payload
    },
  },
})

// An example of a thunk function, to keep logic not related to state out of the reducers;
// Thunks for asynchronous operations can be also generated using a special method
// https://redux-toolkit.js.org/api/createAsyncThunk#overview
// However, this approach can be used, as well; then we would basically add
// async keyword before the thunk function declaration
// E.g.
// export const toggleColorModeWithLS = (): AppThunk => async (dispatch, getState) => {
export const toggleColorModeWithLS = (): AppThunk => (dispatch, getState) => {
  let { ui } = getState()

  saveStateLS('colorMode', ui.colorMode === 'dark' ? 'light' : 'dark')
  dispatch(_setColorMode(ui.colorMode === 'dark' ? 'light' : 'dark'))
}

export const { _setColorMode } = uiSlice.actions

export default uiSlice.reducer
