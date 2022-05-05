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
  handleUpdateResponseVideo,
}) => {
  const { t } = useTranslation('decision');
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

  // Tabs
  const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
    response || postStatus === 'waiting_for_response'
      ? 'response'
      : 'announcement'
  );

  // Editing announcement video thumbnail
  const [isEditThumbnailModalOpen, setIsEditThumbnailModalOpen] =
    useState(false);

  const isSetThumbnailButtonIconOnly = useMemo(
    () => response || postStatus === 'waiting_for_response',
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
      toast.success(t('PostVideoThumbnailEdit.toast.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('PostVideoThumbnailEdit.toast.error'));
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
          console.log('Aborted');
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

      // console.log('return for now');
      // return;

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
      setResponseFileUploadProgress(10);
      setResponseFileUploadETA(80);
      setUploadedResponseVideoUrl(res.data.publicUrl ?? '');
    } catch (error: any) {
      setResponseFileUploadError(true);
      setResponseFileUploadLoading(false);
      toast.error(error?.message);
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
      setResponseFileUploadError(false);
      setVideoProcessing({
        taskUuid: '',
        targetUrls: {},
      });
      setResponseFileUploadLoading(false);
      setResponseFileUploadProgress(0);
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

  const handleUploadVideo = useCallback(async () => {
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
        handleUpdateResponseVideo(responseObj!!);
        setUploadedResponseVideoUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  }, [postId, uploadedResponseVideoUrl, handleUpdateResponseVideo]);

  const handlerSocketUpdated = useCallback(
    (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) return;

      if (decoded.taskUuid === videoProcessing?.taskUuid) {
        setResponseFileProcessingETA(
          decoded.estimatedTimeLeft?.seconds as number
        );

        if (decoded.fractionCompleted > responseFileUploadProgress) {
          setResponseFileProcessingProgress(decoded.fractionCompleted);
        }

        if (decoded.fractionCompleted === 100) {
          setResponseFileProcessingLoading(false);
        }
      }
    },
    [videoProcessing, responseFileUploadProgress]
  );

  useEffect(() => {
    if (socketConnection) {
      socketConnection.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, handlerSocketUpdated]);

  return (
    <>
      <SVideoWrapper>
        {openedTab === 'announcement' ? (
          <>
            <PostBitmovinPlayer
              id={postId}
              resources={announcement}
              muted={isMuted}
            />
            {isSetThumbnailButtonIconOnly ? (
              <SSetThumbnailButtonIconOnly
                iconOnly
                view='transparent'
                onClick={() => setIsEditThumbnailModalOpen(true)}
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
              >
                {t('PostVideo.setThumbnail')}
              </SSetThumbnailButton>
            )}
            <SSoundButton
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
            />
            <SSoundButton
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
          />
        )}
        {response || postStatus === 'waiting_for_response' ? (
          <ToggleVideoWidget
            currentTab={openedTab}
            responseUploaded={response !== undefined}
            handleChangeTab={(newValue) => setOpenedTab(newValue)}
          />
        ) : null}
        {uploadedResponseVideoUrl && !responseFileUploadLoading && (
          <PostVideoResponsePreviewModal
            value={videoProcessing.targetUrls!!}
            open={uploadedResponseVideoUrl !== ''}
            handleClose={() => handleVideoDelete()}
            handleConfirm={() => handleUploadVideo()}
          />
        )}
      </SVideoWrapper>
      {isMobile &&
      postStatus === 'waiting_for_response' &&
      !responseFileUploadLoading ? (
        <SUploadResponseButton
          view='primaryGrad'
          onClick={() => {
            document.getElementById('upload-response-btn')?.click();
          }}
        >
          {t('PostVideo.floatingUploadResponseBtn')}
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
