import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';

import { TVideoProcessingData } from '../redux-store/slices/creationStateSlice';
import { SocketContext } from './socketContext';
import { usePostModalState } from './postModalContext';
import {
  getVideoUploadUrl,
  removeUploadedFile,
  startVideoProcessing,
  stopVideoProcessing,
} from '../api/endpoints/upload';
import {
  deleteAdditionalPostResponse,
  uploadAdditionalPostResponse,
  uploadPostResponse,
} from '../api/endpoints/post';
import waitResourceIsAvailable from '../utils/checkResourceAvailable';
import { usePostModalInnerState } from './postModalInnerContext';

interface IPostModerationResponsesContext {
  // Tabs
  openedTab: 'announcement' | 'response';
  handleChangeTab: (nevValue: 'announcement' | 'response') => void;
  // Core response
  coreResponse: newnewapi.IVideoUrls | undefined;
  coreResponseUploading: boolean;
  handleUploadVideoProcessed: () => Promise<void>;
  handleUploadVideoNotProcessed: () => Promise<void>;
  // Additional responses
  currentStep: 'regular' | 'editing';
  handleSetCurrentStep: (step: 'regular' | 'editing') => void;
  additionalResponses: newnewapi.IVideoUrls[];
  additionalResponseUploading: boolean;
  readyToUploadAdditionalResponse: boolean;
  handleUploadAdditionalVideoProcessed: () => Promise<void>;
  handleDeleteAdditionalResponse: (videoUuid: string) => Promise<void>;
  // File uploading
  videoProcessing?: TVideoProcessingData;
  uploadedResponseVideoUrl: string;
  responseUploadSuccess: boolean;
  responseFileUploadETA: number;
  responseFileUploadProgress: number;
  responseFileUploadLoading: boolean;
  responseFileUploadError: boolean;
  responseFileProcessingETA: number;
  responseFileProcessingProgress: number;
  responseFileProcessingLoading: boolean;
  responseFileProcessingError: boolean;
  handleItemChange: (
    id: string,
    value: File | null | undefined
  ) => Promise<void>;
  handleResetVideoUploadAndProcessingState: () => void;
  handleCancelVideoUpload: () => void | undefined;
  handleVideoDelete: () => Promise<void>;
  handleSetUploadingAdditionalResponse: (newValue: boolean) => void;
  handleSetReadyToUploadAdditionalResponse: (newValue: boolean) => void;
}

const PostModerationResponsesContext =
  createContext<IPostModerationResponsesContext>({
    // Tabs
    openedTab: 'announcement',
    handleChangeTab: (nevValue: 'announcement' | 'response') => {},
    // Core response
    coreResponse: undefined,
    coreResponseUploading: false,
    handleUploadVideoProcessed: (() => {}) as () => Promise<void>,
    handleUploadVideoNotProcessed: (() => {}) as () => Promise<void>,
    // Additional responses
    currentStep: 'regular',
    handleSetCurrentStep: (step: 'regular' | 'editing') => {},
    additionalResponses: [],
    additionalResponseUploading: false,
    readyToUploadAdditionalResponse: false,
    handleUploadAdditionalVideoProcessed: (() => {}) as () => Promise<void>,
    handleDeleteAdditionalResponse: ((videoUuid: string) => {}) as (
      videoUuid: string
    ) => Promise<void>,
    // File uploading
    videoProcessing: undefined,
    uploadedResponseVideoUrl: '',
    responseUploadSuccess: false,
    responseFileUploadETA: 0,
    responseFileUploadProgress: 0,
    responseFileUploadLoading: false,
    responseFileUploadError: false,
    responseFileProcessingETA: 0,
    responseFileProcessingProgress: 0,
    responseFileProcessingLoading: false,
    responseFileProcessingError: false,
    handleItemChange: ((id: string, value: File | null | undefined) => {}) as (
      id: string,
      value: File | null | undefined
    ) => Promise<void>,
    handleResetVideoUploadAndProcessingState: () => {},
    handleCancelVideoUpload: () => {},
    handleVideoDelete: (() => {}) as () => Promise<void>,
    handleSetUploadingAdditionalResponse: () => {},
    handleSetReadyToUploadAdditionalResponse: () => {},
  });

