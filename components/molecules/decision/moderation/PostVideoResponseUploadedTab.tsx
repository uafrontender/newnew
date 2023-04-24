/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { Mixpanel } from '../../../../utils/mixpanel';
import {
  removeUploadedFile,
  stopVideoProcessing,
} from '../../../../api/endpoints/upload';
import { MAX_VIDEO_SIZE } from '../../../../constants/general';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import InlineSvg from '../../../atoms/InlineSVG';
import PostVideoResponseUploaded from './PostVideoResponseUploaded';
import PostVideoEditStoryButton from '../../../atoms/decision/PostVideoEditStoryButton';

import errorIcon from '../../../../public/images/svg/icons/filled/Alert.svg';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import SetThumbnailButtonIconOnly from '../../../atoms/decision/SetThumbnailButtonIconOnly';
import { useAppState } from '../../../../contexts/appStateContext';

interface IPostVideoResponseUploadedTab {
  id: string;
  isMuted: boolean;
  uiOffset?: number;
  isEditingStories: boolean;
  handleToggleMuted: () => void;
  handleToggleEditingStories: () => void;
  handleUnsetEditingStories: () => void;
  handleOpenEditCoverImageMenu: () => void;
}

const PostVideoResponseUploadedTab: React.FunctionComponent<
  IPostVideoResponseUploadedTab
