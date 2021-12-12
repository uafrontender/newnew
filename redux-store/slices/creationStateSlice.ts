/* eslint-disable no-param-reassign */
import moment from 'moment';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface ICreationStateInterface {
  post: {
    title: string;
    startsAt: {
      type: string,
      date: Date,
      time: string,
      'hours-format': string,
    };
    expiresAt: string;
    options: {
      commentsEnabled: boolean;
    };
  },
  auction: {
    minimalBid: number;
  }
  crowdfunding: {
    targetBackerCount: number;
  }
  multiplechoice: {
    choices: {
      id: number;
      text: string;
    }[],
  }
}

const defaultUIState: ICreationStateInterface = {
  post: {
    title: '',
    startsAt: {
      type: 'right-away',
      date: new Date(),
      time: moment().format('hh:mm'),
      'hours-format': moment().format('a'),
    },
    expiresAt: '1-hour',
    options: {
      commentsEnabled: true,
    },
  },
  auction: {
    minimalBid: 1,
  },
  crowdfunding: {
    targetBackerCount: 1,
  },
  multiplechoice: {
    choices: [
      {
        id: 1,
        text: '',
      },
      {
        id: 2,
        text: '',
      },
    ],
  },
};

export const creationSlice: Slice<ICreationStateInterface> = createSlice({
  name: 'creationState',
  initialState: defaultUIState,
  reducers: {
    setCreationTitle(state, { payload }: PayloadAction<string>) {
      state.post.title = payload;
    },
    setCreationComments(state, { payload }: PayloadAction<boolean>) {
      state.post.options.commentsEnabled = payload;
    },
    setCreationMinBid(state, { payload }: PayloadAction<number>) {
      state.auction.minimalBid = payload;
    },
    setCreationExpireDate(state, { payload }: PayloadAction<string>) {
      state.post.expiresAt = payload;
    },
    setCreationStartDate(state, { payload }: PayloadAction<Date>) {
      state.post.startsAt = { ...state.post.startsAt, ...payload };
    },
    setCreationTargetBackerCount(state, { payload }: PayloadAction<number>) {
      state.crowdfunding.targetBackerCount = payload;
    },
    setCreationChoices(state, { payload }: PayloadAction<[]>) {
      state.multiplechoice.choices = payload;
    },
    clearCreation(state) {
      state.post = { ...defaultUIState.post };
      state.auction = { ...defaultUIState.auction };
      state.crowdfunding = { ...defaultUIState.crowdfunding };
      state.multiplechoice = { ...defaultUIState.multiplechoice };
    },
  },
});

export const {
  clearCreation,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationTargetBackerCount,
} = creationSlice.actions;

export default creationSlice.reducer;
