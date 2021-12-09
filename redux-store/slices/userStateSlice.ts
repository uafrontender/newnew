/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { newnewapi } from 'newnew-api';

import { DEFAULT_CURRENCY } from '../../constants/general';

export type TUserData = Omit<newnewapi.Me, 'toJSON' | '_nickname' | '_email'>;

export interface IUserStateInterface {
  role: string;
  avatar: string;
  currency: string;
  loggedIn: boolean;
  lastName: string;
  firstName: string;
  signupEmailInput: string;
  walletBalance: number;
  notificationsCount: number;
  directMessagesCount: number;
  userData?: TUserData;
}

const defaultUIState: IUserStateInterface = {
  role: '',
  avatar: '',
  currency: DEFAULT_CURRENCY,
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
    setUserCurrency(state, { payload }: PayloadAction<string>) {
      state.currency = payload;
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
  setUserRole,
  setUserAvatar,
  setUserLoggedIn,
  setUserCurrency,
  setSignupEmailInput,
  setUserData,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;