> = ({
  id,
  isMuted,
  isEditingStories,
  uiOffset,
  handleToggleMuted,
  handleToggleEditingStories,
  handleUnsetEditingStories,
  handleOpenEditCoverImageMenu,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const { showErrorToastCustom } = useErrorToasts();
  const {
    coreResponse,
    additionalResponses,
    currentAdditionalResponseStep,
    handleSetCurrentAdditionalResponseStep,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleUploadButtonClick = useCallback(() => {
    Mixpanel.track('Post Additional Video Response Upload', {
      _stage: 'Post',
    });
    inputRef.current?.click();
  }, []);

  const handleDeleteLocalFile = useCallback(async () => {
    try {
      if (videoProcessing?.targetUrls?.originalVideoUrl) {
        const payload = new newnewapi.RemoveUploadedFileRequest({
          publicUrl: videoProcessing?.targetUrls?.originalVideoUrl,
        });

        const res = await removeUploadedFile(payload);

        if (res.error) throw new Error('An error occurred');
      }

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
      handleSetCurrentAdditionalResponseStep('regular');
    } catch (err) {
      console.error(err);
    }
  }, [handleSetCurrentAdditionalResponseStep, handleVideoDelete]);

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
        showErrorToastCustom(
          t('postVideo.uploadResponseForm.video.error.maxSize')
        );
      } else {
        setLocalFile(file);
        handleItemChange(id, file);
        handleSetCurrentAdditionalResponseStep('editing');
      }
    },
    [
      localFile,
      handleDeleteLocalFile,
      showErrorToastCustom,
      t,
      handleItemChange,
      id,
      handleSetCurrentAdditionalResponseStep,
    ]
  );

  const handleRetryVideoUpload = useCallback(() => {
    handleItemChange(id, localFile);
  }, [id, localFile, handleItemChange]);

  const handleCancelUploadAndClearLocalFile = useCallback(() => {
    handleCancelVideoUpload();
    setLocalFile(null);
    handleSetCurrentAdditionalResponseStep('regular');
  }, [handleCancelVideoUpload, handleSetCurrentAdditionalResponseStep]);

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
      handleSetCurrentAdditionalResponseStep('regular');
    } catch (err) {
      console.error(err);
    }
  }, [
    videoProcessing?.targetUrls?.originalVideoUrl,
    videoProcessing?.taskUuid,
    handleItemChange,
    id,
    handleSetUploadingAdditionalResponse,
    handleSetReadyToUploadAdditionalResponse,
    handleResetVideoUploadAndProcessingState,
    handleSetCurrentAdditionalResponseStep,
  ]);

  const renderUploadingState = useCallback(() => {
    let content;

    if (responseFileUploadLoading) {
      const minutesLeft = Math.floor(responseFileUploadETA / 60);
      const secondsLeft = Math.ceil(responseFileUploadETA % 60);
      const minutesLeftString =
        minutesLeft > 0
          ? minutesLeft > 1
            ? `${minutesLeft} ${t(
                'postVideo.uploadResponseForm.video.loading.minutes'
              )} `
            : `${minutesLeft} ${t(
                'postVideo.uploadResponseForm.video.loading.minute'
              )} `
          : '';
      const secondsLeftString = `${secondsLeft} ${
        secondsLeft === 1
          ? t('postVideo.uploadResponseForm.video.loading.second')
          : t('postVideo.uploadResponseForm.video.loading.seconds')
      }`;

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
                  seconds: secondsLeftString,
                  minutes: minutesLeftString,
                  progress: responseFileUploadProgress,
                })}
              </SLoadingDescription>
              {responseFileUploadProgress !== 100 ? (
                <SLoadingBottomBlockButton
                  view='secondary'
                  onClick={() => handleCancelUploadAndClearLocalFile()}
                >
                  {t('postVideo.uploadResponseForm.button.cancel')}
                </SLoadingBottomBlockButton>
              ) : null}
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
    } else if (localFile) {
      return null;
    }

    return content;
  }, [
    t,
    responseFileUploadLoading,
    responseFileUploadError,
    responseFileProcessingError,
    responseFileProcessingLoading,
    responseFileUploadETA,
    responseFileUploadProgress,
    handleCancelVideoProcessing,
    handleRetryVideoUpload,
    handleCancelUploadAndClearLocalFile,
    localFile,
  ]);

  const thumbnailButtonBottomOverriden = useMemo(
    () =>
      responses && responses?.length > 1
        ? (uiOffset || 0) + (isMobile ? 48 : 64)
        : uiOffset,
    [isMobile, responses, uiOffset]
  );

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

  useEffect(() => {
    if (responses?.length && responses?.length < 2) {
      handleUnsetEditingStories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);

  return (
    <SContainer>
      {!responseFileUploadLoading && !responseFileProcessingLoading ? (
        <PostVideoResponseUploaded
          isMuted={isMuted}
          isEditingStories={isEditingStories}
          uiOffset={uiOffset}
          handleToggleMuted={handleToggleMuted}
          handleDeleteUnuploadedAdditonalResponse={
            handleDeleteUnuploadedAdditonalResponse
          }
        />
      ) : (
        renderUploadingState()
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
        onClick={(e) => {
          // @ts-ignore
          e.target.value = null;
        }}
      />
      {currentAdditionalResponseStep === 'regular' ? (
        <SUploadVideoButton onClick={() => handleUploadButtonClick()}>
          {t('postVideo.addVideoButton')}
        </SUploadVideoButton>
      ) : null}
      {!responseFileUploadLoading &&
      !responseFileProcessingLoading &&
      responses &&
      responses?.length > 1 ? (
        <PostVideoEditStoryButton
          active={isEditingStories}
          uiOffset={uiOffset}
          handleClick={handleToggleEditingStories}
        />
      ) : null}
      {!isEditingStories &&
      !responseFileUploadLoading &&
      !responseFileProcessingLoading ? (
        <SetThumbnailButtonIconOnly
          handleClick={handleOpenEditCoverImageMenu}
          uiOffset={!isTablet ? thumbnailButtonBottomOverriden : uiOffset}
          positionLeftOverriden={
            responses && responses?.length > 1 && isTablet ? 64 : 0
          }
        />
      ) : null}
      {currentAdditionalResponseStep === 'editing' &&
      responseFileProcessingProgress === 100 ? (
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
  top: 16px;
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

  background: transparent;

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
