/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { TVideoProcessingData } from '../../../../redux-store/slices/creationStateSlice';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import {
  MAX_VIDEO_DURATION,
  MAX_VIDEO_SIZE,
  MIN_VIDEO_DURATION,
} from '../../../../constants/general';

import Button from '../../../atoms/Button';
import PostVideoResponseUploadedRegular from './PostVideoResponseUploadedRegular';
import PostVideoResponseUploadedEditing from './PostVideoResponseUploadedEditing';
import Caption from '../../../atoms/Caption';
import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';
import InlineSvg from '../../../atoms/InlineSVG';

import errorIcon from '../../../../public/images/svg/icons/filled/Alert.svg';
import PostVideoEditStoryButton from '../../../atoms/decision/PostVideoEditStoryButton';

const PostBitmovinPlayer = dynamic(
  () => import('../../../atoms/BitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoResponseUploadedTab {
  postId: string;
  response: newnewapi.IVideoUrls;
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  handleToggleMuted: () => void;
  additionalResponses?: newnewapi.IVideoUrls[];
  handleAddAdditonalResponse: (newVideo: newnewapi.IVideoUrls) => void;
  handleDeleteAdditonalResponse: (videoUuid: string) => void;
  isEditingStories: boolean;
  handleToggleEditingStories: () => void;
  id: string;
  value: newnewapi.IVideoUrls;
  etaUpload: number;
  errorUpload: boolean;
  loadingUpload: boolean;
  progressUpload: number;
  etaProcessing: number;
  errorProcessing: boolean;
  loadingProcessing: boolean;
  progressProcessing: number;
  thumbnails: any;
  videoProcessing?: TVideoProcessingData;
  postStatus: TPostStatusStringified;
  onChange: (id: string, value: any) => void;
  handleCancelVideoUpload: () => void;
  handleResetVideoUploadAndProcessingState: () => void;
  handleUploadVideoNotProcessed: () => void;
}

const PostVideoResponseUploadedTab: React.FunctionComponent<
  IPostVideoResponseUploadedTab
> = ({
  postId,
  response,
  isMuted,
  soundBtnBottomOverriden,
  handleToggleMuted,
  additionalResponses,
  handleAddAdditonalResponse,
  handleDeleteAdditonalResponse,
  isEditingStories,
  handleToggleEditingStories,
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
  videoProcessing,
  onChange,
  handleCancelVideoUpload,
  handleResetVideoUploadAndProcessingState,
  handleUploadVideoNotProcessed,
}) => {
  const { t } = useTranslation('modal-Post');
  const [openedTab, setOpenedTab] = useState<'regular' | 'editing'>('regular');

  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleButtonClick = useCallback(() => {
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
    onChange(id, null);
  }, [handleCloseDeleteVideoClick, id, onChange]);

  const handleDeleteAndChangeVideo = useCallback(async () => {
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: videoProcessing?.targetUrls?.originalVideoUrl,
      });

      const res = await removeUploadedFile(payload);

      if (res.error) throw new Error('An error occurred');

      setLocalFile(null);
      onChange(id, null);

      Mixpanel.track('Post Additional Video Response Upload', {
        _stage: 'Post',
      });
      inputRef.current?.click();
    } catch (err) {
      console.error(err);
    }
  }, [id, onChange, videoProcessing?.targetUrls?.originalVideoUrl]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (!files) {
        return;
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
          onChange(id, file);
          setOpenedTab('editing');
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
      onChange(id, null);
      handleResetVideoUploadAndProcessingState();
    } catch (err) {
      console.error(err);
    }
  }, [id, onChange, videoProcessing, handleResetVideoUploadAndProcessingState]);

  const renderUploading = useCallback(() => {
    let content;

    if (loadingUpload) {
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
                time: `${etaUpload} seconds`,
                progress: progressUpload,
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
    } else if (loadingProcessing) {
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
    }

    if (progressProcessing === 100) {
      const temp = (
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
            <PostBitmovinPlayer
              id='small-thumbnail'
              innerRef={playerRef}
              resources={value}
              thumbnails={thumbnails}
              borderRadius='8px'
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
    }

    return content;
  }, [
    t,
    loadingUpload,
    errorUpload,
    errorProcessing,
    loadingProcessing,
    progressProcessing,
    handleFileChange,
    etaUpload,
    progressUpload,
    handleCancelVideoUpload,
    handleCancelVideoProcessing,
    handleRetryVideoUpload,
    localFile,
    value,
    thumbnails,
    handleDeleteVideoShow,
  ]);

  return (
    <SContainer>
      {openedTab === 'regular' ? (
        <PostVideoResponseUploadedRegular
          postId={postId}
          response={response}
          isMuted={isMuted}
          isEditingStories={isEditingStories}
          soundBtnBottomOverriden={soundBtnBottomOverriden}
          handleToggleMuted={handleToggleMuted}
          additionalResponses={additionalResponses}
          handleDeleteAdditonalResponse={handleDeleteAdditonalResponse}
        />
      ) : progressProcessing === 100 ? (
        <PostVideoResponseUploadedEditing
          postId={postId}
          response={response}
          isMuted={isMuted}
          soundBtnBottomOverriden={soundBtnBottomOverriden}
          handleToggleMuted={handleToggleMuted}
          additionalResponses={[...(additionalResponses ?? []), value]}
          handleAddAdditonalResponse={handleAddAdditonalResponse}
          handleDeleteAdditonalResponse={handleDeleteAdditonalResponse}
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
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }}
      />
      {openedTab === 'regular' ? (
        <SUploadVideoButton onClick={() => handleButtonClick()}>
          {t('postVideo.addVideoButton')}
        </SUploadVideoButton>
      ) : null}
      {openedTab === 'regular' &&
      additionalResponses &&
      additionalResponses?.length > 0 ? (
        <PostVideoEditStoryButton
          active={isEditingStories}
          bottomOverriden={soundBtnBottomOverriden}
          handleClick={handleToggleEditingStories}
        />
      ) : null}
      {openedTab === 'editing' && progressProcessing === 100 ? (
        <SUploadVideoButton onClick={() => handleDeleteAndChangeVideo()}>
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
