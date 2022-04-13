/* eslint-disable no-param-reassign */
import router from 'next/router';
import { newnewapi } from 'newnew-api';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { cookiesInstance } from '../../api/apiConfigs';
import { loadStateLS, saveStateLS } from '../../utils/localStorage';

export type TUserData = Omit<
  newnewapi.Me,
  'toJSON' | '_nickname' | '_email' | '_dateOfBirth'
>;

export interface IUserTutorialsProgress {
  eventsStep: number;
  superPollStep: number;
  goalStep: number;
}

export interface IUserStateInterface {
  loggedIn: boolean;
  signupEmailInput: string;
  notificationsCount: number;
  directMessagesCount: number;
  userData?: TUserData;
  userTutorialsProgress: IUserTutorialsProgress;
}

const defaultUIState: IUserStateInterface = {
  loggedIn: false,
  signupEmailInput: '',
  notificationsCount: 150,
  directMessagesCount: 12,
  userTutorialsProgress: {
    eventsStep: 0, //AC
    superPollStep: 0, //MC
    goalStep: 0, //CF
  },
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
    setUserTutorialsProgress(
      state,
      { payload }: PayloadAction<IUserTutorialsProgress>
    ) {
      state.userTutorialsProgress = {
        ...state.userTutorialsProgress,
        ...payload,
      };

      const localUserTutorialsProgress = loadStateLS(
        'userTutorialsProgress'
      ) as JSON;
      saveStateLS('userTutorialsProgress', {
        ...localUserTutorialsProgress,
        ...payload,
      });
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
  setUserTutorialsProgress,
  setUserData,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;

// Thunks
export const logoutUserClearCookiesAndRedirect =
  (redirectUrl?: string): AppThunk =>
  (dispatch) => {
    dispatch(logoutUser(''));
    cookiesInstance.remove('accessToken');
    cookiesInstance.remove('refreshToken');
    router.push(redirectUrl ?? '/');
  };
