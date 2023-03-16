import React, { useRef, useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import InlineSVG from '../../../atoms/InlineSVG';
import DeleteVideo from '../../creation/DeleteVideo';

import { MAX_VIDEO_SIZE } from '../../../../constants/general';

import errorIcon from '../../../../public/images/svg/icons/filled/Alert.svg';
// import spinnerIcon from '../../../public/images/svg/icons/filled/Spinner.svg';
import Headline from '../../../atoms/Headline';
import {
  removeUploadedFile,
  stopVideoProcessing,
} from '../../../../api/endpoints/upload';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';

const VideojsPlayer = dynamic(() => import('../../../atoms/VideojsPlayer'), {
  ssr: false,
});

interface IPostVideoResponseUpload {
  id: string;
}

export const PostVideoResponseUpload: React.FC<IPostVideoResponseUpload> = ({
  id,
}) => {
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const { postStatus } = usePostInnerState();
  const {
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
  } = usePostModerationResponsesContext();
  const value = useMemo(() => videoProcessing?.targetUrls, [videoProcessing]);

  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const handleButtonClick = useCallback(() => {
    Mixpanel.track('Post Video Response Upload', {
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
    playerRef.current.play().catch(() => {
      setShowPlayButton(true);
    });
    setShowPlayButton(true);
  }, []);

  const handleDeleteVideo = useCallback(() => {
    Mixpanel.track('Post Video Response Delete', {
      _stage: 'Post',
    });
    handleCloseDeleteVideoClick();
    setLocalFile(null);
    handleItemChange(id, null);
  }, [handleCloseDeleteVideoClick, id, handleItemChange]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (!files) {
        return;
      }

      const file = files[0];

      if (file.size > MAX_VIDEO_SIZE) {
        showErrorToastCustom(
          t('postVideo.uploadResponseForm.video.error.maxSize')
        );
      } else {
        setLocalFile(file);
        handleItemChange(id, file);
      }
    },
    [showErrorToastCustom, t, handleItemChange, id]
  );

  const handleRetryVideoUpload = useCallback(() => {
    handleItemChange(id, localFile);
  }, [id, localFile, handleItemChange]);

  const handleCancelUploadAndClearLocalFile = useCallback(() => {
    handleCancelVideoUpload();
    setLocalFile(null);
  }, [handleCancelVideoUpload]);

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
      handleResetVideoUploadAndProcessingState();
    } catch (err) {
      console.error(err);
    }
  }, [
    id,
    handleItemChange,
    videoProcessing,
    handleResetVideoUploadAndProcessingState,
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
          onChange={(e) => {
            handleFileChange(e);
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
        />
        <SHeadline variant={6}>
          {t('postVideo.uploadResponseForm.fileUpload.title_1')}
          <br />
          {t('postVideo.uploadResponseForm.fileUpload.title_2')}
        </SHeadline>
        <SButton
          id='upload-response-button'
          view='primaryGrad'
          onClick={handleButtonClick}
        >
          {t('postVideo.uploadResponseForm.fileUpload.button')}
        </SButton>
        <SPlaceholder weight={600} variant={2}>
          {t('postVideo.uploadResponseForm.fileUpload.description')}
        </SPlaceholder>
      </SDropBox>
    );

    if (responseFileUploadLoading) {
      content = (
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
      );
    } else if (responseFileUploadError || responseFileProcessingError) {
      content = (
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
      );
    } else if (postStatus === 'processing_response') {
      content = (
        <SLoadingBox>
          <SLoadingTitleWithEllipseAnimated variant={3} weight={600}>
            {t('postVideo.uploadResponseForm.video.processingPublished.title')}
          </SLoadingTitleWithEllipseAnimated>
          <SLoadingDescription variant={2} weight={600}>
            {t(
              'postVideo.uploadResponseForm.video.processingPublished.description'
            )}
          </SLoadingDescription>
        </SLoadingBox>
      );
    } else if (responseFileProcessingLoading) {
      content = (
        <SLoadingBox>
          <SLoadingTitleWithEllipseAnimated variant={3} weight={600}>
            {t('postVideo.uploadResponseForm.video.processing.title')}
          </SLoadingTitleWithEllipseAnimated>
          <SLoadingDescription variant={2} weight={600}>
            {t('postVideo.uploadResponseForm.video.processing.description')}
          </SLoadingDescription>
          <SLoadingBottomBlock />
        </SLoadingBox>
      );
    } else if (responseFileProcessingProgress === 100) {
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
            <VideojsPlayer
              id='small-thumbnail'
              innerRef={playerRef}
              resources={value}
              borderRadius='8px'
              showPlayButton={showPlayButton}
            />
          </SPlayerWrapper>
          <SButtonsContainer>
            <SButtonsContainerLeft>
              <SVideoButton danger onClick={handleDeleteVideoShow}>
                {t('postVideo.uploadResponseForm.video.deleteFile')}
              </SVideoButton>
            </SButtonsContainerLeft>
          </SButtonsContainer>
        </SFileBox>
      );
    } else if (localFile) {
      return null;
    }

    return content;
  }, [
    t,
    handleButtonClick,
    responseFileUploadLoading,
    responseFileUploadError,
    responseFileProcessingError,
    postStatus,
    responseFileProcessingLoading,
    responseFileProcessingProgress,
    localFile,
    handleFileChange,
    responseFileUploadETA,
    responseFileUploadProgress,
    handleCancelUploadAndClearLocalFile,
    handleCancelVideoProcessing,
    handleRetryVideoUpload,
    value,
    handleDeleteVideoShow,
    showPlayButton,
  ]);

  return (
    <SWrapper>
      <DeleteVideo
        open={showVideoDelete}
        handleClose={handleCloseDeleteVideoClick}
        handleSubmit={handleDeleteVideo}
      />
      {renderContent()}
    </SWrapper>
  );
};

export default PostVideoResponseUpload;

PostVideoResponseUpload.defaultProps = {};

const SWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  background: ${(props) => props.theme.colorsThemed.background.tertiary};
`;

const SDropBox = styled.label`
  width: 100%;
  height: 100%;
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

const SHeadline = styled(Headline)`
  text-align: center;

  margin-bottom: 12px;
`;

const SPlaceholder = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-bottom: 12px;
`;

const SButton = styled(Button)`
  cursor: copy;

  margin-bottom: 16px;
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

  margin-left: 16px;
  margin-right: 16px;

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

// const SLoadingTitle = styled(Text)`
//   display: flex;
//   align-items: center;
//   margin-bottom: 6px;
//   flex-direction: row;
// `;

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
  padding: 0;

  background: transparent;

  &:focus:enabled,
  &:hover:enabled {
    background: transparent;
  }
`;

// const SLoadingPublishButton = styled(Button)`
//   margin-left: auto;

//   padding: 10px;
// `;

const SLoadingProgress = styled.div`
  width: 100%;
  height: 6px;
  overflow: hidden;
  position: relative;
  margin-top: 6px;
  background: ${(props) => props.theme.colorsThemed.background.outlines1};
  border-radius: 16px;
`;

// const SSpinnerWrapper = styled.div`
//   @keyframes spin {
//     from {
//       transform: rotate(0deg);
//     }
//     to {
//       transform: rotate(360deg);
//     }
//   }

//   div {
//     animation: spin 0.7s linear infinite;
//   }
// `;

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
