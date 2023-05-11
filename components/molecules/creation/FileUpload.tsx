import React, { useRef, useState, useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import InlineSvg from '../../atoms/InlineSVG';
import FullPreview from './FullPreview';
import DeleteVideo from './DeleteVideo';

import useErrorToasts from '../../../utils/hooks/useErrorToasts';

import { MAX_VIDEO_SIZE } from '../../../constants/general';

import errorIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import dropboxIcon from '../../../public/images/svg/icons/outlined/upload-cloud.svg';

import {
  removeUploadedFile,
  stopVideoProcessing,
} from '../../../api/endpoints/upload';
import { Mixpanel } from '../../../utils/mixpanel';
import CoverImagePreviewEdit from './CoverImagePreviewEdit';
import { useAppState } from '../../../contexts/appStateContext';
import {
  TThumbnailParameters,
  usePostCreationState,
} from '../../../contexts/postCreationContext';
import spinnerIcon from '../../../public/images/svg/icons/filled/Spinner.svg';

const VideojsPlayer = dynamic(() => import('../../atoms/VideojsPlayer'), {
  ssr: false,
});

interface IFileUpload {
  id: string;
  value: any;
  etaUpload: number;
  errorUpload: boolean;
  loadingUpload: boolean;
  progressUpload: number;
  etaProcessing: number;
  errorProcessing: boolean;
  loadingProcessing: boolean;
  progressProcessing: number;
  thumbnails: TThumbnailParameters;
  customCoverImageUrl?: string;
  onChange: (id: string, value: any) => void;
  handleCancelVideoUpload: () => void;
}

const FileUpload: React.FC<IFileUpload> = ({
  id,
  value,
  etaUpload,
  errorUpload,
  loadingUpload,
  progressUpload,
  etaProcessing,
  errorProcessing,
  loadingProcessing,
  progressProcessing,
  thumbnails,
  customCoverImageUrl,
  onChange,
  handleCancelVideoUpload,
}) => {
  const { t } = useTranslation('page-Creation');
  const { showErrorToastCustom, showErrorToastPredefined } = useErrorToasts();

  const {
    postInCreation,
    setCreationFileProcessingError,
    setCreationFileProcessingLoading,
    setCreationFileProcessingProgress,
    setCreationFileUploadError,
    setCreationFileUploadLoading,
    setCreationFileUploadProgress,
    setCreationVideo,
    setCreationVideoProcessing,
    unsetCustomCoverImageUrl,
  } = usePostCreationState();
  const { post, videoProcessing } = useMemo(
    () => postInCreation,
    [postInCreation]
  );

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState<File | null>(null);

  const [showVideoDelete, setShowVideoDelete] = useState(false);

  const ellipseButtonRef = useRef<HTMLButtonElement>();
  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);

  const [showFullPreview, setShowFullPreview] = useState(false);

  const [showPlayButton, setShowPlayButton] = useState(false);

  const handleUploadButtonClick = useCallback(() => {
    Mixpanel.track('Select File Clicked', { _stage: 'Creation' });
    inputRef.current?.click();
  }, []);

  const handleFullPreview = useCallback(() => {
    Mixpanel.track('Open Full Preview', { _stage: 'Creation' });
    setShowFullPreview(true);
    playerRef.current.pause();
  }, []);

  const handleCloseFullPreviewClick = useCallback(() => {
    Mixpanel.track('Close Full Preview', { _stage: 'Creation' });
    setShowFullPreview(false);
    playerRef.current.play().catch(() => {
      setShowPlayButton(true);
    });
  }, []);

  const handleOpenEditCoverImageMenu = useCallback(() => {
    Mixpanel.track('Edit Cover Image', { _stage: 'Creation' });
    setCoverImageModalOpen(true);
    playerRef.current.pause();
  }, []);

  const handleCloseCoverImageEditClick = useCallback(() => {
    Mixpanel.track('Close Cover Image Edit Dialog', { _stage: 'Creation' });
    setCoverImageModalOpen(false);
    playerRef.current.play().catch(() => {
      setShowPlayButton(true);
    });
  }, []);

  const handleDeleteVideoShow = useCallback(() => {
    Mixpanel.track('Show Delete Video Dialog', { _stage: 'Creation' });
    setShowVideoDelete(true);
    playerRef.current?.pause();
  }, []);

  const handleCloseDeleteVideoClick = useCallback(() => {
    Mixpanel.track('Close Delete Video Dialog', { _stage: 'Creation' });
    setShowVideoDelete(false);
    playerRef.current.play().catch(() => {
      setShowPlayButton(true);
    });
  }, []);

  const handleDeleteVideo = useCallback(() => {
    Mixpanel.track('Delete Video Clicked', { _stage: 'Creation' });
    handleCloseDeleteVideoClick();
    setLocalFile(null);
    onChange(id, null);
    unsetCustomCoverImageUrl();
  }, [handleCloseDeleteVideoClick, id, onChange, unsetCustomCoverImageUrl]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (!files) {
        return;
      }

      const file = files[0];

      Mixpanel.track('Video Selected', {
        _stage: 'Creation',
        _file: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      });

      if (file.size > MAX_VIDEO_SIZE) {
        showErrorToastCustom(t('secondStep.video.error.maxSize'));
      } else {
        Mixpanel.track('Video Loading', { _stage: 'Creation' });

        setLocalFile(file);
        onChange(id, file);
      }
    },
    [id, showErrorToastCustom, onChange, t]
  );

  const handleRetryVideoUpload = useCallback(() => {
    Mixpanel.track('Retry Video Upload', {
      _stage: 'Creation',
      _video: localFile,
    });
    onChange(id, localFile);
  }, [id, localFile, onChange]);

  const handleCancelUploadAndClearLocalFile = useCallback(() => {
    handleCancelVideoUpload();
    setLocalFile(null);
    unsetCustomCoverImageUrl();
  }, [handleCancelVideoUpload, unsetCustomCoverImageUrl]);

  const handleCancelVideoProcessing = useCallback(async () => {
    Mixpanel.track('Cancel Video Processing', {
      _stage: 'Creation',
      _publicUrl: post?.announcementVideoUrl,
    });
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: post?.announcementVideoUrl,
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

      setLocalFile(null);
      onChange(id, null);
      setCreationVideo('');
      setCreationVideoProcessing({} as any);
      setCreationFileUploadError(false);
      setCreationFileUploadLoading(false);
      setCreationFileUploadProgress(0);
      setCreationFileProcessingError(false);
      setCreationFileProcessingLoading(false);
      setCreationFileProcessingProgress(0);
      unsetCustomCoverImageUrl();
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  }, [
    id,
    onChange,
    post?.announcementVideoUrl,
    setCreationFileProcessingError,
    setCreationFileProcessingLoading,
    setCreationFileProcessingProgress,
    setCreationFileUploadError,
    setCreationFileUploadLoading,
    setCreationFileUploadProgress,
    setCreationVideo,
    setCreationVideoProcessing,
    showErrorToastPredefined,
    unsetCustomCoverImageUrl,
    videoProcessing?.taskUuid,
  ]);

  // Drag & Drop support
  const [dropZoneHighlighted, setDropZoneHighlighted] = useState(false);

  const handleOnDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDropZoneHighlighted(true);
    },
    []
  );

  const handleOnDragLeave = useCallback(() => {
    setDropZoneHighlighted(false);
  }, []);

  const handleOnDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();

      const { files } = e.dataTransfer;

      if (!files) {
        return;
      }

      const file = files[0];

      Mixpanel.track('Video Selected with drag and drop', {
        _stage: 'Creation',
        _file: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      });

      if (file.size > MAX_VIDEO_SIZE) {
        showErrorToastCustom(t('secondStep.video.error.maxSize'));
      } else {
        Mixpanel.track('Video Loading', { _stage: 'Creation' });

        setLocalFile(file);
        onChange(id, file);
      }

      setDropZoneHighlighted(false);
    },
    [id, onChange, showErrorToastCustom, t]
  );

  const renderContent = useCallback(() => {
    let content = (
      <SDropBox
        htmlFor='file'
        isHighlighted={dropZoneHighlighted}
        onDragOver={(e) => handleOnDragOver(e)}
        onDragLeave={() => handleOnDragLeave()}
        onDrop={(e) => handleOnDrop(e)}
      >
        <input
          id='file'
          ref={inputRef}
          type='file'
          style={{ display: 'none' }}
          accept='video/*'
          multiple={false}
          onChange={(e) => {
            handleFileChange(e);
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
        />
        {!isMobile && !isTablet ? (
          <SInlineSVGDropBox
            svg={dropboxIcon}
            fill='none'
            width='48px'
            height='48px'
          />
        ) : null}
        <SDropBoxWrapper>
          <SPseudoHeadline variant={3} weight={600}>
            {isMobile || isTablet
              ? t('secondStep.fileUpload.titleMobile')
              : t('secondStep.fileUpload.titleDesktop')}
          </SPseudoHeadline>
          <SPlaceholder weight={600} variant={2}>
            {t('secondStep.fileUpload.description')}
          </SPlaceholder>
        </SDropBoxWrapper>
        <SButton view='primaryGrad' onClick={handleUploadButtonClick}>
          {t('secondStep.fileUpload.button')}
        </SButton>
      </SDropBox>
    );

    if (loadingUpload) {
      const ETAisValid = !Number.isNaN(etaUpload) && etaUpload !== Infinity;
      const minutesLeft = Math.floor(etaUpload / 60);
      const secondsLeft = Math.ceil(etaUpload % 60);

      const minutesLeftString =
        // eslint-disable-next-line no-nested-ternary
        minutesLeft > 0
          ? minutesLeft > 1
            ? `${minutesLeft} ${t('secondStep.video.loading.minutes')} `
            : `${minutesLeft} ${t('secondStep.video.loading.minute')} `
          : '';
      const secondsLeftString = `${secondsLeft} ${
        secondsLeft === 1
          ? t('secondStep.video.loading.second')
          : t('secondStep.video.loading.seconds')
      }`;

      content = (
        <SLoadingBox>
          <SLoadingTitleWithEllipseAnimated variant={3} weight={600}>
            {t('secondStep.video.loading.title')}
          </SLoadingTitleWithEllipseAnimated>
          <SLoadingDescription variant={2} weight={600}>
            {t('secondStep.video.loading.description')}
          </SLoadingDescription>
          <SLoadingBottomBlock>
            {ETAisValid ? (
              <>
                <SLoadingDescription variant={2} weight={600}>
                  {t('secondStep.video.loading.process', {
                    seconds: secondsLeftString,
                    minutes: minutesLeftString,
                    progress: progressUpload,
                  })}
                </SLoadingDescription>
                {progressUpload !== 100 ? (
                  <SLoadingBottomBlockButton
                    view='secondary'
                    onClick={() => handleCancelUploadAndClearLocalFile()}
                  >
                    {t('secondStep.button.cancel')}
                  </SLoadingBottomBlockButton>
                ) : null}
              </>
            ) : (
              <SSpinnerWrapper>
                <InlineSvg svg={spinnerIcon} width='24px' />
              </SSpinnerWrapper>
            )}
          </SLoadingBottomBlock>
          <SLoadingProgress>
            <SLoadingProgressFilled progress={progressUpload} />
          </SLoadingProgress>
        </SLoadingBox>
      );
    } else if (errorUpload || errorProcessing) {
      content = (
        <SErrorBox>
          <SErrorTitleWrapper>
            <SInlineSVG svg={errorIcon} width='16px' height='16px' />
            <SErrorTitle variant={3} weight={600}>
              {t('secondStep.video.error.title')}
            </SErrorTitle>
          </SErrorTitleWrapper>
          <SLoadingDescription variant={2} weight={600}>
            {t('secondStep.video.error.description')}
          </SLoadingDescription>
          <SErrorBottomBlock>
            <SLoadingBottomBlockButton
              view='secondary'
              onClick={handleCancelVideoProcessing}
            >
              {t('secondStep.button.cancel')}
            </SLoadingBottomBlockButton>
            <Button
              view='primaryGrad'
              onClick={handleRetryVideoUpload}
              disabled={!localFile}
            >
              {t('secondStep.button.retry')}
            </Button>
          </SErrorBottomBlock>
        </SErrorBox>
      );
    } else if (loadingProcessing) {
      content = (
        <SLoadingBox>
          <SLoadingTitle variant={3} weight={600}>
            {t('secondStep.video.processing.title')}
          </SLoadingTitle>
          <SLoadingDescriptionWithEllipseAnimated variant={2} weight={600}>
            {t('secondStep.video.processing.description')}
          </SLoadingDescriptionWithEllipseAnimated>
        </SLoadingBox>
      );
    } else if (progressProcessing === 100) {
      content = (
        <SFileBox>
          <input
            id='file'
            ref={inputRef}
            type='file'
            style={{ display: 'none' }}
            accept='video/*'
            multiple={false}
            onChange={(e) => {
              handleFileChange(e);
              if (inputRef.current) {
                inputRef.current.value = '';
              }
            }}
          />
          <SPlayerWrapper>
            {customCoverImageUrl && (
              <SThumbnailHolder
                className='thumnailHolder'
                src={customCoverImageUrl ?? ''}
                alt='Post preview'
                draggable={false}
              />
            )}
            <VideojsPlayer
              id='small-thumbnail'
              innerRef={playerRef}
              resources={value}
              borderRadius='8px'
              showPlayButton={showPlayButton}
              playButtonSize='small'
            />
          </SPlayerWrapper>
          <SButtonsContainer>
            <SButtonsContainerLeft>
              <SVideoButton
                ref={ellipseButtonRef as any}
                active={coverImageModalOpen}
                onClick={() => handleOpenEditCoverImageMenu()}
              >
                {t('secondStep.video.setThumbnail')}
              </SVideoButton>
              <SVideoButton danger onClick={handleDeleteVideoShow}>
                {t('secondStep.video.deleteFile')}
              </SVideoButton>
            </SButtonsContainerLeft>
            {!isDesktop && (
              <div>
                <SVideoButton onClick={handleFullPreview}>
                  {t('secondStep.video.previewFull')}
                </SVideoButton>
              </div>
            )}
          </SButtonsContainer>
        </SFileBox>
      );
    } else if (localFile) {
      return null;
    }

    return content;
  }, [
    dropZoneHighlighted,
    isMobile,
    isTablet,
    t,
    handleUploadButtonClick,
    loadingUpload,
    errorUpload,
    errorProcessing,
    loadingProcessing,
    progressProcessing,
    localFile,
    handleOnDragOver,
    handleOnDragLeave,
    handleOnDrop,
    handleFileChange,
    etaUpload,
    progressUpload,
    handleCancelUploadAndClearLocalFile,
    handleCancelVideoProcessing,
    handleRetryVideoUpload,
    customCoverImageUrl,
    value,
    showPlayButton,
    coverImageModalOpen,
    handleDeleteVideoShow,
    isDesktop,
    handleFullPreview,
    handleOpenEditCoverImageMenu,
  ]);

  return (
    <SWrapper>
      <DeleteVideo
        open={showVideoDelete}
        handleClose={handleCloseDeleteVideoClick}
        handleSubmit={handleDeleteVideo}
      />
      <FullPreview
        open={showFullPreview}
        value={value}
        handleClose={handleCloseFullPreviewClick}
      />
      {coverImageModalOpen && (
        <CoverImagePreviewEdit
          open={coverImageModalOpen}
          handleClose={handleCloseCoverImageEditClick}
          handleSubmit={handleCloseCoverImageEditClick}
        />
      )}
      {renderContent()}
    </SWrapper>
  );
};

export default FileUpload;

FileUpload.defaultProps = {};

const SWrapper = styled.div`
  width: 100%;
`;

const SDropBox = styled.label<{
  isHighlighted: boolean;
}>`
  width: 100%;
  cursor: copy;
  display: flex;
  padding: 16px;
  background: ${({ theme, isHighlighted }) =>
    isHighlighted
      ? 'rgba(29, 106, 255, 0.2)'
      : theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  border: 1.5px dashed ${({ theme }) => theme.colors.blue};
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }
`;

const SInlineSVGDropBox = styled(InlineSvg)``;

const SDropBoxWrapper = styled.div`
  flex-grow: 3;
`;

const SPseudoHeadline = styled(Text)``;

const SPlaceholder = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SButton = styled(Button)`
  cursor: copy;
`;

const SFileBox = styled.div`
  height: 108px;
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.media.tablet} {
    height: 176px;
    border: 1px solid
      ${(props) =>
        props.theme.name === 'light'
          ? props.theme.colorsThemed.background.outlines1
          : 'transparent'};
    padding: 23px;
    overflow: hidden;
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.secondary};
    border-radius: 16px;
  }
`;

const SPlayerWrapper = styled.div`
  position: relative;
  width: 64px;
  height: 108px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 124px;
  }
`;

const SThumbnailHolder = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: linear 0.3s;
  z-index: 1;

  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const SButtonsContainer = styled.div`
  width: calc(100% - 64px);
  display: flex;
  padding-left: 16px;
  flex-direction: row;
  justify-content: space-between;
`;

const SButtonsContainerLeft = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
`;

interface ISVideoButton {
  danger?: boolean;
  active?: boolean;
}

const SVideoButton = styled.button<ISVideoButton>`
  color: ${(props) =>
    props.danger
      ? props.theme.colorsThemed.accent.error
      : props.theme.colorsThemed.text.secondary};
  border: none;
  cursor: pointer;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: bold;
  line-height: 24px;

  padding: 0px 2px;

  border-radius: 16px;

  text-align: left;

  ${({ active }) =>
    active
      ? css`
          background-color: ${({ theme }) =>
            theme.name === 'light'
              ? theme.colorsThemed.background.secondary
              : theme.colorsThemed.background.tertiary};
        `
      : ''}

  ${({ theme }) => theme.media.tablet} {
    padding: 8px 16px;
  }
`;

const SLoadingBox = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }
`;

const ellipseAnimation = keyframes`
from {
  width: 0px;
}
  to {
    width: 1em;
  }
`;

const SLoadingTitle = styled(Text)`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-direction: row;
`;

const SLoadingTitleWithEllipseAnimated = styled(Text)`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-direction: row;

  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    animation: ${ellipseAnimation} steps(4, end) 1100ms infinite;
    content: '...';
    width: 0px;
  }
`;

const SInlineSVG = styled(InlineSvg)`
  margin-right: 6px;
`;

const SLoadingDescription = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SLoadingDescriptionWithEllipseAnimated = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};

  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    animation: ${ellipseAnimation} steps(4, end) 1100ms infinite;
    content: '...';
    width: 0px;
  }
