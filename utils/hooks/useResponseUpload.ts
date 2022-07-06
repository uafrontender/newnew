import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';

import { SocketContext } from '../../contexts/socketContext';
import { usePostModalState } from '../../contexts/postModalContext';

import { uploadPostResponse } from '../../api/endpoints/post';
import { getVideoUploadUrl, removeUploadedFile, startVideoProcessing, stopVideoProcessing } from '../../api/endpoints/upload';
import waitResourceIsAvailable from '../checkResourceAvailable';

import { TPostStatusStringified } from '../switchPostStatus';
import { TVideoProcessingData } from '../../redux-store/slices/creationStateSlice';

interface IUseResponseUpload {
  postId: string;
  postStatus: TPostStatusStringified;
  openedTab: 'announcement' | 'response';
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleUpdateResponseVideo: (newResponse: newnewapi.IVideoUrls) => void;
}

const useResponseUpload = ({
  postId,
  postStatus,
  openedTab,
  handleUpdatePostStatus,
  handleUpdateResponseVideo,
}: IUseResponseUpload) => {
  const { t } = useTranslation('modal-Post');
  const socketConnection = useContext(SocketContext);

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

  const [responseUploading, setResponseUploading] = useState(false);

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
          // console.log('Aborted');
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

  const handleItemChange = async (id: string, value: File) => {
    if (value) {
      await handleVideoUpload(value);
    } else {
      await handleVideoDelete();
    }
  };

  const handleUploadVideoProcessed = useCallback(async () => {
    setResponseUploading(true);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResponseUploading(false);
    }
  }, [
    postId,
    uploadedResponseVideoUrl,
    handleUpdateResponseVideo,
    handleUpdatePostStatus,
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
    }
  }, [postId, uploadedResponseVideoUrl, t, handleUpdatePostStatus]);

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
            toast.error('An error occurred');
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          setResponseFileUploadError(true);
          toast.error('An error occurred');
        }
      }
    },
    [
      postId,
      videoProcessing?.taskUuid,
      videoProcessing.targetUrls?.hlsStreamUrl,
      responseFileProcessingProgress,
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
  }, [])

  const handleCancelVideoUpload = () => xhrRef.current?.abort()

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
        toast.error('An error occurred');
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

  return {
    videoProcessing,
    uploadedResponseVideoUrl,
    responseUploading,
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
    handleResetVideoUploadAndProcessingState,
    handleCancelVideoUpload,
    handleVideoDelete,
  }
}

export default useResponseUpload;
