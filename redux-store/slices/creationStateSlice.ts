/* eslint-disable no-param-reassign */
import moment from 'moment';
import { newnewapi } from 'newnew-api';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

export type TPostData = Omit<newnewapi.Post, 'toJSON' | '_nickname' | '_email'>;
export type TVideoProcessingData = Omit<
  newnewapi.StartVideoProcessingResponse,
  'toJSON' | '_nickname' | '_email'
>;
export type TThumbnailParameters = {
  startTime: number;
  endTime: number;
};

export interface ICreationStateInterface {
  post: {
    title: string;
    startsAt: {
      type: string;
      date: string;
      time: string;
      'hours-format': 'am' | 'pm';
    };
    expiresAt: string;
    options: {
      commentsEnabled: boolean;
    };
    announcementVideoUrl: string;
    thumbnailParameters: TThumbnailParameters;
  };
  auction: {
    minimalBid: number;
  };
  crowdfunding: {
    targetBackerCount?: number;
  };
  multiplechoice: {
    choices: {
      id: number;
      text: string;
    }[];
    options: {
      allowSuggestions: boolean;
    };
  };
  postData?: TPostData;
  videoProcessing?: TVideoProcessingData;
  fileUpload: {
    error: boolean;
    loading: boolean;
    progress: number;
    eta: number;
  };
  fileProcessing: {
    error: boolean;
    loading: boolean;
    progress: number;
    eta: number;
  };
  customCoverImageUrl?: string;
}

const defaultUIState: ICreationStateInterface = {
  post: {
    title: '',
    startsAt: {
      type: 'right-away',
      date: moment().format(),
      time: moment().format('hh:mm'),
      'hours-format': moment().format('a') as 'am' | 'pm',
    },
    expiresAt: '1-hour',
    options: {
      commentsEnabled: true,
    },
    announcementVideoUrl: '',
    thumbnailParameters: {
      startTime: 1,
      endTime: 30,
    },
  },
  auction: {
    minimalBid: 2,
  },
  crowdfunding: {
    targetBackerCount: undefined,
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
  videoProcessing: {
    taskUuid: '',
    targetUrls: {},
  },
  fileUpload: {
    error: false,
    loading: false,
    progress: 0,
    eta: 0,
  },
  fileProcessing: {
    error: false,
    loading: false,
    progress: 0,
    eta: 0,
  },
  customCoverImageUrl: undefined,
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
    setCreationVideoThumbnails(
      state,
      { payload }: PayloadAction<TThumbnailParameters>
    ) {
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
    setCreationFileUploadLoading(state, { payload }: PayloadAction<boolean>) {
      state.fileUpload.loading = payload;
    },
    setCreationFileUploadError(state, { payload }: PayloadAction<boolean>) {
      state.fileUpload.error = payload;
    },
    setCreationFileUploadProgress(state, { payload }: PayloadAction<number>) {
      state.fileUpload.progress = payload;
    },
    setCreationFileUploadETA(state, { payload }: PayloadAction<number>) {
      state.fileUpload.eta = payload;
    },
    setCreationFileProcessingLoading(
      state,
      { payload }: PayloadAction<boolean>
    ) {
      state.fileProcessing.loading = payload;
    },
    setCreationFileProcessingError(state, { payload }: PayloadAction<boolean>) {
      state.fileProcessing.error = payload;
    },
    setCreationFileProcessingProgress(
      state,
      { payload }: PayloadAction<number>
    ) {
      state.fileProcessing.progress = payload;
    },
    setCreationFileProcessingETA(state, { payload }: PayloadAction<number>) {
      state.fileProcessing.eta = payload;
    },
    setCreationVideoProcessing(
      state,
      { payload }: PayloadAction<TVideoProcessingData>
    ) {
      state.videoProcessing = payload;
    },
    setCustomCoverImageUrl(state, { payload }: PayloadAction<string>) {
      state.customCoverImageUrl = payload;
    },
    unsetCustomCoverImageUrl(state) {
      state.customCoverImageUrl = undefined;
    },
    clearCreation(state, { payload }: PayloadAction<number | undefined>) {
      state.post = { ...defaultUIState.post };
      state.auction = { ...defaultUIState.auction };
      if (payload) {
        state.auction.minimalBid = payload;
      }
      state.crowdfunding = { ...defaultUIState.crowdfunding };
      state.multiplechoice = { ...defaultUIState.multiplechoice };
      state.fileUpload = { ...defaultUIState.fileUpload };
      state.fileProcessing = { ...defaultUIState.fileProcessing };
      // @ts-ignore
      state.videoProcessing = { ...defaultUIState.videoProcessing };
      state.customCoverImageUrl = undefined;
    },
    clearPostData(state) {
      state.postData = {};
    },
  },
});

export const {
  setPostData,
  clearPostData,
  clearCreation,
  setCreationVideo,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationFileUploadETA,
  setCreationVideoProcessing,
  setCreationVideoThumbnails,
  setCreationFileUploadError,
  setCreationAllowSuggestions,
  setCreationTargetBackerCount,
  setCreationFileUploadLoading,
  setCreationFileUploadProgress,
  setCreationFileProcessingLoading,
  setCreationFileProcessingError,
  setCreationFileProcessingProgress,
  setCreationFileProcessingETA,
  setCustomCoverImageUrl,
  unsetCustomCoverImageUrl,
} = creationSlice.actions;

export default creationSlice.reducer;
