/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export interface ICreationStateInterface {
  post: {
    title: string;
    startsAt: Date;
    expiresAt: Date;
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
    startsAt: new Date(),
    expiresAt: new Date(),
    options: {
      commentsEnabled: true,
    },
  },
  auction: {
    minimalBid: 1.00,
  },
  crowdfunding: {
    backingPrice: 1.00,
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
  },
});

export const {
  setCreationTitle,
  setCreationMinBid,
  setCreationComments,
} = creationSlice.actions;

export default creationSlice.reducer;
