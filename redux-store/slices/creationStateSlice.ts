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
    backingPrice: number;
    targetBackerCount: number;
  }
  multiplechoice: {
    choices: {
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
      'hours-format': 'am',
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
    backingPrice: 1,
    targetBackerCount: 1,
  },
  multiplechoice: {
    choices: [],
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
  },
});

export const {
  setCreationTitle,
  setCreationMinBid,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
} = creationSlice.actions;

export default creationSlice.reducer;
