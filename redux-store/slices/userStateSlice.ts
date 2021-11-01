/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface IUserStateInterface {
  role: string;
  loggedIn: boolean;
  lastName: string;
  firstName: string;
  signupEmailInput: string;
}

const defaultUIState: IUserStateInterface = {
  role: 'creator',
  loggedIn: false,
  lastName: '',
  firstName: '',
  signupEmailInput: '',
};

export const userSlice: Slice<IUserStateInterface> = createSlice({
  name: 'userState',
  initialState: defaultUIState,
  reducers: {
    setUser(state, { payload }: PayloadAction<IUserStateInterface>) {
      state = payload;
    },
    setSignupEmailInput(state, { payload }: PayloadAction<string>) {
      state.signupEmailInput = payload;
    },
  },
});

export const {
  setSignupEmailInput,
  setUser,
} = userSlice.actions;

export default userSlice.reducer;