interface IPostModerationResponsesContextProvider {
  coreResponseInitial?: newnewapi.IVideoUrls;
  additionalResponsesInitial?: newnewapi.IVideoUrls[];
  openedTab: 'announcement' | 'response';
  handleChangeTab: (nevValue: 'announcement' | 'response') => void;
  children: React.ReactNode;
}

const PostModerationResponsesContextProvider: React.FunctionComponent<
  IPostModerationResponsesContextProvider
> = ({
  coreResponseInitial,
  additionalResponsesInitial,
  openedTab,
  handleChangeTab,
  children,
}) => {
  const { t } = useTranslation('modal-Post');
  const { t: tCommon } = useTranslation('common');
  const socketConnection = useContext(SocketContext);

  const { postParsed, postStatus, handleUpdatePostStatus } =
    usePostModalInnerState();
  const postId = useMemo(() => postParsed?.postUuid, [postParsed?.postUuid]);

  // Core response
  const [coreResponse, setCoreResponse] = useState<
    newnewapi.IVideoUrls | undefined
  >(coreResponseInitial);

  const handleUpdateResponseVideo = useCallback(
    (newValue: newnewapi.IVideoUrls) => setCoreResponse(newValue),
    []
  );

  // Additional responses
  const [currentStep, setCurrentStep] = useState<'regular' | 'editing'>(
    'regular'
  );

  const handleSetCurrentStep = useCallback((step: 'regular' | 'editing') => {
    setCurrentStep(step);
  }, []);

  const [additionalResponses, setAdditionalResponses] = useState<
    newnewapi.IVideoUrls[]
  >(additionalResponsesInitial ?? []);

  const [additionalResponseUploading, setUploadingAdditionalResponse] =
    useState(false);

  const [readyToUploadAdditionalResponse, setReadyToUploadAdditionalResponse] =
    useState(false);

  const handleAddAdditonalResponse = useCallback(
    (newVideo: newnewapi.IVideoUrls) => {
      setAdditionalResponses((curr) => [...curr, newVideo]);
    },
    [setAdditionalResponses]
  );

  const handleDeleteAdditionalResponse = useCallback(
    async (videoUuid: string) => {
      try {
        const req = new newnewapi.DeleteAdditionalPostResponseRequest({
          videoUuid,
        });

        const res = await deleteAdditionalPostResponse(req);

        if (res.error) throw new Error('Failed to delete video');

        setAdditionalResponses((curr) => {
          const workingArray = curr.filter((video) => video.uuid !== videoUuid);
          return workingArray;
        });
      } catch (err) {
        console.error(err);
        toast.error(tCommon('toastErrors.generic'));
      }
    },
    [tCommon]
  );

  const handleSetUploadingAdditionalResponse = useCallback(
    (newValue: boolean) => setUploadingAdditionalResponse(newValue),
    []
  );
  const handleSetReadyToUploadAdditionalResponse = useCallback(
    (newValue: boolean) => setReadyToUploadAdditionalResponse(newValue),
    []
  );

  // File upload
  const xhrRef = useRef<XMLHttpRequest>();
  const [uploadedResponseVideoUrl, setUploadedResponseVideoUrl] = useState('');

  const [videoProcessing, setVideoProcessing] = useState<TVideoProcessingData>({
    taskUuid: '',
    targetUrls: {},
  });
  // File upload
  const [responseFileUploadETA, setResponseFileUploadETA] = useState(0);
  const [responseFileUploadProgress, setResponseFileUploadProgress] =
    useState(0);
  const [responseFileUploadLoading, setResponseFileUploadLoading] =
    useState(false);
  const [responseFileUploadError, setResponseFileUploadError] = useState(false);
  // File processing
  const [responseFileProcessingETA, setResponseFileProcessingETA] = useState(0);
  const [responseFileProcessingProgress, setResponseFileProcessingProgress] =
    useState(0);
  const [responseFileProcessingLoading, setResponseFileProcessingLoading] =
    useState(false);
  const [responseFileProcessingError, setResponseFileProcessingError] =
    useState(false);

  // Updating Post data
  const [coreResponseUploading, setCoreResponseUploading] = useState(false);
  const [responseUploadSuccess, setResponseUploadSuccess] = useState(false);

  const { handleSetIsConfirmToClosePost } = usePostModalState();

  const cannotLeavePage = useMemo(() => {
    if (
      openedTab === 'response' &&
      postStatus === 'waiting_for_response' &&
      (responseFileUploadLoading || responseFileProcessingLoading)
    ) {
      return true;
    }
    return false;
  }, [
    openedTab,
    postStatus,
    responseFileProcessingLoading,
    responseFileUploadLoading,
  ]);

  const handleVideoUpload = useCallback(async (value: File) => {
    try {
      setResponseFileUploadETA(100);
      setResponseFileUploadProgress(1);
      setResponseFileUploadLoading(true);
      setResponseFileUploadError(false);

      const payload = new newnewapi.GetVideoUploadUrlRequest({
        filename: value.name,
      });

      const res = await getVideoUploadUrl(payload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'An error occurred');
      }

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      let uploadStartTimestamp: number;
      const uploadResponse = await new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const uploadProgress = Math.round(
              (event.loaded / event.total) * 100
            );
            const percentageLeft = 100 - uploadProgress;
            const secondsPassed = Math.round(
              (event.timeStamp - uploadStartTimestamp) / 1000
            );
            const factor = secondsPassed / uploadProgress;
            const eta = Math.round(factor * percentageLeft);
            setResponseFileUploadProgress(uploadProgress);
            setResponseFileUploadETA(eta);
          }
        });
        xhr.addEventListener('loadstart', (event) => {
          uploadStartTimestamp = event.timeStamp;
        });
        xhr.addEventListener('loadend', () => {
          setResponseFileUploadProgress(100);
          resolve(xhr.readyState === 4 && xhr.status === 200);
        });
        xhr.addEventListener('error', () => {
          setResponseFileUploadProgress(0);
          reject(new Error('Upload failed'));
        });
        xhr.addEventListener('abort', () => {
          setResponseFileUploadProgress(0);
          reject(new Error('Upload aborted'));
        });
        xhr.open('PUT', res.data!.uploadUrl, true);
        xhr.setRequestHeader('Content-Type', value.type);
        xhr.send(value);
      });

      if (!uploadResponse) {
        throw new Error('Upload failed');
      }

      const payloadProcessing = new newnewapi.StartVideoProcessingRequest({
        publicUrl: res.data.publicUrl,
      });

      const resProcessing = await startVideoProcessing(payloadProcessing);

      if (!resProcessing.data || resProcessing.error) {
        throw new Error(resProcessing.error?.message ?? 'An error occurred');
      }

      setVideoProcessing({
        taskUuid: resProcessing.data.taskUuid,
        targetUrls: {
          thumbnailUrl: resProcessing?.data?.targetUrls?.thumbnailUrl,
          hlsStreamUrl: resProcessing?.data?.targetUrls?.hlsStreamUrl,
          dashStreamUrl: resProcessing?.data?.targetUrls?.dashStreamUrl,
          originalVideoUrl: resProcessing?.data?.targetUrls?.originalVideoUrl,
          thumbnailImageUrl: resProcessing?.data?.targetUrls?.thumbnailImageUrl,
        },
      });

      setResponseFileUploadLoading(false);

      setResponseFileProcessingProgress(10);
      setResponseFileProcessingETA(80);
      setResponseFileProcessingLoading(true);
      setResponseFileProcessingError(false);
      setUploadedResponseVideoUrl(res.data.publicUrl ?? '');
      xhrRef.current = undefined;
    } catch (error: any) {
      if (error.message === 'Upload failed') {
        setResponseFileUploadError(true);
        toast.error(error?.message);
      } else {
        console.log('Upload aborted');
      }
      xhrRef.current = undefined;
      setResponseFileUploadLoading(false);
    }
  }, []);

  const handleVideoDelete = useCallback(async () => {
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: uploadedResponseVideoUrl,
      });

      const res = await removeUploadedFile(payload);

      if (res?.error) {
        throw new Error(res.error?.message ?? 'An error occurred');
      }

      const payloadProcessing = new newnewapi.StopVideoProcessingRequest({
        taskUuid: videoProcessing?.taskUuid,
      });

      const resProcessing = await stopVideoProcessing(payloadProcessing);

      if (!resProcessing.data || resProcessing.error) {
        throw new Error(resProcessing.error?.message ?? 'An error occurred');
      }

      setUploadedResponseVideoUrl('');
      setVideoProcessing({
        taskUuid: '',
        targetUrls: {},
      });
      setResponseFileUploadError(false);
      setResponseFileUploadLoading(false);
      setResponseFileUploadProgress(0);
      setResponseFileProcessingError(false);
      setResponseFileProcessingLoading(false);
      setResponseFileProcessingProgress(0);
    } catch (error: any) {
      toast.error(error?.message);
    }
  }, [uploadedResponseVideoUrl, videoProcessing?.taskUuid]);

  const handleItemChange = useCallback(
    async (id: string, value: File | null | undefined) => {
      if (value) {
        await handleVideoUpload(value);
      } else {
        await handleVideoDelete();
      }
    },
    [handleVideoDelete, handleVideoUpload]
  );

  const handleUploadVideoProcessed = useCallback(async () => {
    setCoreResponseUploading(true);
    try {
      const payload = new newnewapi.UploadPostResponseRequest({
        postUuid: postId,
        responseVideoUrl: uploadedResponseVideoUrl,
      });

      const res = await uploadPostResponse(payload);

      if (res.data) {
        // @ts-ignore
        let responseObj;
        if (res.data.auction) responseObj = res.data.auction.response;
        if (res.data.multipleChoice)
          responseObj = res.data.multipleChoice.response;
        if (res.data.crowdfunding) responseObj = res.data.crowdfunding.response;
        // @ts-ignore
        if (responseObj) handleUpdateResponseVideo(responseObj);
        handleUpdatePostStatus('SUCCEEDED');
        setUploadedResponseVideoUrl('');
        setResponseUploadSuccess(true);

        setResponseFileUploadError(false);
        setResponseFileUploadLoading(false);
        setResponseFileUploadProgress(0);
        setResponseFileProcessingError(false);
        setResponseFileProcessingLoading(false);
        setResponseFileProcessingProgress(0);
      }
    } catch (err) {
      console.error(err);
      toast.error(tCommon('toastErrors.generic'));
    } finally {
      setCoreResponseUploading(false);
    }
  }, [
    postId,
    uploadedResponseVideoUrl,
    handleUpdateResponseVideo,
    handleUpdatePostStatus,
    tCommon,
  ]);

  const handleUploadVideoNotProcessed = useCallback(async () => {
    try {
      const payload = new newnewapi.UploadPostResponseRequest({
        postUuid: postId,
        responseVideoUrl: uploadedResponseVideoUrl,
      });

      const res = await uploadPostResponse(payload);

      if (res.data) {
        toast.success(t('postVideo.responseUploadedNonProcessed'));
        handleUpdatePostStatus('PROCESSING_RESPONSE');
        setUploadedResponseVideoUrl('');
      }
    } catch (err) {
      console.error(err);
      toast.error(tCommon('toastErrors.generic'));
    }
  }, [postId, uploadedResponseVideoUrl, t, handleUpdatePostStatus, tCommon]);

  const handleUploadAdditionalVideoProcessed = useCallback(async () => {
    setUploadingAdditionalResponse(true);
    try {
      const payload = new newnewapi.UploadAdditionalPostResponseRequest({
        postUuid: postId,
        additionalResponseVideoUrl: uploadedResponseVideoUrl,
      });

      const res = await uploadAdditionalPostResponse(payload);

      if (res.data) {
        let responseObj: newnewapi.IVideoUrls | undefined;
        if (
          res.data.auction &&
          res.data.auction.additionalResponses &&
          res.data.auction.additionalResponses.length
        ) {
          responseObj =
            res.data.auction.additionalResponses[
              res.data.auction.additionalResponses.length - 1
            ];
        }
        if (
          res.data.multipleChoice &&
          res.data.multipleChoice.additionalResponses &&
          res.data.multipleChoice.additionalResponses.length
        ) {
          responseObj =
            res.data.multipleChoice.additionalResponses[
              res.data.multipleChoice.additionalResponses.length - 1
            ];
        }
        if (
          res.data.crowdfunding &&
          res.data.crowdfunding.additionalResponses &&
          res.data.crowdfunding.additionalResponses.length
        ) {
          responseObj =
            res.data.crowdfunding.additionalResponses[
              res.data.crowdfunding.additionalResponses.length - 1
            ];
        }

        if (responseObj) {
          handleAddAdditonalResponse(responseObj);
          setUploadedResponseVideoUrl('');

          setResponseFileUploadError(false);
          setResponseFileUploadLoading(false);
          setResponseFileUploadProgress(0);
          setResponseFileProcessingError(false);
          setResponseFileProcessingLoading(false);
          setResponseFileProcessingProgress(0);

          setCurrentStep('regular');
        } else {
          throw new Error('No additional videoUrls in the response');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(tCommon('toastErrors.generic'));
    } finally {
      setUploadingAdditionalResponse(false);
    }
  }, [handleAddAdditonalResponse, postId, tCommon, uploadedResponseVideoUrl]);

  const handlerSocketUpdated = useCallback(
    async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) return;

      if (
        decoded.taskUuid === videoProcessing?.taskUuid ||
        decoded.postUuid === postId
      ) {
        setResponseFileProcessingETA(
          decoded.estimatedTimeLeft?.seconds as number
        );

        if (decoded.fractionCompleted > responseFileProcessingProgress) {
          setResponseFileProcessingProgress(decoded.fractionCompleted);
        }

        if (
          decoded.fractionCompleted === 100 &&
          decoded.status ===
            newnewapi.VideoProcessingProgress.Status.SUCCEEDED &&
          videoProcessing.targetUrls?.hlsStreamUrl
        ) {
          const available = await waitResourceIsAvailable(
            videoProcessing.targetUrls?.hlsStreamUrl,
            {
              maxAttempts: 60,
              retryTimeMs: 1000,
            }
          );

          if (available) {
            setResponseFileProcessingLoading(false);
          } else {
            setResponseFileUploadError(true);
            toast.error(tCommon('toastErrors.generic'));
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          setResponseFileUploadError(true);
          toast.error(tCommon('toastErrors.generic'));
        }
      }
    },
    [
      videoProcessing?.taskUuid,
      videoProcessing.targetUrls?.hlsStreamUrl,
      postId,
      responseFileProcessingProgress,
      tCommon,
    ]
  );

  const handleResetVideoUploadAndProcessingState = useCallback(() => {
    setUploadedResponseVideoUrl('');
    setVideoProcessing({
      taskUuid: '',
      targetUrls: {},
    });
    setResponseFileUploadError(false);
    setResponseFileUploadLoading(false);
    setResponseFileUploadProgress(0);
    setResponseFileProcessingError(false);
    setResponseFileProcessingLoading(false);
    setResponseFileProcessingProgress(0);
  }, []);

  const handleCancelVideoUpload = () => xhrRef.current?.abort();

  useEffect(() => {
    if (socketConnection) {
      socketConnection?.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, handlerSocketUpdated]);

  // Video processing fallback
  useEffect(() => {
    async function videoProcessingFallback(hlsUrl: string) {
      const available = await waitResourceIsAvailable(hlsUrl, {
        maxAttempts: 720,
        retryTimeMs: 5000,
      });

      if (available) {
        setResponseFileProcessingLoading(false);
      } else {
        setResponseFileUploadError(true);
        toast.error(tCommon('toastErrors.generic'));
      }
    }

    if (
      responseFileProcessingLoading &&
      videoProcessing?.targetUrls?.hlsStreamUrl
    ) {
      videoProcessingFallback(videoProcessing?.targetUrls?.hlsStreamUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    responseFileProcessingLoading,
    videoProcessing?.targetUrls?.hlsStreamUrl,
  ]);

  useEffect(() => {
    handleSetIsConfirmToClosePost(cannotLeavePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cannotLeavePage]);

  const contextValue = useMemo<IPostModerationResponsesContext>(
    () => ({
      // Tabs
      openedTab,
      handleChangeTab,
      // Core response
      coreResponse,
      coreResponseUploading,
      // Additional responses
      currentStep,
      handleSetCurrentStep,
      additionalResponses,
      additionalResponseUploading,
      readyToUploadAdditionalResponse,
      handleDeleteAdditionalResponse,
      videoProcessing,
      uploadedResponseVideoUrl,
      responseUploadSuccess,
      responseFileUploadETA,
      responseFileUploadProgress,
      responseFileUploadLoading,
      responseFileUploadError,
      responseFileProcessingETA,
      responseFileProcessingProgress,
      responseFileProcessingLoading,
      responseFileProcessingError,
      handleItemChange,
      handleUploadVideoProcessed,
      handleUploadVideoNotProcessed,
      handleUploadAdditionalVideoProcessed,
      handleResetVideoUploadAndProcessingState,
      handleCancelVideoUpload,
      handleVideoDelete,
      handleSetUploadingAdditionalResponse,
      handleSetReadyToUploadAdditionalResponse,
    }),
    [
      openedTab,
      handleChangeTab,
      coreResponse,
      coreResponseUploading,
      currentStep,
      handleSetCurrentStep,
      additionalResponses,
      additionalResponseUploading,
      readyToUploadAdditionalResponse,
      handleDeleteAdditionalResponse,
      videoProcessing,
      uploadedResponseVideoUrl,
      responseUploadSuccess,
      responseFileUploadETA,
      responseFileUploadProgress,
      responseFileUploadLoading,
      responseFileUploadError,
      responseFileProcessingETA,
      responseFileProcessingProgress,
      responseFileProcessingLoading,
      responseFileProcessingError,
      handleItemChange,
      handleUploadVideoProcessed,
      handleUploadVideoNotProcessed,
      handleUploadAdditionalVideoProcessed,
      handleResetVideoUploadAndProcessingState,
      handleVideoDelete,
      handleSetUploadingAdditionalResponse,
      handleSetReadyToUploadAdditionalResponse,
    ]
  );

  return (
    <>
      <PostModerationResponsesContext.Provider value={contextValue}>
        {children}
      </PostModerationResponsesContext.Provider>
    </>
  );
};

export default PostModerationResponsesContextProvider;

export function usePostModerationResponsesContext() {
  const context = useContext(PostModerationResponsesContext);
  if (!context)
    throw new Error(
      'usePostModerationResponsesContext must be used inside a `PostModerationResponsesContextProvider`'
    );
  return context;
}
