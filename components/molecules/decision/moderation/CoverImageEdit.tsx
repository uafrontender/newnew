import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';
import styled from 'styled-components';

import isImage from '../../../../utils/isImage';
import resizeImage from '../../../../utils/resizeImage';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';

interface ICoverImageEdit {
  customCoverImageUrl?: string;
  handleSetCustomCoverImageUrl: (
    newImageUrl: string,
    originalImageWidth: number
  ) => void;
  handleUnsetCustomCoverImageUrl: () => void;
}

const CoverImageEdit: React.FunctionComponent<ICoverImageEdit> = ({
  customCoverImageUrl,
  handleSetCustomCoverImageUrl,
  handleUnsetCustomCoverImageUrl,
}) => {
  const { t } = useTranslation('modal-Post');

  const imageInputRef = useRef<HTMLInputElement>();

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files?.length === 1) {
      const file = files[0];

      if (!isImage(file.name)) return;
      // if ((file.size / (1024 * 1024)) > 3) return;

      // Read uploaded file as data URL
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.addEventListener('load', async () => {
        if (reader.result) {
          const imageUrl = reader.result as string;
          const properlySizedImage = await resizeImage(imageUrl, 1000);

          handleSetCustomCoverImageUrl(
            properlySizedImage.url,
            properlySizedImage.width
          );
        }
      });
    }
  };

  return (
    <SWrapper>
      {customCoverImageUrl ? (
        <SSetCoverImageLabel>
          <SCoverPreview alt='cover' src={customCoverImageUrl} />
          <SDeleteButton
            view='transparent'
            onClick={() => handleUnsetCustomCoverImageUrl()}
          >
            {t('postVideoCoverImageEdit.uploadCoverImage.deleteBtn')}
          </SDeleteButton>
        </SSetCoverImageLabel>
      ) : (
        <SSetCoverImageLabel>
          <SImageInput
            type='file'
            accept='image/*'
            multiple={false}
            ref={(el) => {
              imageInputRef.current = el!!;
            }}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              handleImageInputChange(e);
              if (imageInputRef.current) {
                imageInputRef.current.value = '';
              }
            }}
          />
          <SCaption variant={2} weight={700}>
            {t('postVideoCoverImageEdit.uploadCoverImage.caption')}
          </SCaption>
          <SUploadButton
            view='secondary'
            onClick={() => imageInputRef.current?.click()}
          >
            {t('postVideoCoverImageEdit.uploadCoverImage.uploadBtn')}
          </SUploadButton>
        </SSetCoverImageLabel>
      )}
    </SWrapper>
  );
};

CoverImageEdit.defaultProps = {
  customCoverImageUrl: undefined,
};

export default CoverImageEdit;

const SWrapper = styled.div`
  min-height: 72px;
  width: 100%;

  border-radius: 16px;
  padding: 16px 16px;

  margin-bottom: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SSetCoverImageLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SCaption = styled(Caption)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SUploadButton = styled(Button)``;

const SDeleteButton = styled(Button)`
  background: transparent;
`;

const SImageInput = styled.input`
  display: none;
`;

const SCoverPreview = styled.img`
  width: 64px;
  height: 108px;

  object-fit: cover;

  border-radius: 12px;

  margin-right: auto;

  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 124px;
  }
`;
