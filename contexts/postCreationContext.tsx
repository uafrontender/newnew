import moment from 'moment';
import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useGetAppConstants } from './appConstantsContext';

export type TPostData = Omit<newnewapi.Post, 'toJSON' | '_nickname' | '_email'>;
export type TVideoProcessingData = Omit<
  newnewapi.IStartVideoProcessingResponse,
  'toJSON' | '_nickname' | '_email'
>;
export type TThumbnailParameters = {
  startTime: number;
  endTime: number;
};

export interface ICreationState {
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

const defaultPostState: ICreationState = {
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

const PostCreationContext = createContext<{
  postInCreation: ICreationState;
  setPostData: (newValue: TPostData) => void;
  setCreationTitle: (newValue: string) => void;
  setCreationVideo: (newValue: string) => void;
  setCreationVideoThumbnails: (newValue: TThumbnailParameters) => void;
  setCreationComments: (newValue: boolean) => void;
  setCreationMinBid: (newValue: number) => void;
  setCreationExpireDate: (newValue: string) => void;
  setCreationStartDate: (newValue: ICreationState['post']['startsAt']) => void;
  setCreationTargetBackerCount: (newValue: number) => void;
  setCreationChoices: (
    newValue: ICreationState['multiplechoice']['choices']
  ) => void;
  setCreationAllowSuggestions: (newValue: boolean) => void;
  setCreationFileUploadLoading: (newValue: boolean) => void;
  setCreationFileUploadError: (newValue: boolean) => void;
  setCreationFileUploadProgress: (newValue: number) => void;
  setCreationFileUploadETA: (newValue: number) => void;
  setCreationFileProcessingLoading: (newValue: boolean) => void;
  setCreationFileProcessingError: (newValue: boolean) => void;
  setCreationFileProcessingProgress: (newValue: number) => void;
  setCreationFileProcessingETA: (newValue: number) => void;
  setCreationVideoProcessing: (newValue: TVideoProcessingData) => void;
  setCustomCoverImageUrl: (newValue: string) => void;
  unsetCustomCoverImageUrl: () => void;
  clearCreation: () => void;
  clearPostData: () => void;
}>({
  postInCreation: defaultPostState,
  setPostData: (() => {}) as any,
  setCreationTitle: (() => {}) as any,
  setCreationVideo: (() => {}) as any,
  setCreationVideoThumbnails: (() => {}) as any,
  setCreationComments: (() => {}) as any,
  setCreationMinBid: (() => {}) as any,
  setCreationExpireDate: (() => {}) as any,
  setCreationStartDate: (() => {}) as any,
  setCreationTargetBackerCount: (() => {}) as any,
  setCreationChoices: (() => {}) as any,
  setCreationAllowSuggestions: (() => {}) as any,
  setCreationFileUploadLoading: (() => {}) as any,
  setCreationFileUploadError: (() => {}) as any,
  setCreationFileUploadProgress: (() => {}) as any,
  setCreationFileUploadETA: (() => {}) as any,
  setCreationFileProcessingLoading: (() => {}) as any,
  setCreationFileProcessingError: (() => {}) as any,
  setCreationFileProcessingProgress: (() => {}) as any,
  setCreationFileProcessingETA: (() => {}) as any,
  setCreationVideoProcessing: (() => {}) as any,
  setCustomCoverImageUrl: (() => {}) as any,
  unsetCustomCoverImageUrl: (() => {}) as any,
  clearCreation: (() => {}) as any,
  clearPostData: (() => {}) as any,
});

interface IPostCreationContextProvider {
  children: React.ReactNode;
}

const PostCreationContextProvider: React.FunctionComponent<
  IPostCreationContextProvider
> = ({ children }) => {
  const { appConstants } = useGetAppConstants();
  const defaultMinAcBid = useMemo(
    () => appConstants.minAcBid,
    [appConstants.minAcBid]
  );

  const [postInCreation, setPostInCreation] =
    useState<ICreationState>(defaultPostState);

  const setPostData = useCallback((newValue: TPostData) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.postData = { ...workingObj.postData, ...newValue };
      return workingObj;
    });
  }, []);

  const setCreationTitle = useCallback((newTitle: string) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.post.title = newTitle;
      return workingObj;
    });
  }, []);

  const setCreationVideo = useCallback((videoUrl: string) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.post.announcementVideoUrl = videoUrl;
      return workingObj;
    });
  }, []);

  const setCreationVideoThumbnails = useCallback(
    (thumbnailParameters: TThumbnailParameters) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.post.thumbnailParameters = thumbnailParameters;
        return workingObj;
      });
    },
    []
  );

  const setCreationComments = useCallback((commentsEnabled: boolean) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.post.options.commentsEnabled = commentsEnabled;
      return workingObj;
    });
  }, []);

  const setCreationMinBid = useCallback((minimalBid: number) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.auction.minimalBid = minimalBid;
      return workingObj;
    });
  }, []);

  const setCreationExpireDate = useCallback((expiresAt: string) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.post.expiresAt = expiresAt;
      return workingObj;
    });
  }, []);

  const setCreationStartDate = useCallback(
    (startsAt: ICreationState['post']['startsAt']) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.post.startsAt = { ...workingObj.post.startsAt, ...startsAt };
        return workingObj;
      });
    },
    []
  );

  const setCreationTargetBackerCount = useCallback(
    (targetBackerCount: number) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.crowdfunding.targetBackerCount = targetBackerCount;
        return workingObj;
      });
    },
    []
  );

  const setCreationChoices = useCallback(
    (choices: ICreationState['multiplechoice']['choices']) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.multiplechoice.choices = choices;
        return workingObj;
      });
    },
    []
  );

  const setCreationAllowSuggestions = useCallback(
    (allowSuggestions: boolean) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.multiplechoice.options.allowSuggestions = allowSuggestions;
        return workingObj;
      });
    },
    []
  );

  const setCreationFileUploadLoading = useCallback((loading: boolean) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileUpload.loading = loading;
      return workingObj;
    });
  }, []);

  const setCreationFileUploadError = useCallback((error: boolean) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileUpload.error = error;
      return workingObj;
    });
  }, []);

  const setCreationFileUploadProgress = useCallback((progress: number) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileUpload.progress = progress;
      return workingObj;
    });
  }, []);

  const setCreationFileUploadETA = useCallback((eta: number) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileUpload.eta = eta;
      return workingObj;
    });
  }, []);

  const setCreationFileProcessingLoading = useCallback((loading: boolean) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileProcessing.loading = loading;
      return workingObj;
    });
  }, []);

  const setCreationFileProcessingError = useCallback((error: boolean) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileProcessing.error = error;
      return workingObj;
    });
  }, []);

  const setCreationFileProcessingProgress = useCallback((progress: number) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileProcessing.progress = progress;
      return workingObj;
    });
  }, []);

  const setCreationFileProcessingETA = useCallback((eta: number) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.fileProcessing.eta = eta;
      return workingObj;
    });
  }, []);

  const setCreationVideoProcessing = useCallback(
    (videoProcessing: TVideoProcessingData) => {
      setPostInCreation((curr) => {
        const workingObj = { ...curr };
        workingObj.videoProcessing = videoProcessing;
        return workingObj;
      });
    },
    []
  );

  const setCustomCoverImageUrl = useCallback((customCoverImageUrl: string) => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.customCoverImageUrl = customCoverImageUrl;
      return workingObj;
    });
  }, []);

  const unsetCustomCoverImageUrl = useCallback(() => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.customCoverImageUrl = undefined;
      return workingObj;
    });
  }, []);

  const clearCreation = useCallback(() => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.post = { ...defaultPostState.post };
      workingObj.auction = { ...defaultPostState.auction };
      workingObj.auction.minimalBid = appConstants.minAcBid
        ? appConstants.minAcBid / 100
        : 2;
      workingObj.crowdfunding = { ...defaultPostState.crowdfunding };
      workingObj.multiplechoice = { ...defaultPostState.multiplechoice };
      workingObj.fileUpload = { ...defaultPostState.fileUpload };
      workingObj.fileProcessing = { ...defaultPostState.fileProcessing };

      workingObj.videoProcessing = { taskUuid: '', targetUrls: {} };
      workingObj.fileUpload = {
        error: false,
        loading: false,
        progress: 0,
        eta: 0,
      };
      workingObj.fileProcessing = {
        error: false,
        loading: false,
        progress: 0,
        eta: 0,
      };
      workingObj.customCoverImageUrl = undefined;

      return workingObj;
    });
  }, [appConstants.minAcBid]);

  const clearPostData = useCallback(() => {
    setPostInCreation((curr) => {
      const workingObj = { ...curr };
      workingObj.postData = {};
      return workingObj;
    });
  }, []);

  // If appConstants have changed, update the value of min Ac bid
  useEffect(() => {
    if (defaultMinAcBid) {
      setCreationMinBid(defaultMinAcBid / 100);
    }
    // Linter wants `setCreationMinBid`, however it's not necessary here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMinAcBid]);

  const contextValueMemo = useMemo(
    () => ({
      postInCreation,
      setPostData,
      setCreationTitle,
      setCreationVideo,
      setCreationVideoThumbnails,
      setCreationComments,
      setCreationMinBid,
      setCreationExpireDate,
      setCreationStartDate,
      setCreationTargetBackerCount,
      setCreationChoices,
      setCreationAllowSuggestions,
      setCreationFileUploadLoading,
      setCreationFileUploadError,
      setCreationFileUploadProgress,
      setCreationFileUploadETA,
      setCreationFileProcessingLoading,
      setCreationFileProcessingError,
      setCreationFileProcessingProgress,
      setCreationFileProcessingETA,
      setCreationVideoProcessing,
      setCustomCoverImageUrl,
      unsetCustomCoverImageUrl,
      clearCreation,
      clearPostData,
    }),
    [
      postInCreation,
      setPostData,
      setCreationTitle,
      setCreationVideo,
      setCreationVideoThumbnails,
      setCreationComments,
      setCreationMinBid,
      setCreationExpireDate,
      setCreationStartDate,
      setCreationTargetBackerCount,
      setCreationChoices,
      setCreationAllowSuggestions,
      setCreationFileUploadLoading,
      setCreationFileUploadError,
      setCreationFileUploadProgress,
      setCreationFileUploadETA,
      setCreationFileProcessingLoading,
      setCreationFileProcessingError,
      setCreationFileProcessingProgress,
      setCreationFileProcessingETA,
      setCreationVideoProcessing,
      setCustomCoverImageUrl,
      unsetCustomCoverImageUrl,
      clearCreation,
      clearPostData,
    ]
  );

  return (
    <PostCreationContext.Provider value={contextValueMemo}>
      {children}
    </PostCreationContext.Provider>
  );
};

export default PostCreationContextProvider;

export function usePostCreationState() {
  const context = useContext(PostCreationContext);
  if (!context) {
    throw new Error(
      'usePostCreationState must be used inside a `PostCreationContextProvider`'
    );
  }

  return context;
}
