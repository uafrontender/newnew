import React, {
  useRef,
  useState,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import DeleteVideo from './DeleteVideo';
import ThumbnailPreview from './ThumbnailPreview';
import ThumbnailPreviewEdit from './ThumbnailPreviewEdit';

import { useAppSelector } from '../../../redux-store/store';

interface IFileUpload {
  id: string;
  value: any;
  onChange: (id: string, value: any) => void;
}

export const FileUpload: React.FC<IFileUpload> = (props) => {
  const {
    id,
    value,
    onChange,
  } = props;
  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const [showThumbnailEdit, setShowThumbnailEdit] = useState(false);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
  const { t } = useTranslation('creation');
  const inputRef: any = useRef();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handlePreviewThumb = useCallback(() => {
    setShowThumbnailPreview(true);
  }, []);
  const handleCloseThumbnailPreviewClick = useCallback(() => {
    setShowThumbnailPreview(false);
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
    onChange(id, {});
  }, [handleCloseDeleteVideoClick, id, onChange]);
  const handleFileChange = useCallback((e) => {
    const file = e.target?.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      if (reader.result) {
        onChange(id, {
          url: reader.result,
          name: file.name,
          type: file.type,
        });
      }
    });
  }, [id, onChange]);

  return (
    <SWrapper>
      {!isMobile && (
        <STitle variant={1} weight={700}>
          {t('secondStep.fileUpload.title')}
        </STitle>
      )}
      {isMobile && (
        <DeleteVideo
          open={showVideoDelete}
          handleClose={handleCloseDeleteVideoClick}
          handleSubmit={handleDeleteVideo}
        />
      )}
      {isMobile && (
        <ThumbnailPreview
          open={showThumbnailPreview}
          value={value}
          handleClose={handleCloseThumbnailPreviewClick}
        />
      )}
      {isMobile && (
        <ThumbnailPreviewEdit
          open={showThumbnailEdit}
          value={value}
          handleClose={handleCloseThumbnailEditClick}
        />
      )}
      {value?.name ? (
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
            src={value.url}
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
              <SVideoButton onClick={handlePreviewThumb}>
                {t('secondStep.video.previewThumbnail')}
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

const STitle = styled(Caption)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
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
