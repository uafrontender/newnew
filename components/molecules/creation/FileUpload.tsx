import React, {
  useRef,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import FullPreview from './FullPreview';
import DeleteVideo from './DeleteVideo';
import ThumbnailPreviewEdit from './ThumbnailPreviewEdit';

import { MAX_VIDEO_SIZE, MIN_VIDEO_DURATION, MAX_VIDEO_DURATION } from '../../../constants/general';

interface IFileUpload {
  id: string;
  value: string;
  onChange: (id: string, value: any) => void;
  thumbnails: any;
}

export const FileUpload: React.FC<IFileUpload> = (props) => {
  const {
    id,
    value,
    onChange,
    thumbnails,
  } = props;
  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const [showThumbnailEdit, setShowThumbnailEdit] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const { t } = useTranslation('creation');
  const inputRef: any = useRef();

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handleFullPreview = useCallback(() => {
    setShowFullPreview(true);
  }, []);
  const handleCloseFullPreviewClick = useCallback(() => {
    setShowFullPreview(false);
  }, []);
  const handleEditThumb = useCallback(() => {
    setShowThumbnailEdit(true);
  }, []);
  const handleCloseThumbnailEditClick = useCallback(() => {
    setShowThumbnailEdit(false);
  }, []);
  const handleDeleteVideoShow = useCallback(() => {
    setShowVideoDelete(true);
  }, []);
  const handleCloseDeleteVideoClick = useCallback(() => {
    setShowVideoDelete(false);
  }, []);
  const handleDeleteVideo = useCallback(() => {
    handleCloseDeleteVideoClick();
    onChange(id, null);
  }, [handleCloseDeleteVideoClick, id, onChange]);
  const handlePreviewEditSubmit = useCallback((params) => {
    handleCloseThumbnailEditClick();
    onChange('thumbnailParameters', params);
  }, [handleCloseThumbnailEditClick, onChange]);
  const handleFileChange = useCallback((e) => {
    const file = e.target?.files[0];

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(t('secondStep.video.error.maxSize'));
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (reader.result) {
          // @ts-ignore
          const media = new Audio(reader.result);
          media.onloadedmetadata = () => {
            if (media.duration < MIN_VIDEO_DURATION) {
              toast.error(t('secondStep.video.error.minLength'));
            } else if (media.duration > MAX_VIDEO_DURATION) {
              toast.error(t('secondStep.video.error.maxLength'));
            } else {
              onChange(id, {
                url: reader.result,
                name: file.name,
                type: file.type,
              });
            }
          };
        }
      });
    }
  }, [id, onChange, t]);

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
      {value ? (
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
          <SVideo
            src={value}
            onClick={handleButtonClick}
          />
          <SButtonsContainer>
            <SButtonsContainerLeft>
              <SVideoButton onClick={handleEditThumb}>
                {t('secondStep.video.setThumbnail')}
              </SVideoButton>
              <SVideoButton danger onClick={handleDeleteVideoShow}>
                {t('secondStep.video.deleteFile')}
              </SVideoButton>
            </SButtonsContainerLeft>
            <div>
              <SVideoButton onClick={handleFullPreview}>
                {t('secondStep.video.previewFull')}
              </SVideoButton>
            </div>
          </SButtonsContainer>
        </SFileBox>
      ) : (
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
          <SPlaceholder weight={600} variant={2}>
            {t('secondStep.fileUpload.description')}
          </SPlaceholder>
          <SButton
            view="primaryGrad"
            onClick={handleButtonClick}
          >
            {t('secondStep.fileUpload.button')}
          </SButton>
        </SDropBox>
      )}
    </SWrapper>
  );
};

export default FileUpload;

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
    border: 1px solid ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.outlines1 : 'transparent')};
    padding: 23px;
    overflow: hidden;
    background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
    border-radius: 16px;
  }
`;

const SVideo = styled.video`
  width: 64px;
  height: auto;
  overflow: hidden;
  border-radius: 8px;
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
