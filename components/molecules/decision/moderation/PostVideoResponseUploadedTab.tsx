/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

import loadVideo from '../../../../utils/loadVideo';
import { Mixpanel } from '../../../../utils/mixpanel';
import {
  removeUploadedFile,
  stopVideoProcessing,
} from '../../../../api/endpoints/upload';
import {
  MAX_VIDEO_DURATION,
  MAX_VIDEO_SIZE,
  MIN_VIDEO_DURATION,
} from '../../../../constants/general';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import InlineSvg from '../../../atoms/InlineSVG';
import PostVideoResponseUploaded from './PostVideoResponseUploaded';
import PostVideoEditStoryButton from '../../../atoms/decision/PostVideoEditStoryButton';

import errorIcon from '../../../../public/images/svg/icons/filled/Alert.svg';

interface IPostVideoResponseUploadedTab {
  id: string;
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  isEditingStories: boolean;
  handleToggleMuted: () => void;
  handleToggleEditingStories: () => void;
}

const PostVideoResponseUploadedTab: React.FunctionComponent<
  IPostVideoResponseUploadedTab
> = ({
  id,
  isMuted,
  isEditingStories,
  soundBtnBottomOverriden,
  handleToggleMuted,
  handleToggleEditingStories,
}) => {
  const { t } = useTranslation('modal-Post');
  const {
    coreResponse,
    additionalResponses,
    videoProcessing,
    responseFileUploadETA,
    responseFileUploadError,
    responseFileUploadLoading,
    responseFileUploadProgress,
    responseFileProcessingError,
    responseFileProcessingLoading,
    responseFileProcessingProgress,
    handleItemChange,
    handleCancelVideoUpload,
    handleResetVideoUploadAndProcessingState,
    handleSetUploadingAdditionalResponse,
    handleSetReadyToUploadAdditionalResponse,
    handleVideoDelete,
  } = usePostModerationResponsesContext();
  const value = useMemo(() => videoProcessing?.targetUrls, [videoProcessing]);

  const responses = useMemo(() => {
    if (additionalResponses) {
      if (responseFileProcessingProgress === 100) {
        return [coreResponse, ...additionalResponses, value];
      }
      return [coreResponse, ...additionalResponses];
    }

    return undefined;
  }, [
    coreResponse,
    additionalResponses,
    value,
    responseFileProcessingProgress,
  ]);

  const [currentStep, setCurrentStep] = useState<'regular' | 'editing'>(
    'regular'
  );

  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleUploadButtonClick = useCallback(() => {
    Mixpanel.track('Post Additional Video Response Upload', {
      _stage: 'Post',
    });
    inputRef.current?.click();
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
    Mixpanel.track('Post Video Response Delete', {
      _stage: 'Post',
    });
    handleCloseDeleteVideoClick();
    setLocalFile(null);
    handleItemChange(id, null);
    handleSetUploadingAdditionalResponse(false);
    handleSetReadyToUploadAdditionalResponse(false);
  }, [
    handleCloseDeleteVideoClick,
    id,
    handleItemChange,
    handleSetUploadingAdditionalResponse,
    handleSetReadyToUploadAdditionalResponse,
  ]);

  const handleDeleteLocalFile = useCallback(async () => {
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: videoProcessing?.targetUrls?.originalVideoUrl,
      });

      const res = await removeUploadedFile(payload);

      if (res.error) throw new Error('An error occurred');

      setLocalFile(null);
      await handleItemChange(id, null);
      handleSetUploadingAdditionalResponse(false);
      handleSetReadyToUploadAdditionalResponse(false);
    } catch (err) {
      console.error(err);
    }
  }, [
    videoProcessing?.targetUrls?.originalVideoUrl,
    handleItemChange,
    id,
    handleSetUploadingAdditionalResponse,
    handleSetReadyToUploadAdditionalResponse,
  ]);

  const handleDeleteUnuploadedAdditonalResponse = useCallback(async () => {
    try {
      await handleVideoDelete();
    } catch (err) {
      console.error(err);
    }
  }, [handleVideoDelete]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (!files || !files[0]) {
        return;
      }

      if (localFile) {
        await handleDeleteLocalFile();
      }

      const file = files[0];

      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(t('postVideo.uploadResponseForm.video.error.maxSize'));
      } else {
        const media: any = await loadVideo(file);

        if (media.duration < MIN_VIDEO_DURATION) {
          toast.error(t('postVideo.uploadResponseForm.video.error.minLength'));
        } else if (media.duration > MAX_VIDEO_DURATION) {
          toast.error(t('postVideo.uploadResponseForm.video.error.maxLength'));
        } else {
          setLocalFile(file);
          handleItemChange(id, file);
          handleSetUploadingAdditionalResponse(true);
          setCurrentStep('editing');
        }
      }
    },
    [
      localFile,
      handleDeleteLocalFile,
      t,
      handleItemChange,
      id,
      handleSetUploadingAdditionalResponse,
    ]
  );
  const handleRetryVideoUpload = useCallback(() => {
    handleItemChange(id, localFile);
  }, [id, localFile, handleItemChange]);

  const handleCancelVideoProcessing = useCallback(async () => {
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: videoProcessing?.targetUrls?.originalVideoUrl,
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
      handleItemChange(id, null);
      handleSetUploadingAdditionalResponse(false);
      handleSetReadyToUploadAdditionalResponse(false);
      handleResetVideoUploadAndProcessingState();
    } catch (err) {
      console.error(err);
    }
  }, [
    id,
    handleItemChange,
    videoProcessing,
    handleResetVideoUploadAndProcessingState,
    handleSetUploadingAdditionalResponse,
    handleSetReadyToUploadAdditionalResponse,
  ]);

  const renderUploading = useCallback(() => {
    let content;

    if (responseFileUploadLoading) {
      content = (
        <SLoadingContainer>
          <SLoadingBox>
            <SLoadingTitleWithEllipseAnimated variant={3} weight={600}>
              {t('postVideo.uploadResponseForm.video.loading.title')}
            </SLoadingTitleWithEllipseAnimated>
            <SLoadingDescription variant={2} weight={600}>
              {t('postVideo.uploadResponseForm.video.loading.description')}
            </SLoadingDescription>
            <SLoadingBottomBlock>
              <SLoadingDescription variant={2} weight={600}>
                {t('postVideo.uploadResponseForm.video.loading.process', {
                  time: `${responseFileUploadETA} seconds`,
                  progress: responseFileUploadProgress,
                })}
              </SLoadingDescription>
              <SLoadingBottomBlockButton
                view='secondary'
                onClick={handleCancelVideoUpload}
              >
                {t('postVideo.uploadResponseForm.button.cancel')}
              </SLoadingBottomBlockButton>
            </SLoadingBottomBlock>
            <SLoadingProgress>
              <SLoadingProgressFilled progress={responseFileUploadProgress} />
            </SLoadingProgress>
          </SLoadingBox>
        </SLoadingContainer>
      );
    } else if (responseFileUploadError || responseFileProcessingError) {
      content = (
        <SLoadingContainer>
          <SErrorBox>
            <SErrorTitleWrapper>
              <SInlineSVG svg={errorIcon} width='16px' height='16px' />
              <SErrorTitle variant={3} weight={600}>
                {t('postVideo.uploadResponseForm.video.error.title')}
              </SErrorTitle>
            </SErrorTitleWrapper>
            <SLoadingDescription variant={2} weight={600}>
              {t('postVideo.uploadResponseForm.video.error.description')}
            </SLoadingDescription>
            <SErrorBottomBlock>
              <SLoadingBottomBlockButton
                view='secondary'
                onClick={handleCancelVideoProcessing}
              >
                {t('postVideo.uploadResponseForm.button.cancel')}
              </SLoadingBottomBlockButton>
              <Button
                view='primaryGrad'
                onClick={handleRetryVideoUpload}
                disabled={!localFile}
              >
                {t('postVideo.uploadResponseForm.button.retry')}
              </Button>
            </SErrorBottomBlock>
          </SErrorBox>
        </SLoadingContainer>
      );
    } else if (responseFileProcessingLoading) {
      content = (
        <SLoadingContainer>
          <SLoadingBox>
            <SLoadingTitleWithEllipseAnimated variant={3} weight={600}>
              {t('postVideo.uploadResponseForm.video.processing.title')}
            </SLoadingTitleWithEllipseAnimated>
            <SLoadingDescription variant={2} weight={600}>
              {t('postVideo.uploadResponseForm.video.processing.description')}
            </SLoadingDescription>
            <SLoadingBottomBlock />
          </SLoadingBox>
        </SLoadingContainer>
      );
    }

    return content;
  }, [
    responseFileUploadLoading,
    responseFileUploadError,
    responseFileProcessingError,
    responseFileProcessingLoading,
    t,
    responseFileUploadETA,
    responseFileUploadProgress,
    handleCancelVideoUpload,
    handleCancelVideoProcessing,
    handleRetryVideoUpload,
    localFile,
  ]);

  useEffect(() => {
    if (responseFileProcessingProgress === 100) {
      handleSetReadyToUploadAdditionalResponse(true);
    } else {
      handleSetReadyToUploadAdditionalResponse(false);
    }
  }, [
    responseFileProcessingProgress,
    handleSetReadyToUploadAdditionalResponse,
  ]);

  return (
    <SContainer>
      {!responseFileUploadLoading && !responseFileProcessingLoading ? (
        <PostVideoResponseUploaded
          isMuted={isMuted}
          isEditingStories={isEditingStories}
          soundBtnBottomOverriden={soundBtnBottomOverriden}
          handleToggleMuted={handleToggleMuted}
          handleDeleteUnuploadedAdditonalResponse={
            handleDeleteUnuploadedAdditonalResponse
          }
        />
      ) : (
        renderUploading()
      )}
      <SInput
        id='file'
        ref={inputRef}
        type='file'
        style={{ display: 'none' }}
        accept='video/*'
        multiple={false}
        onChange={(e) => {
          handleFileChange(e);
        }}
      />
      {currentStep === 'regular' ? (
        <SUploadVideoButton onClick={() => handleUploadButtonClick()}>
          {t('postVideo.addVideoButton')}
        </SUploadVideoButton>
      ) : null}
      {!responseFileUploadLoading &&
      !responseFileProcessingLoading &&
      responses &&
      responses?.length > 0 ? (
        <PostVideoEditStoryButton
          active={isEditingStories}
          bottomOverriden={soundBtnBottomOverriden}
          handleClick={handleToggleEditingStories}
        />
      ) : null}
      {currentStep === 'editing' && responseFileProcessingProgress === 100 ? (
        <SUploadVideoButton onClick={() => handleUploadButtonClick()}>
          {t('postVideo.reuploadButton')}
        </SUploadVideoButton>
      ) : null}
    </SContainer>
  );
};

export default PostVideoResponseUploadedTab;

const SContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const SUploadVideoButton = styled.button`
  position: absolute;
  top: 24px;
  left: calc(50% - 60px);

  width: 120px;

  color: ${({ theme }) => theme.colors.dark};
  background: #ffffff;

  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  padding: 8px 16px;
  border-radius: 12px;
  border: transparent;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;

const SInput = styled.input`
  position: absolute;
  left: -1000px;
  visibility: hidden;
`;

// Temp
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

const SLoadingContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const SLoadingBox = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
  flex-direction: column;

  margin-left: 16px;
  margin-right: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;

    background: ${(props) => props.theme.colorsThemed.background.primary};
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
  padding: 0;

  &:focus:enabled,
  &:hover:enabled {
    background: transparent;
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

    background: ${(props) => props.theme.colorsThemed.background.primary};
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
