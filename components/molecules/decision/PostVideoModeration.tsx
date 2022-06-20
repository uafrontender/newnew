/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
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
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import { useAppSelector } from '../../../redux-store/store';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import VolumeOff from '../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';
import ThumbnailIcon from '../../../public/images/svg/icons/filled/AddImage.svg';

import PostVideoResponseUpload from './PostVideoResponseUpload';
import ToggleVideoWidget from '../../atoms/moderation/ToggleVideoWidget';
import {
  getVideoUploadUrl,
  removeUploadedFile,
  startVideoProcessing,
  stopVideoProcessing,
} from '../../../api/endpoints/upload';
import { SocketContext } from '../../../contexts/socketContext';
import {
  TThumbnailParameters,
  TVideoProcessingData,
} from '../../../redux-store/slices/creationStateSlice';
import PostVideoResponsePreviewModal from './PostVideoResponsePreviewModal';
import {
  setPostThumbnail,
  uploadPostResponse,
} from '../../../api/endpoints/post';
import isSafari from '../../../utils/isSafari';
import { usePostModalState } from '../../../contexts/postModalContext';
import waitResourceIsAvailable from '../../../utils/checkResourceAvailable';
import isBrowser from '../../../utils/isBrowser';

const PostBitmovinPlayer = dynamic(() => import('./PostBitmovinPlayer'), {
  ssr: false,
});

const PostVideoThumbnailEdit = dynamic(
  () => import('./PostVideoThumbnailEdit'),
  {
    ssr: false,
  }
);

interface IPostVideoModeration {
  postId: string;
  postStatus: TPostStatusStringified;
  announcement: newnewapi.IVideoUrls;
  response?: newnewapi.IVideoUrls;
  thumbnails: any;
  isMuted: boolean;
  handleToggleMuted: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleUpdateResponseVideo: (newResponse: newnewapi.IVideoUrls) => void;
}

