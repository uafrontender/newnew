import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { newnewapi } from 'newnew-api';

import { SocketContext } from './socketContext';
import {
  getCoverImageUploadUrl,
  getVideoUploadUrl,
  removeUploadedFile,
  startVideoProcessing,
  stopVideoProcessing,
} from '../api/endpoints/upload';
import {
  deleteAdditionalPostResponse,
  setPostCoverImage,
  uploadAdditionalPostResponse,
  uploadPostResponse,
} from '../api/endpoints/post';
import waitResourceIsAvailable from '../utils/checkResourceAvailable';
import { usePostInnerState } from './postInnerContext';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../utils/hooks/useErrorToasts';
import urltoFile from '../utils/urlToFile';
import { TVideoProcessingData } from './postCreationContext';

interface IPostModerationResponsesContext {
  // Tabs
  openedTab: 'announcement' | 'response';
  handleChangeTab: (nevValue: 'announcement' | 'response') => void;
  // Core response
  coreResponse: newnewapi.IVideoUrls | undefined;
  coreResponseUploading: boolean;
  handleUploadVideoProcessed: () => Promise<void>;
  // Additional responses
  currentAdditionalResponseStep: 'regular' | 'editing';
  handleSetCurrentAdditionalResponseStep: (step: 'regular' | 'editing') => void;
  additionalResponses: newnewapi.IVideoUrls[];
  additionalResponseUploading: boolean;
  readyToUploadAdditionalResponse: boolean;
  handleUploadAdditionalVideoProcessed: () => Promise<void>;
  isDeletingAdditionalResponse: boolean;
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
  handleResponseItemChange: (
    id: string,
    value: File | null | undefined,
    type: 'initial' | 'additional'
  ) => Promise<void>;
  handleResetVideoUploadAndProcessingState: () => void;
  handleCancelVideoUpload: () => void | undefined;
  handleVideoDelete: () => Promise<void>;
  handleSetUploadingAdditionalResponse: (newValue: boolean) => void;
  handleSetReadyToUploadAdditionalResponse: (newValue: boolean) => void;
  customCoverImageUrlResponse: string | undefined;
  handleUpdateCustomCoverImageUrl: (newValue: string | undefined) => void;
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
    // Additional responses
    currentAdditionalResponseStep: 'regular',
    handleSetCurrentAdditionalResponseStep: (step: 'regular' | 'editing') => {},
    additionalResponses: [],
    additionalResponseUploading: false,
    readyToUploadAdditionalResponse: false,
    handleUploadAdditionalVideoProcessed: (() => {}) as () => Promise<void>,
    isDeletingAdditionalResponse: false,
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
    handleResponseItemChange: ((
      id: string,
      value: File | null | undefined,
      type: 'initial' | 'additional'
    ) => {}) as (id: string, value: File | null | undefined) => Promise<void>,
    handleResetVideoUploadAndProcessingState: () => {},
    handleCancelVideoUpload: () => {},
    handleVideoDelete: (() => {}) as () => Promise<void>,
    handleSetUploadingAdditionalResponse: () => {},
    handleSetReadyToUploadAdditionalResponse: () => {},
    customCoverImageUrlResponse: undefined,
    handleUpdateCustomCoverImageUrl: (() => {}) as () => Promise<void>,
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
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const { socketConnection } = useContext(SocketContext);

  const { postParsed, refetchPost, handleSetIsConfirmToClosePost } =
    usePostInnerState();
  const postUuid = useMemo(() => postParsed?.postUuid, [postParsed?.postUuid]);

  // Core response
  const [coreResponse, setCoreResponse] = useState<
    newnewapi.IVideoUrls | undefined
  >(coreResponseInitial);

  const handleUpdateResponseVideo = useCallback(
    (newValue: newnewapi.IVideoUrls) => setCoreResponse(newValue),
    []
  );

  // Cover image for response
  const [customCoverImageUrlResponse, setCustomCoverImageUrlResponse] =
    useState<string | undefined>(undefined);

