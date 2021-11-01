/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface IUserStateInterface {
  role: string;
  loggedIn: boolean;
  lastName: string;
  firstName: string;
}

const defaultUIState: IUserStateInterface = {
  role: 'creator',
  loggedIn: true,
  lastName: '',
  firstName: '',
};

export const userSlice: Slice<IUserStateInterface> = createSlice({
  name: 'userState',
  initialState: defaultUIState,
  reducers: {
    setUser(state, { payload }: PayloadAction<IUserStateInterface>) {
      state = payload;
    },
  },
});

export const {
  setUser,
} = userSlice.actions;

export default userSlice.reducer;
