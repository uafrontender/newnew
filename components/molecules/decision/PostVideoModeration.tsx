/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useMemo, useState } from 'react';
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
import { getCoverImageUploadUrl } from '../../../api/endpoints/upload';
import {
  TThumbnailParameters,
  TVideoProcessingData,
} from '../../../redux-store/slices/creationStateSlice';
import {
  setPostCoverImage,
  setPostThumbnail,
} from '../../../api/endpoints/post';
import isSafari from '../../../utils/isSafari';
import isBrowser from '../../../utils/isBrowser';
import urltoFile from '../../../utils/urlToFile';

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
  openedTab: 'announcement' | 'response';
  videoProcessing: TVideoProcessingData;
  responseFileUploadETA: number;
  responseFileUploadError: boolean;
  responseFileUploadLoading: boolean;
  responseFileUploadProgress: number;
  responseFileProcessingETA: number;
  responseFileProcessingError: boolean;
  responseFileProcessingLoading: boolean;
  responseFileProcessingProgress: number;
  uploadedResponseVideoUrl: string;
  handleItemChange: (id: string, value: File) => Promise<void>;
  handleCancelVideoUpload: () => void | undefined;
  handleResetVideoUploadAndProcessingState: () => void;
  handleUploadVideoNotProcessed: () => Promise<void>;
  handleVideoDelete: () => Promise<void>;
  handleUploadVideoProcessed: () => Promise<void>;
  handleChangeTab: (nevValue: 'announcement' | 'response') => void;
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
  openedTab,
  videoProcessing,
  uploadedResponseVideoUrl,
  responseFileUploadETA,
  responseFileUploadError,
  responseFileUploadLoading,
  responseFileUploadProgress,
  responseFileProcessingETA,
  responseFileProcessingError,
  responseFileProcessingLoading,
  responseFileProcessingProgress,
  handleItemChange,
  handleCancelVideoUpload,
  handleResetVideoUploadAndProcessingState,
  handleUploadVideoNotProcessed,
  handleVideoDelete,
  handleUploadVideoProcessed,
  handleChangeTab,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // Show controls on shorter screens
  const [soundBtnBottomOverriden, setSoundBtnBottomOverriden] =
    useState<number | undefined>(undefined);

  // Editing announcement video thumbnail
  const [isEditThumbnailModalOpen, setIsEditThumbnailModalOpen] =
    useState(false);

  const [coverImageInEdit, setCoverImageInEdit] = useState(
    announcement.coverImageUrl ?? undefined
  );

  const handleSetCustomCoverImageUrl = (objUrl: string) =>
    setCoverImageInEdit(objUrl);

  const handleUnsetCustomCoverImageUrl = () => setCoverImageInEdit(undefined);

  const isSetThumbnailButtonIconOnly = useMemo(
    () =>
      response ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response',
    [response, postStatus]
  );

  const handleSubmitNewThumbnail = async (params: TThumbnailParameters) => {
    try {
      const shouldUpdateCoverImage =
        !!coverImageInEdit && coverImageInEdit !== announcement.coverImageUrl;
      const shouldDeleteCoverImage =
        !coverImageInEdit && !!announcement.coverImageUrl;

      console.log(shouldUpdateCoverImage);
      console.log(shouldDeleteCoverImage);

      if (shouldUpdateCoverImage) {
        const coverImageFile = await urltoFile(
          coverImageInEdit,
          'coverImage',
          'image/jpeg'
        );

        const imageUrlPayload = new newnewapi.GetCoverImageUploadUrlRequest({
          postUuid: postId,
        });

        console.log(imageUrlPayload);

        const res = await getCoverImageUploadUrl(imageUrlPayload);

        console.log(res);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'An error occured');

        const uploadResponse = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: coverImageFile,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const updateCoverImagePayload = new newnewapi.SetPostCoverImageRequest({
          postUuid: postId,
          action: newnewapi.SetPostCoverImageRequest.Action.COVER_UPLOADED,
        });

        const updateCoverImageRes = await setPostCoverImage(
          updateCoverImagePayload
        );

        if (updateCoverImageRes.error) {
          throw new Error('Could not update cover image');
        }
      } else if (shouldDeleteCoverImage) {
        const updateCoverImagePayload = new newnewapi.SetPostCoverImageRequest({
          postUuid: postId,
          action: newnewapi.SetPostCoverImageRequest.Action.DELETE_COVER,
        });

        console.log(updateCoverImagePayload);

        const updateCoverImageRes = await setPostCoverImage(
          updateCoverImagePayload
        );

        if (updateCoverImageRes.error) {
          throw new Error('Could not delete cover image');
        }
      }

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
        ) : uploadedResponseVideoUrl &&
          videoProcessing.targetUrls &&
          !responseFileUploadLoading &&
          !responseFileProcessingLoading ? (
          <>
            <PostBitmovinPlayer
              id={postId}
              resources={videoProcessing.targetUrls}
              muted={isMuted}
              showPlayButton
            />
            <SReuploadButton onClick={() => handleVideoDelete()}>
              {t('postVideo.reuploadButton')}
            </SReuploadButton>
            <SSoundButton
              id='sound-button'
              iconOnly
              view='transparent'
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMuted();
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
            handleCancelVideoUpload={handleCancelVideoUpload}
            handleResetVideoUploadAndProcessingState={
              handleResetVideoUploadAndProcessingState
            }
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
            handleChangeTab={handleChangeTab}
          />
        ) : null}
      </SVideoWrapper>
      {/* Edit thumbnail */}
      <PostVideoThumbnailEdit
        open={isEditThumbnailModalOpen}
        value={announcement}
        thumbnails={thumbnails}
        handleClose={() => setIsEditThumbnailModalOpen(false)}
        handleSubmit={handleSubmitNewThumbnail}
        customCoverImageUrl={coverImageInEdit}
        handleSetCustomCoverImageUrl={handleSetCustomCoverImageUrl}
        handleUnsetCustomCoverImageUrl={handleUnsetCustomCoverImageUrl}
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

const SReuploadButton = styled.button`
  position: absolute;
  left: 16px;
  top: 32px;

  color: ${({ theme }) => theme.colors.dark};
  background: #ffffff;

  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  padding: 4px 12px;
  border-radius: 12px;
  border: transparent;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }

  ${({ theme }) => theme.media.tablet} {
    left: initial;
    right: 16px;
    top: 16px;
  }
`;
