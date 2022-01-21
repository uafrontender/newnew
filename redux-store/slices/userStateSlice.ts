/* eslint-disable no-param-reassign */
import router from 'next/router';
import { newnewapi } from 'newnew-api';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { cookiesInstance } from '../../api/apiConfigs';

export type TUserData = Omit<newnewapi.Me, 'toJSON' | '_nickname' | '_email'>;

export interface IUserStateInterface {
  loggedIn: boolean;
  signupEmailInput: string;
  walletBalance: number;
  notificationsCount: number;
  directMessagesCount: number;
  userData?: TUserData;
}

const defaultUIState: IUserStateInterface = {
  loggedIn: false,
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
    setSignupEmailInput(state, { payload }: PayloadAction<string>) {
      state.signupEmailInput = payload;
    },
    setUserData(state, { payload }: PayloadAction<TUserData>) {
      state.userData = { ...state.userData, ...payload };
    },
    logoutUser(state) {
      state.loggedIn = false;
      state.userData = {
        avatarUrl: '',
        userUuid: '',
        username: '',
        usernameChangedAt: undefined,
        email: '',
        coverUrl: '',
        nickname: '',
        bio: '',
        options: {},
      };
    },
  },
});

export const {
  setUserLoggedIn,
  setSignupEmailInput,
  setUserData,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;

// Thunks
export const logoutUserClearCookiesAndRedirect = (
  redirectUrl?: string,
): AppThunk => (dispatch) => {
  dispatch(logoutUser(''));
  cookiesInstance.remove('accessToken');
  cookiesInstance.remove('refreshToken');
  router.push(redirectUrl ?? '/');
};
