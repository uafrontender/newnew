/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useCallback,
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

import isBrowser from '../../../../utils/isBrowser';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useAppSelector } from '../../../../redux-store/store';
import { setPostThumbnail } from '../../../../api/endpoints/post';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import {
  TThumbnailParameters,
  TVideoProcessingData,
} from '../../../../redux-store/slices/creationStateSlice';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';
import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import SlidingToggleVideoWidget from '../../../atoms/moderation/SlidingToggleVideoWidget';
import PostVideoResponseUploadedTab from './PostVideoResponseUploadedTab';
import PostVideoResponseUpload from './PostVideoResponseUpload';
import PostVideoCoverImageEdit from './PostVideoCoverImageEdit';

import ThumbnailIcon from '../../../../public/images/svg/icons/filled/AddImage.svg';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

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
  additionalResponses?: newnewapi.IVideoUrls[];
  handleAddAdditonalResponse: (newVideo: newnewapi.IVideoUrls) => void;
  handleDeleteAdditonalResponse: (videoUuid: string) => void;
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
  additionalResponses,
  handleAddAdditonalResponse,
  handleDeleteAdditonalResponse,
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
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const ellipseButtonRef = useRef<HTMLButtonElement>();
  const [currentCoverUrl, setCurrentCoverUrl] = useState(
    announcement.coverImageUrl ?? undefined
  );
  const [showEllipseMenu, setShowEllipseMenu] = useState(false);
  const [showThumbnailEdit, setShowThumbnailEdit] = useState(false);
  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);

  const handleOpenEllipseMenu = useCallback(() => setShowEllipseMenu(true), []);

  const handleCloseEllipseMenu = useCallback(
    () => setShowEllipseMenu(false),
    []
  );

  const handleOpenEditThumbnailMenu = useCallback(() => {
    Mixpanel.track('Edit Thumbnail', { _stage: 'Creation' });
    setShowThumbnailEdit(true);
    setShowEllipseMenu(false);
  }, []);

  const handleCloseThumbnailEditClick = useCallback(() => {
    Mixpanel.track('Close Thumbnail Edit Dialog', { _stage: 'Creation' });
    setShowThumbnailEdit(false);
  }, []);

  const handleOpenEditCoverImageMenu = useCallback(() => {
    Mixpanel.track('Edit Cover Image', { _stage: 'Creation' });
    setCoverImageModalOpen(true);
    setShowEllipseMenu(false);
  }, []);

  const handleCloseCoverImageEditClick = useCallback(() => {
    Mixpanel.track('Close Cover Image Edit Dialog', { _stage: 'Creation' });
    setCoverImageModalOpen(false);
  }, []);

  const handleSubmitNewCoverImage = useCallback(
    (newCoverUrl: string | undefined) => {
      Mixpanel.track('Submit New Cover Image', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'PostVideoModeration',
      });
      setCurrentCoverUrl(newCoverUrl);
      setCoverImageModalOpen(false);
    },
    [postId]
  );

  // Show controls on shorter screens
  const [soundBtnBottomOverriden, setSoundBtnBottomOverriden] = useState<
    number | undefined
  >(24);

  const isSetThumbnailButtonIconOnly = useMemo(
    () =>
      response ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response',
    [response, postStatus]
  );

  const handleSubmitNewThumbnail = async (params: TThumbnailParameters) => {
    try {
      Mixpanel.track('Submit New Thumbnail', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'PostVideoModeration',
      });
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

      handleCloseThumbnailEditClick();
      toast.success(t('postVideoThumbnailEdit.toast.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('postVideoThumbnailEdit.toast.error'));
    }
  };

  // Editing stories
  const [isEditingStories, setIsEditingStories] = useState(false);

  const handleToggleEditingStories = () => setIsEditingStories((curr) => !curr);

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
                ref={ellipseButtonRef as any}
                onClick={() => {
                  Mixpanel.track('Open Ellipse Menu', {
                    _stage: 'Post',
                    _postUuid: postId,
                    _component: 'PostVideoModeration',
                  });
                  handleOpenEllipseMenu();
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
                  svg={ThumbnailIcon}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                  fill='#FFFFFF'
                />
              </SSetThumbnailButtonIconOnly>
            ) : (
              <SSetThumbnailButton
                view='transparent'
                ref={ellipseButtonRef as any}
                onClick={() => {
                  Mixpanel.track('Open Ellipse Menu', {
                    _stage: 'Post',
                    _postUuid: postId,
                    _component: 'PostVideoModeration',
                  });
                  handleOpenEllipseMenu();
                }}
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
            <PostVideoSoundButton
              postId={postId}
              isMuted={isMuted}
              soundBtnBottomOverriden={soundBtnBottomOverriden}
              handleToggleMuted={handleToggleMuted}
            />
          </>
        ) : response ? (
          <PostVideoResponseUploadedTab
            postId={postId}
            response={response}
            isMuted={isMuted}
            soundBtnBottomOverriden={soundBtnBottomOverriden}
            handleToggleMuted={handleToggleMuted}
            additionalResponses={additionalResponses}
            handleAddAdditonalResponse={handleAddAdditonalResponse}
            handleDeleteAdditonalResponse={handleDeleteAdditonalResponse}
            isEditingStories={isEditingStories}
            handleToggleEditingStories={handleToggleEditingStories}
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
            <PostVideoSoundButton
              postId={postId}
              isMuted={isMuted}
              soundBtnBottomOverriden={soundBtnBottomOverriden}
              handleToggleMuted={handleToggleMuted}
            />
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
        {(response ||
          postStatus === 'waiting_for_response' ||
          postStatus === 'processing_response') &&
        !isEditingStories ? (
          <SlidingToggleVideoWidget
            postId={postId}
            openedTab={openedTab}
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
      {/* Ellipse menu */}
      {!isMobile && (
        <SEllipseMenu
          isOpen={showEllipseMenu}
          onClose={handleCloseEllipseMenu}
          anchorElement={ellipseButtonRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}
          offsetRight='200px'
        >
          <EllipseMenuButton
            onClick={() => {
              Mixpanel.track('Open Edit Thumbnail Menu', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostVideoModaration',
              });
              handleOpenEditThumbnailMenu();
            }}
          >
            {t('thumbnailEllipseMenu.selectSnippetButton')}
          </EllipseMenuButton>
          <EllipseMenuButton
            onClick={() => {
              Mixpanel.track('Open Edit Cover Image Menu', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostVideoModaration',
              });
              handleOpenEditCoverImageMenu();
            }}
          >
            {t('thumbnailEllipseMenu.uploadImageButton')}
          </EllipseMenuButton>
        </SEllipseMenu>
      )}
      {isMobile && showEllipseMenu ? (
        <EllipseModal
          zIndex={10}
          show={showEllipseMenu}
          onClose={handleCloseEllipseMenu}
        >
          <EllipseModalButton
            onClick={() => {
              Mixpanel.track('Open Edit Thumbnail Menu', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostVideoModaration',
              });
              handleOpenEditThumbnailMenu();
            }}
          >
            {t('thumbnailEllipseMenu.selectSnippetButton')}
          </EllipseModalButton>
          <EllipseModalButton
            onClick={() => {
              Mixpanel.track('Open Edit Cover Image Menu', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostVideoModaration',
              });
              handleOpenEditCoverImageMenu();
            }}
          >
            {t('thumbnailEllipseMenu.uploadImageButton')}
          </EllipseModalButton>
        </EllipseModal>
      ) : null}
      {/* Edit thumbnail */}
      <PostVideoThumbnailEdit
        open={showThumbnailEdit}
        value={announcement}
        thumbnails={thumbnails}
        handleClose={handleCloseThumbnailEditClick}
        handleSubmit={handleSubmitNewThumbnail}
      />
      {/* Edit Cover Image */}
      {coverImageModalOpen && (
        <PostVideoCoverImageEdit
          open={coverImageModalOpen}
          postId={postId}
          originalCoverUrl={currentCoverUrl}
          handleClose={handleCloseCoverImageEditClick}
          handleSubmit={handleSubmitNewCoverImage}
        />
      )}
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

// Ellipse menu
const SEllipseMenu = styled(EllipseMenu)`
  max-width: 216px;
  position: fixed !important;

  background: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.background.secondary
      : theme.colorsThemed.background.primary} !important;
`;
