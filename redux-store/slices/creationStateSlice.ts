/* eslint-disable no-param-reassign */
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export type TPostData = Omit<newnewapi.Post, 'toJSON' | '_nickname' | '_email'>;
export type TThumbnailParameters = {
  startTime: number;
  endTime: number;
};

export interface ICreationStateInterface {
  post: {
    title: string;
    startsAt: {
      type: string,
      date: string,
      time: string,
      'hours-format': string,
    };
    expiresAt: string;
    options: {
      commentsEnabled: boolean;
    };
    announcementVideoUrl: string;
    thumbnailParameters: TThumbnailParameters
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
    options: {
      allowSuggestions: boolean;
    };
  },
  postData?: TPostData,
}

const defaultUIState: ICreationStateInterface = {
  post: {
    title: '',
    startsAt: {
      type: 'right-away',
      date: moment().format(),
      time: moment().format('hh:mm'),
      'hours-format': moment().format('a'),
    },
    expiresAt: '1-hour',
    options: {
      commentsEnabled: true,
    },
    announcementVideoUrl: '',
    thumbnailParameters: {
      startTime: 0,
      endTime: 3,
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
    options: {
      allowSuggestions: true,
    },
  },
};

export const creationSlice: Slice<ICreationStateInterface> = createSlice({
  name: 'creationState',
  initialState: defaultUIState,
  reducers: {
    setPostData(state, { payload }: PayloadAction<TPostData>) {
      state.postData = { ...state.postData, ...payload };
    },
    setCreationTitle(state, { payload }: PayloadAction<string>) {
      state.post.title = payload;
    },
    setCreationVideo(state, { payload }: PayloadAction<string>) {
      state.post.announcementVideoUrl = payload;
    },
    setCreationVideoThumbnails(state, { payload }: PayloadAction<TThumbnailParameters>) {
      state.post.thumbnailParameters = { ...payload };
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
    setCreationAllowSuggestions(state, { payload }: PayloadAction<boolean>) {
      state.multiplechoice.options.allowSuggestions = payload;
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
  setPostData,
  clearCreation,
  setCreationVideo,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationVideoThumbnails,
  setCreationAllowSuggestions,
  setCreationTargetBackerCount,
} = creationSlice.actions;

export default creationSlice.reducer;
