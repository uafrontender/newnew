/* eslint-disable no-param-reassign */
import router from 'next/router';
import { newnewapi } from 'newnew-api';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

import { AppThunk } from '../store';
import { cookiesInstance } from '../../api/apiConfigs';

export type TUserData = Omit<
  newnewapi.Me,
  'toJSON' | '_nickname' | '_email' | '_dateOfBirth'
>;

interface ICreatorData {
  isLoaded: boolean;
  options: newnewapi.IGetMyOnboardingStateResponse;
}

export interface IUserStateInterface {
  // To signup context? to app state context?
  signupEmailInput: string;
  signupTimerValue: number;

  // To user data context
  userData?: TUserData;
  creatorData?: ICreatorData;
}

const defaultUIState: IUserStateInterface = {
  signupEmailInput: '',
  signupTimerValue: 0,
};

export const userSlice: Slice<IUserStateInterface> = createSlice({
  name: 'userState',
  initialState: defaultUIState,
  reducers: {
    setSignupEmailInput(state, { payload }: PayloadAction<string>) {
      state.signupEmailInput = payload;
    },
    setSignupTimerValue(state, { payload }: PayloadAction<number>) {
      state.signupTimerValue = payload;
    },
    setUserData(state, { payload }: PayloadAction<TUserData>) {
      state.userData = { ...state.userData, ...payload };
    },
    setCreatorData(state, { payload }: PayloadAction<ICreatorData>) {
      state.creatorData = { ...state.creatorData, ...payload };
    },
    // To user data context
    logoutUser(state) {
      state.userData = {
        avatarUrl: '',
        userUuid: '',
        username: '',
        usernameChangedAt: undefined,
        email: '',
        coverUrl: '',
        nickname: '',
        bio: '',
        countryCode: '',
        options: {},
      };
      state.creatorData = {
        isLoaded: false,
        options: {
          creatorStatus: null,
          isCustomAvatar: null,
          isCreatorConnectedToStripe: null,
          isProfileComplete: null,
          isSubscriptionEnabled: null,
          stripeConnectStatus: null,
        },
      };
    },
  },
});

export const {
  setSignupEmailInput,
  setSignupTimerValue,
  setUserData,
  setCreatorData,
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