  const handleUpdateCustomCoverImageUrl = useCallback(
    (newValue: string | undefined) => setCustomCoverImageUrlResponse(newValue),
    []
  );

  // Additional responses
  const [currentAdditionalResponseStep, setCurrentAdditionalResponseStep] =
    useState<'regular' | 'editing'>('regular');

  const handleSetCurrentAdditionalResponseStep = useCallback(
    (step: 'regular' | 'editing') => {
      setCurrentAdditionalResponseStep(step);
    },
    []
  );

  const [additionalResponses, setAdditionalResponses] = useState<
    newnewapi.IVideoUrls[]
  >(additionalResponsesInitial ?? []);

  const [additionalResponseUploading, setUploadingAdditionalResponse] =
    useState(false);

  const [readyToUploadAdditionalResponse, setReadyToUploadAdditionalResponse] =
    useState(false);

  const [isDeletingAdditionalResponse, setIsDeletingAdditionalResponse] =
    useState(false);

  const handleAddAdditionalResponse = useCallback(
    (newVideo: newnewapi.IVideoUrls) => {
      setAdditionalResponses((curr) => [...curr, newVideo]);
    },
    [setAdditionalResponses]
  );

  const handleDeleteAdditionalResponse = useCallback(
    async (videoUuid: string) => {
      setIsDeletingAdditionalResponse(true);
      try {
        const req = new newnewapi.DeleteAdditionalPostResponseRequest({
          videoUuid,
        });

        const res = await deleteAdditionalPostResponse(req);

        if (res.error) throw new Error('Failed to delete video');

        setAdditionalResponses((curr) => {
          const workingArray = curr.filter(
            (video) => video?.uuid !== videoUuid
          );
          return workingArray;
        });
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      } finally {
        setIsDeletingAdditionalResponse(false);
      }
    },
    [showErrorToastPredefined]
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

  const cannotLeavePage = useMemo(() => {
    if (
      openedTab === 'response' &&
      (responseFileUploadLoading ||
        responseFileProcessingLoading ||
        responseFileProcessingProgress === 100)
    ) {
      return true;
    }
    return false;
  }, [
    openedTab,
    responseFileProcessingLoading,
    responseFileProcessingProgress,
    responseFileUploadLoading,
  ]);

  const handleResponseVideoUpload = useCallback(
    async (value: File, type: 'initial' | 'additional') => {
      try {
        setResponseFileUploadETA(100);
        setResponseFileUploadProgress(1);
        setResponseFileUploadLoading(true);
        setResponseFileUploadError(false);

        const payload = new newnewapi.GetVideoUploadUrlRequest({
          filename: value.name,
        });

        const res = await getVideoUploadUrl(payload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'An error occurred');
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
          videoUsageIntent:
            type === 'initial'
              ? newnewapi.StartVideoProcessingRequest.VideoUsageIntent.RESPONSE
              : newnewapi.StartVideoProcessingRequest.VideoUsageIntent
                  .ADDITIONAL_RESPONSE,
        });

        const resProcessing = await startVideoProcessing(payloadProcessing);

        if (!resProcessing?.data || resProcessing.error) {
          throw new Error(resProcessing?.error?.message ?? 'An error occurred');
        }

        setUploadedResponseVideoUrl(res.data.publicUrl ?? '');
        setVideoProcessing({
          taskUuid: resProcessing.data.taskUuid,
          targetUrls: {
            thumbnailUrl: resProcessing?.data?.targetUrls?.thumbnailUrl,
            hlsStreamUrl: resProcessing?.data?.targetUrls?.hlsStreamUrl,
            dashStreamUrl: resProcessing?.data?.targetUrls?.dashStreamUrl,
            originalVideoUrl: resProcessing?.data?.targetUrls?.originalVideoUrl,
            thumbnailImageUrl:
              resProcessing?.data?.targetUrls?.thumbnailImageUrl,
          },
        });

        if (
          resProcessing.data.videoUploadError ===
          newnewapi.VideoUploadError.VIDEO_TOO_SHORT
        ) {
          throw new Error('VideoTooShort');
        }

        if (
          resProcessing.data.videoUploadError ===
          newnewapi.VideoUploadError.VIDEO_TOO_LONG
        ) {
          throw new Error('VideoTooLong');
        }

        if (
          resProcessing.data.videoUploadError ===
          newnewapi.VideoUploadError.VIDEO_QUOTA_REACHED
        ) {
          throw new Error('Processing limit reached');
        }

        if (
          resProcessing.data.videoUploadError ===
          newnewapi.VideoUploadError.VIDEO_FORMAT_ERROR
        ) {
          throw new Error('VideoFormatError');
        }

        if (resProcessing.data.videoUploadError) {
          throw new Error('An error occurred');
        }

        setResponseFileUploadLoading(false);

        setResponseFileProcessingProgress(10);
        setResponseFileProcessingETA(80);
        setResponseFileProcessingLoading(true);
        setResponseFileProcessingError(false);
        xhrRef.current = undefined;
      } catch (error: any) {
        console.log(error);
        console.log(error.message);
        // TODO: Change this overcomplicated approach
        if (error.message === 'Upload failed') {
          setResponseFileUploadError(true);
          showErrorToastCustom(error?.message);
        } else if (error.message === 'VideoTooShort') {
          setResponseFileUploadError(true);
          if (type === 'initial') {
            showErrorToastPredefined(
              ErrorToastPredefinedMessage.InitialResponseTooShort
            );
          } else {
            showErrorToastPredefined(
              ErrorToastPredefinedMessage.AdditionalResponseTooShort
            );
          }
        } else if (error.message === 'VideoTooLong') {
          setResponseFileUploadError(true);
          if (type === 'initial') {
            showErrorToastPredefined(
              ErrorToastPredefinedMessage.InitialResponseTooLong
            );
          } else {
            showErrorToastPredefined(
              ErrorToastPredefinedMessage.AdditionalResponseTooLong
            );
          }
        } else if (error.message === 'Processing limit reached') {
          setResponseFileUploadError(true);
          showErrorToastPredefined(
            ErrorToastPredefinedMessage.ProcessingLimitReachedError
          );
        } else if (error.message === 'VideoFormatError') {
          setResponseFileUploadError(true);
          showErrorToastPredefined(
            ErrorToastPredefinedMessage.VideoFormatError
          );
        } else {
          console.log('Upload aborted');
        }
        xhrRef.current = undefined;
        setResponseFileUploadLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleVideoDelete = useCallback(async () => {
    try {
      if (uploadedResponseVideoUrl) {
        const payload = new newnewapi.RemoveUploadedFileRequest({
          publicUrl: uploadedResponseVideoUrl,
        });

        const res = await removeUploadedFile(payload);

        if (res?.error) {
          throw new Error(res.error?.message ?? 'An error occurred');
        }
      }

      if (videoProcessing?.taskUuid) {
        const payloadProcessing = new newnewapi.StopVideoProcessingRequest({
          taskUuid: videoProcessing?.taskUuid,
        });

        const resProcessing = await stopVideoProcessing(payloadProcessing);

        if (!resProcessing?.data || resProcessing.error) {
          throw new Error(resProcessing?.error?.message ?? 'An error occurred');
        }
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
      showErrorToastCustom(error?.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedResponseVideoUrl, videoProcessing?.taskUuid]);

  const handleResponseItemChange = useCallback(
    async (
      id: string,
      value: File | null | undefined,
      type: 'initial' | 'additional'
    ) => {
      if (value) {
        await handleResponseVideoUpload(value, type);
      } else {
        await handleVideoDelete();
      }
    },
    [handleVideoDelete, handleResponseVideoUpload]
  );

  const handleUploadCustomCoverImage = useCallback(async () => {
    if (!customCoverImageUrlResponse) return false;
    try {
      const coverImageFile = await urltoFile(
        customCoverImageUrlResponse,
        'coverImage',
        'image/jpeg'
      );

      const imageUrlPayload = new newnewapi.GetCoverImageUploadUrlRequest({
        postUuid,
        videoTargetType: newnewapi.VideoTargetType.RESPONSE,
      });

      const getCoverImageUploadUrlResponse = await getCoverImageUploadUrl(
        imageUrlPayload
      );

      if (
        !getCoverImageUploadUrlResponse?.data ||
        getCoverImageUploadUrlResponse.error
      ) {
        throw new Error(
          getCoverImageUploadUrlResponse?.error?.message ||
            'Could not get cover image upload URL'
        );
      }

      const uploadResponse = await fetch(
        getCoverImageUploadUrlResponse.data.uploadUrl,
        {
          method: 'PUT',
          body: coverImageFile,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );

      if (!uploadResponse?.ok) {
        throw new Error('Could not upload cover image to S3');
      }

      const updateCoverImagePayload = new newnewapi.SetPostCoverImageRequest({
        postUuid,
        videoTargetType: newnewapi.VideoTargetType.RESPONSE,
        action: newnewapi.SetPostCoverImageRequest.Action.COVER_UPLOADED,
      });

      const updateCoverImageRes = await setPostCoverImage(
        updateCoverImagePayload
      );

      if (!updateCoverImageRes || updateCoverImageRes.error) {
        throw new Error(
          updateCoverImageRes?.error?.message || 'Could not set cover image'
        );
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [customCoverImageUrlResponse, postUuid]);

  const handleUploadVideoProcessed = useCallback(async () => {
    setCoreResponseUploading(true);
    try {
      const payload = new newnewapi.UploadPostResponseRequest({
        postUuid,
        responseVideoUrl: uploadedResponseVideoUrl,
      });

      const res = await uploadPostResponse(payload);

      if (res.data) {
        // If there's a cover image to be uploaded, try to do it
        if (customCoverImageUrlResponse) {
          await handleUploadCustomCoverImage();
        }

        let responseObj;
        if (res.data.auction) {
          responseObj = res.data.auction.response;
        }

        if (res.data.multipleChoice) {
          responseObj = res.data.multipleChoice.response;
        }

        if (res.data.crowdfunding) {
          responseObj = res.data.crowdfunding.response;
        }

        if (responseObj) {
          handleUpdateResponseVideo(responseObj);
        }

        await refetchPost();
        setUploadedResponseVideoUrl('');
        setResponseUploadSuccess(true);

        setResponseFileUploadError(false);
        setResponseFileUploadLoading(false);
        setResponseFileUploadProgress(0);
        setResponseFileProcessingError(false);
        setResponseFileProcessingLoading(false);
        setResponseFileProcessingProgress(0);
      }
    } catch (err: any) {
      if (err.message === 'Processing limit reached') {
        showErrorToastPredefined(
          ErrorToastPredefinedMessage.ProcessingLimitReachedError
        );
      } else {
        console.error(err);
        showErrorToastPredefined(undefined);
      }
    } finally {
      setCoreResponseUploading(false);
    }
  }, [
    postUuid,
    uploadedResponseVideoUrl,
    customCoverImageUrlResponse,
    handleUpdateResponseVideo,
    refetchPost,
    handleUploadCustomCoverImage,
    showErrorToastPredefined,
  ]);

  const handleUploadAdditionalVideoProcessed = useCallback(async () => {
    setUploadingAdditionalResponse(true);
    try {
      const payload = new newnewapi.UploadAdditionalPostResponseRequest({
        postUuid,
        additionalResponseVideoUrl: uploadedResponseVideoUrl,
      });

      const res = await uploadAdditionalPostResponse(payload);

      if (!res.error) {
        // const updatedData = await refetchPost();

        const updatedData = res;
        let additionalResponsesFromBe: newnewapi.IVideoUrls[] = [];

        if (
          updatedData?.data?.auction &&
          updatedData?.data?.auction.additionalResponses &&
          updatedData?.data?.auction.additionalResponses.length
        ) {
          additionalResponsesFromBe =
            updatedData?.data?.auction?.additionalResponses;
        }
        if (
          updatedData?.data?.multipleChoice &&
          updatedData?.data?.multipleChoice.additionalResponses &&
          updatedData?.data?.multipleChoice.additionalResponses.length
        ) {
          additionalResponsesFromBe =
            updatedData?.data?.multipleChoice?.additionalResponses;
        }

        const videoUrlsToAdd =
          additionalResponsesFromBe[additionalResponsesFromBe.length - 1];

        handleAddAdditionalResponse(videoUrlsToAdd);
        setUploadedResponseVideoUrl('');

        setResponseFileUploadError(false);
        setResponseFileUploadLoading(false);
        setResponseFileUploadProgress(0);
        setResponseFileProcessingError(false);
        setResponseFileProcessingLoading(false);
        setResponseFileProcessingProgress(0);
        setVideoProcessing({
          taskUuid: '',
          targetUrls: {},
        });

        setCurrentAdditionalResponseStep('regular');
      } else {
        throw new Error(res.error.message ?? 'An error occurred');
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    } finally {
      setUploadingAdditionalResponse(false);
    }
  }, [
    handleAddAdditionalResponse,
    postUuid,
    showErrorToastPredefined,
    uploadedResponseVideoUrl,
  ]);

  const handlerSocketUpdated = useCallback(
    async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) {
        return;
      }

      if (
        decoded.taskUuid === videoProcessing?.taskUuid ||
        decoded.postUuid === postUuid
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
            showErrorToastPredefined(undefined);
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          setResponseFileUploadError(true);
          showErrorToastPredefined(undefined);
        }
      }
    },
    [
      videoProcessing?.taskUuid,
      videoProcessing.targetUrls?.hlsStreamUrl,
      postUuid,
      responseFileProcessingProgress,
      showErrorToastPredefined,
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
        setResponseFileProcessingProgress(100);
      } else {
        setResponseFileUploadError(true);
        showErrorToastPredefined(undefined);
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
      currentAdditionalResponseStep,
      handleSetCurrentAdditionalResponseStep,
      additionalResponses,
      additionalResponseUploading,
      readyToUploadAdditionalResponse,
      isDeletingAdditionalResponse,
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
      handleResponseItemChange,
      handleUploadVideoProcessed,
      handleUploadAdditionalVideoProcessed,
      handleResetVideoUploadAndProcessingState,
      handleCancelVideoUpload,
      handleVideoDelete,
      handleSetUploadingAdditionalResponse,
      handleSetReadyToUploadAdditionalResponse,
      customCoverImageUrlResponse,
      handleUpdateCustomCoverImageUrl,
    }),
    [
      openedTab,
      handleChangeTab,
      coreResponse,
      coreResponseUploading,
      currentAdditionalResponseStep,
      handleSetCurrentAdditionalResponseStep,
      additionalResponses,
      additionalResponseUploading,
      readyToUploadAdditionalResponse,
      isDeletingAdditionalResponse,
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
      handleResponseItemChange,
      handleUploadVideoProcessed,
      handleUploadAdditionalVideoProcessed,
      handleResetVideoUploadAndProcessingState,
      handleVideoDelete,
      handleSetUploadingAdditionalResponse,
      handleSetReadyToUploadAdditionalResponse,
      customCoverImageUrlResponse,
      handleUpdateCustomCoverImageUrl,
    ]
  );

  useEffect(() => {
    if (additionalResponsesInitial) {
      setAdditionalResponses(() => additionalResponsesInitial);
    }
  }, [additionalResponsesInitial]);

  useEffect(() => {
    setCoreResponse(() => coreResponseInitial);
  }, [coreResponseInitial]);

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
  if (!context) {
    throw new Error(
      'usePostModerationResponsesContext must be used inside a `PostModerationResponsesContextProvider`'
    );
  }

  return context;
}