`;

const SLoadingBottomBlock = styled.div`
  display: flex;
  margin-top: 20px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 12px;
  }
`;

const SLoadingBottomBlockButton = styled(Button)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  padding: 0 10px;
  margin-right: -10px;

  &:focus:enabled,
  &:hover:enabled {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.secondary};
  }
`;

const SLoadingProgress = styled.div`
  width: 100%;
  height: 6px;
  overflow: hidden;
  position: relative;
  margin-top: 6px;
  background: ${(props) => props.theme.colorsThemed.background.outlines1};
  border-radius: 16px;
`;

const SSpinnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  div {
    animation: spin 0.7s linear infinite;
  }
`;

interface ISProgress {
  progress?: number;
}

const SLoadingProgressFilled = styled.div<ISProgress>`
  top: 0;
  left: 0;
  width: ${(props) => props.progress ?? 0}%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  position: absolute;
  transition: width ease 1s;
  background: ${(props) => props.theme.gradients.blueHorizontal};
  border-radius: 16px;
`;

const SErrorBox = styled.div`
  border: 1.5px solid ${(props) => props.theme.colorsThemed.accent.error};
  padding: 14.5px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    padding: 22.5px;
  }
`;

const SErrorTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-direction: row;
`;

const SErrorTitle = styled(Text)``;

const SErrorBottomBlock = styled.div`
  display: flex;
  margin-top: 20px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }
`;