const PostVideoModeration: React.FunctionComponent<IPostVideoModeration> = ({
  postId,
  postStatus,
  announcement,
  response,
  thumbnails,
  isMuted,
  handleToggleMuted,
  handleUpdatePostStatus,
  handleUpdateResponseVideo,
}) => {
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const socketConnection = useContext(SocketContext);

  // Show controls on shorter screens
  const [soundBtnBottomOverriden, setSoundBtnBottomOverriden] =
    useState<number | undefined>(undefined);

  // Tabs
  const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
    response ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response'
      ? 'response'
      : 'announcement'
  );

  // Editing announcement video thumbnail
  const [isEditThumbnailModalOpen, setIsEditThumbnailModalOpen] =
    useState(false);

  const isSetThumbnailButtonIconOnly = useMemo(
    () =>
      response ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response',
    [response, postStatus]
  );

  const handleSubmitNewThumbnail = async (params: TThumbnailParameters) => {
    try {
      const payload = new newnewapi.SetPostThumbnailRequest({
        postUuid: postId,
        thumbnailParameters: {
          startTime: {
            seconds: params.startTime,
          },
          endTime: {
            seconds: params.endTime,
          },
        },
      });

      const res = await setPostThumbnail(payload);

      if (res.error) throw new Error('Request failed');

      setIsEditThumbnailModalOpen(false);
      toast.success(t('postVideoThumbnailEdit.toast.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('postVideoThumbnailEdit.toast.error'));
    }
  };

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
            toast.error('An error occured');
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          setResponseFileUploadError(true);
          toast.error('An error occured');
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
        toast.error('An error occured');
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

  // Adjust sound button if needed
  useEffect(() => {
    const handleScroll = () => {
      const rect =
        document.getElementById('sound-button')?.getBoundingClientRect() ||
        document.getElementById('toggle-video-widget')?.getBoundingClientRect();

      const videoRect =
        document.getElementById(`${postId}`)?.getBoundingClientRect() ||
        document.getElementById('video-wrapper')?.getBoundingClientRect();

      if (rect && videoRect) {
        const delta = window.innerHeight - videoRect.bottom;
        if (delta < 0) {
          setSoundBtnBottomOverriden(Math.abs(delta) + 24);
        }
      }
    };

    if (isBrowser() && !isMobileOrTablet) {
      const rect =
        document.getElementById('sound-button')?.getBoundingClientRect() ||
        document.getElementById('toggle-video-widget')?.getBoundingClientRect();

      if (rect) {
        const isInViewPort =
          rect.bottom <=
          (window.innerHeight || document.documentElement?.clientHeight);

        if (!isInViewPort) {
          const delta = window.innerHeight - rect.bottom;
          setSoundBtnBottomOverriden(Math.abs(delta) + 24);
        }
      }

      document
        ?.getElementById('post-modal-container')
        ?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setSoundBtnBottomOverriden(undefined);

      if (isBrowser() && !isMobileOrTablet) {
        document
          ?.getElementById('post-modal-container')
          ?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet, postId]);

  return (
    <>
      <SVideoWrapper id='video-wrapper'>
        {openedTab === 'announcement' ? (
          <>
            <PostBitmovinPlayer
              id={postId}
              resources={announcement}
              muted={isMuted}
              showPlayButton
            />
            {isSetThumbnailButtonIconOnly ? (
              <SSetThumbnailButtonIconOnly
                iconOnly
                view='transparent'
                onClick={() => setIsEditThumbnailModalOpen(true)}
                style={{
                  ...(soundBtnBottomOverriden
                    ? {
                        bottom: soundBtnBottomOverriden,
                      }
                    : {}),
                }}
              >
                <InlineSvg
                  svg={ThumbnailIcon}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                  fill='#FFFFFF'
                />
              </SSetThumbnailButtonIconOnly>
            ) : (
              <SSetThumbnailButton
                view='transparent'
                onClick={() => setIsEditThumbnailModalOpen(true)}
                style={{
                  ...(soundBtnBottomOverriden
                    ? {
                        bottom: soundBtnBottomOverriden,
                      }
                    : {}),
                }}
              >
                {t('postVideo.setThumbnail')}
              </SSetThumbnailButton>
            )}
            <SSoundButton
              id='sound-button'
              iconOnly
              view='transparent'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMuted();
                if (isSafari()) {
                  (
                    document?.getElementById(
                      `bitmovinplayer-video-${postId}`
                    ) as HTMLVideoElement
                  )?.play();
                }
              }}
              style={{
                ...(soundBtnBottomOverriden
                  ? {
                      bottom: soundBtnBottomOverriden,
                    }
                  : {}),
              }}
            >
              <InlineSvg
                svg={isMuted ? VolumeOff : VolumeOn}
                width={isMobileOrTablet ? '20px' : '24px'}
                height={isMobileOrTablet ? '20px' : '24px'}
                fill='#FFFFFF'
              />
            </SSoundButton>
          </>
        ) : response ? (
          <>
            <PostBitmovinPlayer
              id={postId}
              resources={response}
              muted={isMuted}
              showPlayButton
            />
            <SSoundButton
              id='sound-button'
              iconOnly
              view='transparent'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMuted();
                if (isSafari()) {
                  (
                    document?.getElementById(
                      `bitmovinplayer-video-${postId}`
                    ) as HTMLVideoElement
                  )?.play();
                }
              }}
              style={{
                ...(soundBtnBottomOverriden
                  ? {
                      bottom: soundBtnBottomOverriden,
                    }
                  : {}),
              }}
            >
              <InlineSvg
                svg={isMuted ? VolumeOff : VolumeOn}
                width={isMobileOrTablet ? '20px' : '24px'}
                height={isMobileOrTablet ? '20px' : '24px'}
                fill='#FFFFFF'
              />
            </SSoundButton>
          </>
        ) : (
          <PostVideoResponseUpload
            id='video'
            thumbnails={{}}
            postStatus={postStatus}
            value={videoProcessing?.targetUrls!!}
            videoProcessing={videoProcessing}
            etaUpload={responseFileUploadETA}
            errorUpload={responseFileUploadError}
            loadingUpload={responseFileUploadLoading}
            progressUpload={responseFileUploadProgress}
            etaProcessing={responseFileProcessingETA}
            errorProcessing={responseFileProcessingError}
            loadingProcessing={responseFileProcessingLoading}
            progressProcessing={responseFileProcessingProgress}
            onChange={handleItemChange}
            handleCancelVideoUpload={() => xhrRef.current?.abort()}
            handleResetVideoUploadAndProcessingState={() => {
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
            }}
            handleUploadVideoNotProcessed={handleUploadVideoNotProcessed}
          />
        )}
        {response ||
        postStatus === 'waiting_for_response' ||
        postStatus === 'processing_response' ? (
          <ToggleVideoWidget
            currentTab={openedTab}
            responseUploaded={response !== undefined}
            disabled={responseFileUploadLoading || responseFileUploadLoading}
            wrapperCSS={{
              ...(soundBtnBottomOverriden
                ? {
                    bottom: soundBtnBottomOverriden + 8,
                  }
                : {}),
            }}
            handleChangeTab={(newValue) => setOpenedTab(newValue)}
          />
        ) : null}
        {uploadedResponseVideoUrl &&
          !responseFileUploadLoading &&
          !responseFileProcessingLoading && (
            <PostVideoResponsePreviewModal
              value={videoProcessing.targetUrls!!}
              open={uploadedResponseVideoUrl !== ''}
              handleClose={() => handleVideoDelete()}
              handleConfirm={() => handleUploadVideoProcessed()}
            />
          )}
      </SVideoWrapper>
      {isMobile &&
      postStatus === 'waiting_for_response' &&
      !responseFileUploadLoading &&
      !responseFileProcessingLoading ? (
        <SUploadResponseButton
          view='primaryGrad'
          onClick={() => {
            document.getElementById('upload-response-btn')?.click();
          }}
        >
          {t('postVideo.floatingUploadResponseButton')}
        </SUploadResponseButton>
      ) : null}
      {/* Edit thumbnail */}
      <PostVideoThumbnailEdit
        open={isEditThumbnailModalOpen}
        value={announcement}
        thumbnails={thumbnails}
        handleClose={() => setIsEditThumbnailModalOpen(false)}
        handleSubmit={handleSubmitNewThumbnail}
      />
    </>
  );
};

PostVideoModeration.defaultProps = {
  response: undefined,
};

export default PostVideoModeration;

const SVideoWrapper = styled.div`
  grid-area: video;

  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  overflow: hidden;

  /* width: calc(100vw - 32px); */
  width: 100vw;
  height: calc(100vh - 72px);
  margin-left: -16px;

  video {
    display: block;
    width: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
    height: 506px;
    margin-left: initial;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    video {
      width: initial;
      height: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    width: 410px;
    height: 728px;
  }
`;

const SSoundButton = styled(Button)`
  position: absolute;
  right: 16px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.tablet} {
    width: 36px;
    height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const SSetThumbnailButtonIconOnly = styled(Button)`
  position: absolute;
  right: 64px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.tablet} {
    right: initial;
    left: 16px;
    width: 36px;
    height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 72px;
    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const SSetThumbnailButton = styled(Button)`
  position: absolute;
  right: 64px;
  bottom: 16px;

  padding: 8px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.laptop} {
    right: 72px;

    padding: 12px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const SUploadResponseButton = styled(Button)`
  position: fixed;
  bottom: 16px;

  width: calc(100% - 32px);
  height: 56px;

  z-index: 10;
`;
