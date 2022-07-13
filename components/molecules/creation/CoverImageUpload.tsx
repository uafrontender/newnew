import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';
import styled from 'styled-components';
import {
  setCustomCoverImageUrl,
  unsetCustomCoverImageUrl,
} from '../../../redux-store/slices/creationStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import isImage from '../../../utils/isImage';
import resizeImage from '../../../utils/resizeImage';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';

const CoverImageUpload: React.FunctionComponent = () => {
  const { t } = useTranslation('page-Creation');
  const dispatch = useAppDispatch();
  const { customCoverImageUrl } = useAppSelector((state) => state.creation);

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

          dispatch(setCustomCoverImageUrl(properlySizedImage.url));
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
            onClick={() => dispatch(unsetCustomCoverImageUrl({}))}
          >
            {t('secondStep.video.coverImage.uploadCoverImage.deleteBtn')}
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
            {t('secondStep.video.coverImage.uploadCoverImage.caption')}
          </SCaption>
          <SUploadButton
            view='secondary'
            onClick={() => imageInputRef.current?.click()}
          >
            {t('secondStep.video.coverImage.uploadCoverImage.uploadBtn')}
          </SUploadButton>
        </SSetCoverImageLabel>
      )}
    </SWrapper>
  );
};

export default CoverImageUpload;

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

  margin-left: auto;
  margin-right: auto;

  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 124px;
  }
`;
