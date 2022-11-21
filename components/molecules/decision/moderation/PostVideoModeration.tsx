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
import { TThumbnailParameters } from '../../../../redux-store/slices/creationStateSlice';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';
import EllipseModal, { EllipseModalButton } from '../../../atoms/EllipseModal';
import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import SlidingToggleVideoWidget from '../../../atoms/moderation/SlidingToggleVideoWidget';
import PostVideoResponseUploadedTab from './PostVideoResponseUploadedTab';
import PostVideoAnnouncementTab from './PostVideoAnnouncementTab';
import PostVideoResponseUpload from './PostVideoResponseUpload';
import PostVideoCoverImageEdit from './PostVideoCoverImageEdit';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';

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
  thumbnails: any;
  announcement: newnewapi.IVideoUrls;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideoModeration: React.FunctionComponent<IPostVideoModeration> = ({
  postId,
  announcement,
  thumbnails,
  isMuted,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
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

  const { postStatus } = usePostInnerState();
  const {
    coreResponse,
    openedTab,
    handleVideoDelete,
    additionalResponseUploading,
    readyToUploadAdditionalResponse,
    responseFileUploadLoading,
    uploadedResponseVideoUrl,
    videoProcessing,
    responseFileProcessingLoading,
  } = usePostModerationResponsesContext();

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
  const [bottomOffset, setBottomOffset] = useState<number | undefined>(24);

  const isSetThumbnailButtonIconOnly = useMemo(
    () =>
      !!coreResponse ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'processing_response',
    [coreResponse, postStatus]
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
      showErrorToastCustom(t('postVideoThumbnailEdit.toast.error'));
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
          setBottomOffset(Math.abs(delta) + 24);
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
          setBottomOffset(Math.abs(delta) + 24);
        }
      }

      document?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setBottomOffset(undefined);

      if (isBrowser() && !isMobileOrTablet) {
        document?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet, postId]);

  return (
    <>
      <SVideoWrapper id='video-wrapper'>
        {openedTab === 'announcement' ? (
          <PostVideoAnnouncementTab
            postId={postId}
            announcement={announcement}
            isMuted={isMuted}
            isSetThumbnailButtonIconOnly={isSetThumbnailButtonIconOnly}
            ellipseButtonRef={ellipseButtonRef}
            soundBtnBottomOverriden={bottomOffset}
            handleOpenEllipseMenu={handleOpenEllipseMenu}
            handleToggleMuted={handleToggleMuted}
          />
        ) : coreResponse ? (
          <PostVideoResponseUploadedTab
            id='video'
            isMuted={isMuted}
            isEditingStories={isEditingStories}
            soundBtnBottomOverriden={bottomOffset}
            handleToggleMuted={handleToggleMuted}
            handleToggleEditingStories={handleToggleEditingStories}
          />
        ) : uploadedResponseVideoUrl &&
          videoProcessing?.targetUrls &&
          !responseFileUploadLoading &&
          !responseFileProcessingLoading ? (
          <>
            <PostBitmovinPlayer
              id={postId}
              resources={videoProcessing.targetUrls!!}
              muted={isMuted}
              showPlayButton
            />
            <SReuploadButton onClick={() => handleVideoDelete()}>
              {t('postVideo.reuploadButton')}
            </SReuploadButton>
            <PostVideoSoundButton
              postId={postId}
              isMuted={isMuted}
              soundBtnBottomOverriden={bottomOffset}
              handleToggleMuted={handleToggleMuted}
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
              ...(bottomOffset
                ? {
                    bottom: bottomOffset + 8,
                  }
                : {}),
            }}
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
