/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import isBrowser from '../../../../utils/isBrowser';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import SlidingToggleVideoWidget from '../../../atoms/moderation/SlidingToggleVideoWidget';
import PostVideoResponseUploadedTab from './PostVideoResponseUploadedTab';
import PostVideoAnnouncementTab from './PostVideoAnnouncementTab';
import PostVideoResponseUpload from './PostVideoResponseUpload';
import PostVideoCoverImageEdit from './PostVideoCoverImageEdit';
import { useAppState } from '../../../../contexts/appStateContext';
import SetThumbnailButtonIconOnly from '../../../atoms/decision/SetThumbnailButtonIconOnly';
import PostVideoCoverImageEditResponse from './PostVideoCoverImageEditResponse';

const PostVideojsPlayer = dynamic(() => import('../common/PostVideojsPlayer'), {
  ssr: false,
});

interface IPostVideoModeration {
  postUuid: string;
  thumbnails: any;
  announcement: newnewapi.IVideoUrls;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideoModeration: React.FunctionComponent<IPostVideoModeration> = ({
  postUuid,
  announcement,
  thumbnails,
  isMuted,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const { postStatus, handleUpdatePostCoverImage } = usePostInnerState();
  const {
    coreResponse,
    additionalResponseUploading,
    openedTab,
    handleVideoDelete,
    readyToUploadAdditionalResponse,
    responseFileUploadLoading,
    uploadedResponseVideoUrl,
    videoProcessing,
    responseFileProcessingLoading,
    responseFileUploadError,
    customCoverImageUrlResponse,
    handleUpdateCustomCoverImageUrl,
  } = usePostModerationResponsesContext();

  const currentCoverUrl = useMemo(() => {
    if (openedTab === 'announcement') {
      return announcement?.coverImageUrl ?? undefined;
    }
    return coreResponse?.coverImageUrl ?? undefined;
  }, [announcement?.coverImageUrl, coreResponse?.coverImageUrl, openedTab]);

  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);

  const handleOpenEditCoverImageMenu = useCallback(() => {
    Mixpanel.track('Edit Cover Image', { _stage: 'PostVideoModeration' });
    setCoverImageModalOpen(true);
  }, []);

  const handleCloseCoverImageEditClick = useCallback(() => {
    Mixpanel.track('Close Cover Image Edit Dialog', {
      _stage: 'PostVideoModeration',
    });
    setCoverImageModalOpen(false);
  }, []);

  const handleSubmitNewCoverImage = useCallback(
    (newCoverUrl: string | undefined) => {
      Mixpanel.track('Submit New Cover Image', {
        _stage: 'Post',
        _postUuid: postUuid,
        _component: 'PostVideoModeration',
      });
      handleUpdatePostCoverImage({
        postUuid,
        coverImageUrl: newCoverUrl,
        target: openedTab,
      });
      setCoverImageModalOpen(false);
    },
    [handleUpdatePostCoverImage, openedTab, postUuid]
  );

  // Fresh response upload cover image
  const [coverImageInitialResponseOpen, setCoverImageInitialResponseOpen] =
    useState(false);
  const handleOpenEditImageInitialResponse = useCallback(() => {
    Mixpanel.track('Edit Initial Response Cover Image', {
      _stage: 'PostVideoModeration',
    });
    setCoverImageInitialResponseOpen(true);
  }, []);

  const handleCloseEditCoverImageInitialResponse = useCallback(() => {
    Mixpanel.track('Close Initial Response Cover Image Edit Dialog', {
      _stage: 'PostVideoModeration',
    });
    setCoverImageInitialResponseOpen(false);
  }, []);

  // Show controls on shorter screens
  const [uiOffset, setUiOffset] = useState<number | undefined>(24);

  const isSetThumbnailButtonIconOnly = useMemo(
    () =>
      !!coreResponse ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response',
    [coreResponse, postStatus]
  );

  // Editing stories
  const [isEditingStories, setIsEditingStories] = useState(false);

  const handleToggleEditingStories = useCallback(
    () => setIsEditingStories((curr) => !curr),
    []
  );
  const handleUnsetEditingStories = useCallback(
    () => setIsEditingStories(false),
    []
  );

  // Adjust sound button if needed
  useEffect(() => {
    const handleScroll = () => {
      const rect =
        document.getElementById('sound-button')?.getBoundingClientRect() ||
        document.getElementById('toggle-video-widget')?.getBoundingClientRect();

      const videoRect =
        document.getElementById(`${postUuid}`)?.getBoundingClientRect() ||
        document.getElementById('video-wrapper')?.getBoundingClientRect();

      if (rect && videoRect) {
        const delta = window.innerHeight - videoRect.bottom;
        if (delta < 0) {
          setUiOffset(Math.abs(delta) + 24);
        } else {
          setUiOffset(undefined);
        }
      }
    };

    if (isBrowser() && !isMobile) {
      const rect =
        document.getElementById('sound-button')?.getBoundingClientRect() ||
        document.getElementById('toggle-video-widget')?.getBoundingClientRect();

      if (rect) {
        const isInViewPort =
          rect.bottom <=
          (window.innerHeight || document.documentElement?.clientHeight);

        if (!isInViewPort) {
          const delta = window.innerHeight - rect.bottom;
          setUiOffset(Math.abs(delta) + 24);
        } else {
          setUiOffset(undefined);
        }
      }

      handleScroll();
      document?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setUiOffset(undefined);

      if (isBrowser() && !isMobile) {
        document?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [
    isMobile,
    postUuid,
    responseFileUploadLoading,
    responseFileProcessingLoading,
  ]);

  return (
    <>
      <SVideoWrapper id='video-wrapper'>
        {openedTab === 'announcement' ? (
          <PostVideoAnnouncementTab
            postUuid={postUuid}
            announcement={announcement}
            hasCoverImage={!!currentCoverUrl}
            isMuted={isMuted}
            isSetThumbnailButtonIconOnly={isSetThumbnailButtonIconOnly}
            uiOffset={uiOffset}
            handleOpenEditCoverImageMenu={handleOpenEditCoverImageMenu}
            handleToggleMuted={handleToggleMuted}
          />
        ) : coreResponse ? (
          <PostVideoResponseUploadedTab
            id='video'
            isMuted={isMuted}
            isEditingStories={isEditingStories}
            uiOffset={uiOffset}
            handleToggleMuted={handleToggleMuted}
            handleToggleEditingStories={handleToggleEditingStories}
            handleUnsetEditingStories={handleUnsetEditingStories}
            handleOpenEditCoverImageMenu={handleOpenEditCoverImageMenu}
          />
        ) : uploadedResponseVideoUrl &&
          videoProcessing?.targetUrls &&
          !responseFileUploadLoading &&
          !responseFileProcessingLoading &&
          !responseFileUploadError ? (
          <>
            <PostVideojsPlayer
              id={postUuid}
              resources={videoProcessing.targetUrls!!}
              muted={isMuted}
              showPlayButton
              videoDurationWithTime
            />
            <SReuploadButton onClick={() => handleVideoDelete()}>
              {t('postVideo.reuploadButton')}
            </SReuploadButton>
            <PostVideoSoundButton
              postUuid={postUuid}
              isMuted={isMuted}
              uiOffset={uiOffset}
              handleToggleMuted={handleToggleMuted}
            />
            <SetThumbnailButtonIconOnly
              handleClick={handleOpenEditImageInitialResponse}
              uiOffset={uiOffset}
            />
          </>
        ) : (
          <PostVideoResponseUpload id='video' />
        )}
        {(coreResponse ||
          postStatus === 'waiting_for_response' ||
          postStatus === 'processing_response') &&
        !isEditingStories &&
        !responseFileProcessingLoading &&
        !responseFileUploadLoading &&
        !additionalResponseUploading &&
        !readyToUploadAdditionalResponse ? (
          <SlidingToggleVideoWidget
            disabled={responseFileUploadLoading || responseFileUploadLoading}
            wrapperCSS={{
              ...(uiOffset
                ? {
                    transform: `translateY(-${
                      uiOffset + (!isTablet ? 8 : 40)
                    }px)`,
                  }
                : {}),
            }}
          />
        ) : null}
      </SVideoWrapper>
      {/* Initial Cover Image */}
      {coverImageInitialResponseOpen && (
        <PostVideoCoverImageEditResponse
          open={coverImageInitialResponseOpen}
          originalCoverUrl={customCoverImageUrlResponse}
          handleClose={handleCloseEditCoverImageInitialResponse}
          handleSaveEditedUrl={handleUpdateCustomCoverImageUrl}
        />
      )}
      {/* Edit Cover Image */}
      {coverImageModalOpen && (
        <PostVideoCoverImageEdit
          open={coverImageModalOpen}
          postUuid={postUuid}
          currentTarget={openedTab}
          originalCoverUrl={currentCoverUrl}
          handleClose={handleCloseCoverImageEditClick}
          handleSubmit={handleSubmitNewCoverImage}
        />
      )}
    </>
  );
};

PostVideoModeration.defaultProps = {};

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

    flex-shrink: 0;

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

const SReuploadButton = styled.button`
  position: absolute;
  left: 16px;
  top: 16px;

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
    left: 50%;
    transform: translateX(-50%);
    top: 16px;
  }
`;
