/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface IUserStateInterface {
  role: string;
  avatar: string;
  loggedIn: boolean;
  lastName: string;
  firstName: string;
  signupEmailInput: string;
  walletBalance: number;
  notificationsCount: number;
  directMessagesCount: number;
}

const defaultUIState: IUserStateInterface = {
  role: '',
  avatar: '',
  loggedIn: false,
  lastName: 'Dou',
  firstName: 'John',
  signupEmailInput: '',
  walletBalance: 120,
  notificationsCount: 150,
  directMessagesCount: 12,
};

export const userSlice: Slice<IUserStateInterface> = createSlice({
  name: 'userState',
  initialState: defaultUIState,
  reducers: {
    setUserLoggedIn(state, { payload }: PayloadAction<boolean>) {
      state.loggedIn = payload;
    },
    setUserRole(state, { payload }: PayloadAction<string>) {
      state.role = payload;
    },
    setSignupEmailInput(state, { payload }: PayloadAction<string>) {
      state.signupEmailInput = payload;
    },
    setUserAvatar(state, { payload }: PayloadAction<string>) {
      state.avatar = payload;
    },
  },
});

export const {
  setUserRole,
  setUserAvatar,
  setUserLoggedIn,
  setSignupEmailInput,
} = userSlice.actions;

export default userSlice.reducer;
