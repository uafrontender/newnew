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

export interface IUserStateInterface {
  loggedIn: boolean;
  signupEmailInput: string;
  // TODO: remove notificationsCount & directMessagesCount from Redux, as they will be stored in Context
  notificationsCount: number;
  directMessagesCount: number;
  userData?: TUserData;
  userTutorialsProgress: newnewapi.IGetTutorialsStatusResponse;
}

const defaultUIState: IUserStateInterface = {
  loggedIn: false,
  signupEmailInput: '',
  // TODO: remove notificationsCount & directMessagesCount from Redux, as they will be stored in Context
  notificationsCount: 150,
  directMessagesCount: 12,
  userTutorialsProgress: {
    // AC
    remainingAcSteps: [
      newnewapi.AcTutorialStep.AC_HERO,
      newnewapi.AcTutorialStep.AC_TIMER,
      newnewapi.AcTutorialStep.AC_ALL_BIDS,
      newnewapi.AcTutorialStep.AC_BOOST_BID,
      newnewapi.AcTutorialStep.AC_TEXT_FIELD,
      newnewapi.AcTutorialStep.AC_TUTORIAL_COMPLETED,
    ],
    // MC
    remainingMcSteps: [
      newnewapi.McTutorialStep.MC_HERO,
      newnewapi.McTutorialStep.MC_TIMER,
      newnewapi.McTutorialStep.MC_ALL_OPTIONS,
      newnewapi.McTutorialStep.MC_VOTE,
      newnewapi.McTutorialStep.MC_TEXT_FIELD,
      newnewapi.McTutorialStep.MC_TUTORIAL_COMPLETED,
    ],
    // CF
    remainingCfSteps: [
      newnewapi.CfTutorialStep.CF_HERO,
      newnewapi.CfTutorialStep.CF_TIMER,
      newnewapi.CfTutorialStep.CF_GO,
      newnewapi.CfTutorialStep.CF_GOAL_PROGRESS,
      newnewapi.CfTutorialStep.CF_BACK_GOAL,
      newnewapi.CfTutorialStep.CF_TUTORIAL_COMPLETED,
    ],
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
    setUserTutorialsProgressInner(
      state,
      { payload }: PayloadAction<newnewapi.IGetTutorialsStatusResponse>
    ) {
      state.userTutorialsProgress = {
        ...state.userTutorialsProgress,
        ...payload,
      };
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
  setUserTutorialsProgressInner,
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

export const setUserTutorialsProgress =
  (payload: any): AppThunk =>
  (dispatch) => {
    dispatch(setUserTutorialsProgressInner(payload));

    const localUserTutorialsProgress = loadStateLS(
      'userTutorialsProgress'
    ) as JSON;
    saveStateLS('userTutorialsProgress', {
      ...localUserTutorialsProgress,
      ...payload,
    });
  };
