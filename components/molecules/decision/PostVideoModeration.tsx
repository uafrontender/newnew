/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useContext, useEffect, useState } from 'react';
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

import PostVideoResponseUpload from './PostVideoResponseUpload';
import ToggleVideoWidget from '../../atoms/moderation/ToggleVideoWidget';
import { getVideoUploadUrl, removeUploadedFile, startVideoProcessing, stopVideoProcessing } from '../../../api/endpoints/upload';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { TVideoProcessingData } from '../../../redux-store/slices/creationStateSlice';
import PostVideoResponsePreviewModal from './PostVideoResponsePreviewModal';
import { uploadPostResponse } from '../../../api/endpoints/post';
import isSafari from '../../../utils/isSafari';

const PostBitmovinPlayer = dynamic(() => import('./PostBitmovinPlayer'), {
  ssr: false,
});

interface IPostVideoModeration {
  postId: string;
  postStatus: TPostStatusStringified;
  announcement: newnewapi.IVideoUrls;
  response?: newnewapi.IVideoUrls;
  isMuted: boolean;
  handleToggleMuted: () => void;
  handleUpdateResponseVideo: (newResponse: newnewapi.IVideoUrls) => void;
}

const PostVideoModeration: React.FunctionComponent<IPostVideoModeration> = ({
  postId,
  postStatus,
  announcement,
  response,
  isMuted,
  handleToggleMuted,
  handleUpdateResponseVideo,
}) => {
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const socketConnection = useContext(SocketContext);
  const {
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  // Tabs
  const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
    response || postStatus === 'waiting_for_response' ? 'response' : 'announcement'
  );

  // File upload
  const [uploadedResponseVideoUrl, setUploadedResponseVideoUrl] = useState('');

  const [videoProcessing, setVideoProcessing] = useState<TVideoProcessingData>({
    taskUuid: '',
    targetUrls: {},
  });
  const [responseFileUploadETA, setResponseFileUploadETA] = useState(0);
  const [responseFileUploadProgress, setResponseFileUploadProgress] = useState(0);
  const [responseFileUploadLoading, setResponseFileUploadLoading] = useState(false);
  const [responseFileUploadError, setResponseFileUploadError] = useState(false);

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

      const uploadResponse = await fetch(
        res.data.uploadUrl,
        {
          method: 'PUT',
          body: value,
          headers: {
            'Content-Type': value.type,
          },
        },
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setResponseFileUploadProgress(5);
      setResponseFileUploadETA(90);

      const payloadProcessing = new newnewapi.StartVideoProcessingRequest({
        publicUrl: res.data.publicUrl,
      });

      const resProcessing = await startVideoProcessing(payloadProcessing);

      if (!resProcessing.data || resProcessing.error) {
        throw new Error(resProcessing.error?.message ?? 'An error occurred');
      }

      addChannel(
        resProcessing.data.taskUuid,
        {
          processingProgress: {
            taskUuid: resProcessing.data.taskUuid,
          },
        },
      );

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
      setResponseFileUploadLoading(false)
      toast.error(error?.message);
    }
  }, [addChannel]);

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

      removeChannel(videoProcessing?.taskUuid as string);

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
  }, [removeChannel, uploadedResponseVideoUrl, videoProcessing?.taskUuid]);

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
        if (res.data.multipleChoice) responseObj = res.data.multipleChoice.response;
        if (res.data.crowdfunding) responseObj = res.data.crowdfunding.response;
        // @ts-ignore
        handleUpdateResponseVideo(responseObj!!);
        setUploadedResponseVideoUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    postId,
    uploadedResponseVideoUrl,
    handleUpdateResponseVideo,
  ]);

  const handlerSocketUpdated = useCallback((data: any) => {
    const arr = new Uint8Array(data);
    const decoded = newnewapi.VideoProcessingProgress.decode(arr);

    if (!decoded) return;

    if (decoded.taskUuid === videoProcessing?.taskUuid) {
      setResponseFileUploadETA(decoded.estimatedTimeLeft?.seconds as number);

      if (decoded.fractionCompleted > responseFileUploadProgress) {
        setResponseFileUploadProgress(decoded.fractionCompleted);
      }

      if (decoded.fractionCompleted === 100) {
        removeChannel(videoProcessing?.taskUuid);
        setResponseFileUploadLoading(false);
      }
    }
  }, [videoProcessing, responseFileUploadProgress, removeChannel]);

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
            <SSoundButton
              iconOnly
              view="transparent"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMuted();
                if (isSafari()) {
                  (document?.getElementById(`bitmovinplayer-video-${postId}`) as HTMLVideoElement)?.play();
                }
              }}
            >
              <InlineSvg
                svg={isMuted ? VolumeOff : VolumeOn}
                width={isMobileOrTablet ? '20px' : '24px'}
                height={isMobileOrTablet ? '20px' : '24px'}
                fill="#FFFFFF"
              />
            </SSoundButton>
          </>
        ) : (
          response ? (
            <>
              <PostBitmovinPlayer
                id={postId}
                resources={response}
                muted={isMuted}
              />
              <SSoundButton
                iconOnly
                view="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMuted();
                  if (isSafari()) {
                    (document?.getElementById(`bitmovinplayer-video-${postId}`) as HTMLVideoElement)?.play();
                  }
                }}
              >
                <InlineSvg
                  svg={isMuted ? VolumeOff : VolumeOn}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                  fill="#FFFFFF"
                />
              </SSoundButton>
            </>
          ) : (
            <PostVideoResponseUpload
              id="video"
              eta={responseFileUploadETA}
              error={responseFileUploadError}
              loading={responseFileUploadLoading}
              progress={responseFileUploadProgress}
              value={videoProcessing?.targetUrls!!}
              onChange={handleItemChange}
              thumbnails={{}}
            />
          )
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
      {isMobile && postStatus === 'waiting_for_response' && !responseFileUploadLoading ? (
        <SUploadResponseButton
          view="primaryGrad"
          onClick={() => {
            document.getElementById('upload-response-btn')?.click();
          }}
        >
          { t('AcPostModeration.floatingUploadResponseBtn') }
        </SUploadResponseButton>
      ) : null}
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
    right: initial;
    left: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: initial;
    left: 24px;
    bottom: 24px;

    padding: 12px;
    width: 48px;
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
