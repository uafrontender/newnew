import React, {
  useRef,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import InlineSVG from '../../atoms/InlineSVG';
import DeleteVideo from '../creation/DeleteVideo';

import { loadVideo } from '../../../utils/loadVideo';

import { MAX_VIDEO_SIZE, MIN_VIDEO_DURATION, MAX_VIDEO_DURATION } from '../../../constants/general';

import errorIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import Headline from '../../atoms/Headline';

const BitmovinPlayer = dynamic(() => import('../../atoms/BitmovinPlayer'), {
  ssr: false,
});

interface IPostVideoResponseUpload {
  id: string;
  eta?: number;
  value: newnewapi.IVideoUrls;
  error?: boolean;
  loading?: boolean;
  onChange: (id: string, value: any) => void;
  progress?: number;
  thumbnails: any;
}

export const PostVideoResponseUpload: React.FC<IPostVideoResponseUpload> = ({
  id,
  eta,
  value,
  error,
  loading,
  progress,
  onChange,
  thumbnails,
}) => {
  const { t } = useTranslation('decision');
  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const inputRef: any = useRef();
  const playerRef: any = useRef();
  const [localFile, setLocalFile] = useState(null);

  const handleButtonClick = useCallback(() => {
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
    handleCloseDeleteVideoClick();
    setLocalFile(null);
    onChange(id, null);
  }, [handleCloseDeleteVideoClick, id, onChange]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target?.files[0];

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(t('PostVideo.UploadResponseForm.video.error.maxSize'));
    } else {
      const media: any = await loadVideo(file);

      if (media.duration < MIN_VIDEO_DURATION) {
        toast.error(t('PostVideo.UploadResponseForm.video.error.minLength'));
      } else if (media.duration > MAX_VIDEO_DURATION) {
        toast.error(t('PostVideo.UploadResponseForm.video.error.maxLength'));
      } else {
        setLocalFile(file);
        onChange(id, file);
      }
    }
  }, [id, onChange, t]);
  const handleRetryVideoUpload = useCallback(() => {
    onChange(id, localFile);
  }, [id, localFile, onChange]);
  const handleCancelVideoUpload = useCallback(() => {
    setLocalFile(null);
    onChange(id, null);
  }, [id, onChange]);

  const renderContent = useCallback(() => {
    let content = (
      <SDropBox
        htmlFor="file"
      >
        <input
          id="file"
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept="video/*"
          multiple={false}
          onChange={handleFileChange}
        />
        <SHeadline
          variant={6}
        >
          {t('PostVideo.UploadResponseForm.fileUpload.title_1')}
            <br />
          {t('PostVideo.UploadResponseForm.fileUpload.title_2')}
        </SHeadline>
        <SButton
          id="upload-response-btn"
          view="primaryGrad"
          onClick={handleButtonClick}
        >
          {t('PostVideo.UploadResponseForm.fileUpload.button')}
        </SButton>
        <SPlaceholder weight={600} variant={2}>
          {t('PostVideo.UploadResponseForm.fileUpload.description')}
        </SPlaceholder>
      </SDropBox>
    );

    if (loading) {
      content = (
        <SLoadingBox>
          <SLoadingTitle variant={3} weight={600}>
            {t('PostVideo.UploadResponseForm.video.loading.title')}
          </SLoadingTitle>
          <SLoadingDescription variant={2} weight={600}>
            {t('PostVideo.UploadResponseForm.video.loading.description')}
          </SLoadingDescription>
          <SLoadingBottomBlock>
            <SLoadingDescription variant={2} weight={600}>
              {t('PostVideo.UploadResponseForm.video.loading.process', {
                time: `${eta} seconds`,
                progress,
              })}
            </SLoadingDescription>
            <SLoadingBottomBlockButton
              view="secondary"
              onClick={handleCancelVideoUpload}
              disabled={!value?.hlsStreamUrl}
            >
              {t('PostVideo.UploadResponseForm.button.cancel')}
            </SLoadingBottomBlockButton>
          </SLoadingBottomBlock>
          <SLoadingProgress>
            <SLoadingProgressFilled progress={progress} />
          </SLoadingProgress>
        </SLoadingBox>
      );
    } else if (error) {
      content = (
        <SErrorBox>
          <SErrorTitleWrapper>
            <SInlineSVG
              svg={errorIcon}
              width="16px"
              height="16px"
            />
            <SErrorTitle variant={3} weight={600}>
              {t('PostVideo.UploadResponseForm.video.error.title')}
            </SErrorTitle>
          </SErrorTitleWrapper>
          <SLoadingDescription variant={2} weight={600}>
            {t('PostVideo.UploadResponseForm.video.error.description')}
          </SLoadingDescription>
          <SErrorBottomBlock>
            <SLoadingBottomBlockButton
              view="secondary"
              onClick={handleCancelVideoUpload}
            >
              {t('PostVideo.UploadResponseForm.button.cancel')}
            </SLoadingBottomBlockButton>
            <Button
              view="primaryGrad"
              onClick={handleRetryVideoUpload}
              disabled={!localFile}
            >
              {t('PostVideo.UploadResponseForm.button.retry')}
            </Button>
          </SErrorBottomBlock>
        </SErrorBox>
      );
    } else if (progress === 100) {
      content = (
        <SFileBox>
          <input
            id="file"
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            accept="video/*"
            multiple={false}
            onChange={handleFileChange}
          />
          <SPlayerWrapper>
            <BitmovinPlayer
              id="small-thumbnail"
              innerRef={playerRef}
              resources={value}
              thumbnails={thumbnails}
              borderRadius="8px"
            />
          </SPlayerWrapper>
          <SButtonsContainer>
            <SButtonsContainerLeft>
              <SVideoButton danger onClick={handleDeleteVideoShow}>
                {t('PostVideo.UploadResponseForm.video.deleteFile')}
              </SVideoButton>
            </SButtonsContainerLeft>
          </SButtonsContainer>
        </SFileBox>
      );
    }

    return content;
  }, [
    t,
    eta,
    value,
    error,
    loading,
    progress,
    localFile,
    thumbnails,
    handleFileChange,
    handleButtonClick,
    handleDeleteVideoShow,
    handleRetryVideoUpload,
    handleCancelVideoUpload,
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

PostVideoResponseUpload.defaultProps = {
  eta: 0,
  error: false,
  loading: false,
  progress: 0,
};

const SWrapper = styled.div`
  width: 100%;
  height: 100%;
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
    border: 1px solid ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.outlines1 : 'transparent')};
    padding: 23px;
    overflow: hidden;
    background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
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
  color: ${(props) => (props.danger ? props.theme.colorsThemed.accent.error : props.theme.colorsThemed.text.secondary)};
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
  padding: 0;

  &:focus:enabled,
  &:hover:enabled {
    background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
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
