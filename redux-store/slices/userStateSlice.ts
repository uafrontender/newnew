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

interface ICreatorData {
  isLoaded: boolean;
  options: newnewapi.IGetMyOnboardingStateResponse;
}

export interface IUserStateInterface {
  loggedIn: boolean;
  signupEmailInput: string;
  signupTimerValue: number;
  userData?: TUserData;
  userTutorialsProgress: newnewapi.IGetTutorialsStatusResponse;
  userTutorialsProgressSynced: boolean;
  creatorData?: ICreatorData;
}

const defaultUIState: IUserStateInterface = {
  loggedIn: false,
  signupEmailInput: '',
  signupTimerValue: 0,
  userTutorialsProgress: {
    // AC
    remainingAcSteps: [
      newnewapi.AcTutorialStep.AC_HERO,
      newnewapi.AcTutorialStep.AC_TIMER,
      newnewapi.AcTutorialStep.AC_ALL_BIDS,
      newnewapi.AcTutorialStep.AC_BOOST_BID,
      newnewapi.AcTutorialStep.AC_TEXT_FIELD,
    ],
    // MC
    remainingMcSteps: [
      newnewapi.McTutorialStep.MC_HERO,
      newnewapi.McTutorialStep.MC_TIMER,
      newnewapi.McTutorialStep.MC_ALL_OPTIONS,
      newnewapi.McTutorialStep.MC_VOTE,
      newnewapi.McTutorialStep.MC_TEXT_FIELD,
    ],
    // CF
    remainingCfSteps: [
      newnewapi.CfTutorialStep.CF_HERO,
      newnewapi.CfTutorialStep.CF_TIMER,
      newnewapi.CfTutorialStep.CF_GOAL_PROGRESS,
      newnewapi.CfTutorialStep.CF_BACK_GOAL,
    ],
    remainingAcCrCurrentStep: [newnewapi.AcCreationTutorialStep.AC_CR_HERO],
    remainingCfCrCurrentStep: [newnewapi.CfCreationTutorialStep.CF_CR_HERO],
    remainingMcCrCurrentStep: [newnewapi.McCreationTutorialStep.MC_CR_HERO],
    remainingAcResponseCurrentStep: [
      newnewapi.AcResponseTutorialStep.AC_CHANGE_TITLE,
    ],
    remainingMcResponseCurrentStep: [
      newnewapi.McResponseTutorialStep.MC_CHANGE_TITLE,
    ],
  },
  userTutorialsProgressSynced: false,
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
    setSignupTimerValue(state, { payload }: PayloadAction<number>) {
      state.signupTimerValue = payload;
    },
    setUserData(state, { payload }: PayloadAction<TUserData>) {
      state.userData = { ...state.userData, ...payload };
    },
    setCreatorData(state, { payload }: PayloadAction<ICreatorData>) {
      state.creatorData = { ...state.creatorData, ...payload };
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
    setUserTutorialsProgressSynced(state, { payload }: PayloadAction<boolean>) {
      state.userTutorialsProgressSynced = payload;
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
      state.userTutorialsProgress = defaultUIState.userTutorialsProgress;
      state.userTutorialsProgressSynced =
        defaultUIState.userTutorialsProgressSynced;
    },
  },
});

export const {
  setUserLoggedIn,
  setSignupEmailInput,
  setSignupTimerValue,
  setUserTutorialsProgressInner,
  setUserData,
  setCreatorData,
  logoutUser,
  setUserTutorialsProgressSynced,
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
