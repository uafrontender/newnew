import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import InlineSVG from '../../atoms/InlineSVG';
import FullPreview from './FullPreview';
import DeleteVideo from './DeleteVideo';

import { loadVideo } from '../../../utils/loadVideo';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import {
  MAX_VIDEO_SIZE,
  MIN_VIDEO_DURATION,
  MAX_VIDEO_DURATION,
} from '../../../constants/general';

import errorIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import spinnerIcon from '../../../public/images/svg/icons/filled/Spinner.svg';
import {
  removeUploadedFile,
  stopVideoProcessing,
} from '../../../api/endpoints/upload';
import {
  setCreationFileProcessingError,
  setCreationFileProcessingLoading,
  setCreationFileProcessingProgress,
  setCreationFileUploadError,
  setCreationFileUploadLoading,
  setCreationFileUploadProgress,
  setCreationVideo,
  setCreationVideoProcessing,
} from '../../../redux-store/slices/creationStateSlice';

const BitmovinPlayer = dynamic(() => import('../../atoms/BitmovinPlayer'), {
  ssr: false,
});
const ThumbnailPreviewEdit = dynamic(() => import('./ThumbnailPreviewEdit'), {
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
  thumbnails: any;
  onChange: (id: string, value: any) => void;
  handleCancelVideoUpload: () => void;
}

export const FileUpload: React.FC<IFileUpload> = ({
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
  onChange,
  handleCancelVideoUpload,
}) => {
  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const [showThumbnailEdit, setShowThumbnailEdit] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const { t } = useTranslation('creation');
  const inputRef: any = useRef();
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState(null);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { post, videoProcessing } = useAppSelector((state) => state.creation);
  const dispatch = useAppDispatch();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handleFullPreview = useCallback(() => {
    setShowFullPreview(true);
    playerRef.current.pause();
  }, []);
  const handleCloseFullPreviewClick = useCallback(() => {
    setShowFullPreview(false);
    playerRef.current.play();
  }, []);
  const handleEditThumb = useCallback(() => {
    setShowThumbnailEdit(true);
    playerRef.current.pause();
  }, []);
  const handleCloseThumbnailEditClick = useCallback(() => {
    setShowThumbnailEdit(false);
    playerRef.current.play();
  }, []);
  const handleDeleteVideoShow = useCallback(() => {
    setShowVideoDelete(true);
    playerRef.current.pause();
  }, []);
  const handleCloseDeleteVideoClick = useCallback(() => {
    setShowVideoDelete(false);
    playerRef.current.play();
  }, []);
  const handleDeleteVideo = useCallback(() => {
    handleCloseDeleteVideoClick();
    setLocalFile(null);
    onChange(id, null);
  }, [handleCloseDeleteVideoClick, id, onChange]);
  const handlePreviewEditSubmit = useCallback(
    (params) => {
      handleCloseThumbnailEditClick();
      onChange('thumbnailParameters', params);
    },
    [handleCloseThumbnailEditClick, onChange]
  );
  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target?.files[0];

      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(t('secondStep.video.error.maxSize'));
      } else {
        const media: any = await loadVideo(file);

        if (media.duration < MIN_VIDEO_DURATION) {
          toast.error(t('secondStep.video.error.minLength'));
        } else if (media.duration > MAX_VIDEO_DURATION) {
          toast.error(t('secondStep.video.error.maxLength'));
        } else {
          setLocalFile(file);
          onChange(id, file);
        }
      }
    },
    [id, onChange, t]
  );
  const handleRetryVideoUpload = useCallback(() => {
    onChange(id, localFile);
  }, [id, localFile, onChange]);
  const handleCancelVideoProcessing = useCallback(async () => {
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
      dispatch(setCreationVideo(''));
      dispatch(setCreationVideoProcessing({}));
      dispatch(setCreationFileUploadError(false));
      dispatch(setCreationFileUploadLoading(false));
      dispatch(setCreationFileUploadProgress(0));
      dispatch(setCreationFileProcessingError(false));
      dispatch(setCreationFileProcessingLoading(false));
      dispatch(setCreationFileProcessingProgress(0));
    } catch (err) {
      console.error(err);
    }
  }, [
    dispatch,
    id,
    onChange,
    post?.announcementVideoUrl,
    videoProcessing?.taskUuid,
  ]);

  const renderContent = useCallback(() => {
    let content = (
      <SDropBox htmlFor='file'>
        <input
          id='file'
          ref={inputRef}
          type='file'
          style={{ display: 'none' }}
          accept='video/*'
          multiple={false}
          onChange={handleFileChange}
        />
        <SPlaceholder weight={600} variant={2}>
          {t('secondStep.fileUpload.description')}
        </SPlaceholder>
        <SButton view='primaryGrad' onClick={handleButtonClick}>
          {t('secondStep.fileUpload.button')}
        </SButton>
      </SDropBox>
    );

    if (loadingUpload) {
      content = (
        <SLoadingBox>
          <SLoadingTitle variant={3} weight={600}>
            {t('secondStep.video.loading.title')}
          </SLoadingTitle>
          <SLoadingDescription variant={2} weight={600}>
            {t('secondStep.video.loading.description')}
          </SLoadingDescription>
          <SLoadingBottomBlock>
            <SLoadingDescription variant={2} weight={600}>
              {t('secondStep.video.loading.process', {
                time: `${etaUpload} seconds`,
                progress: progressUpload,
              })}
            </SLoadingDescription>
            <SLoadingBottomBlockButton
              view='secondary'
              onClick={() => {
                handleCancelVideoUpload();
              }}
            >
              {t('secondStep.button.cancel')}
            </SLoadingBottomBlockButton>
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
          <SLoadingDescription variant={2} weight={600}>
            {t('secondStep.video.processing.description')}
          </SLoadingDescription>
          <SLoadingBottomBlock>
            <SLoadingDescription variant={2} weight={600}>
              {t('secondStep.video.processing.process', {
                time: `${etaProcessing} seconds`,
                progress: progressProcessing,
              })}
            </SLoadingDescription>
            <SLoadingBottomBlockButton
              view='secondary'
              onClick={() => {
                handleCancelVideoProcessing();
              }}
              disabled={!value?.hlsStreamUrl}
            >
              {t('secondStep.button.cancel')}
            </SLoadingBottomBlockButton>
          </SLoadingBottomBlock>
          <SSpinnerWrapper>
            <InlineSVG svg={spinnerIcon} width='16px' />
          </SSpinnerWrapper>
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
            onChange={handleFileChange}
          />
          <SPlayerWrapper>
            <BitmovinPlayer
              id='small-thumbnail'
              innerRef={playerRef}
              resources={value}
              thumbnails={thumbnails}
              borderRadius='8px'
            />
          </SPlayerWrapper>
          <SButtonsContainer>
            <SButtonsContainerLeft>
              <SVideoButton onClick={handleEditThumb}>
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
    }

    return content;
  }, [
    t,
    value,
    etaUpload,
    errorUpload,
    loadingUpload,
    progressUpload,
    etaProcessing,
    errorProcessing,
    loadingProcessing,
    progressProcessing,
    isDesktop,
    localFile,
    thumbnails,
    handleEditThumb,
    handleFileChange,
    handleFullPreview,
    handleButtonClick,
    handleDeleteVideoShow,
    handleRetryVideoUpload,
    handleCancelVideoProcessing,
    handleCancelVideoUpload,
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
      <ThumbnailPreviewEdit
        open={showThumbnailEdit}
        value={value}
        thumbnails={thumbnails}
        handleClose={handleCloseThumbnailEditClick}
        handleSubmit={handlePreviewEditSubmit}
      />
      {renderContent()}
    </SWrapper>
  );
};

export default FileUpload;

FileUpload.defaultProps = {};

const SWrapper = styled.div`
  width: 100%;
`;

const SDropBox = styled.label`
  width: 100%;
  cursor: copy;
  display: flex;
  padding: 16px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  flex-direction: column;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }
`;

const SPlaceholder = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-bottom: 12px;
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
  width: 64px;
  height: 108px;

  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 124px;
  }
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

const SLoadingTitle = styled(Text)`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-direction: row;
`;

const SInlineSVG = styled(InlineSVG)`
  margin-right: 6px;
`;

const SLoadingDescription = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
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
