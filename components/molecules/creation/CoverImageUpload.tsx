import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../../redux-store/store';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';

const CoverImageUpload: React.FunctionComponent = () => {
  const { t } = useTranslation('creation');
  const { customCoverImageUrl } = useAppSelector((state) => state.creation);

  return (
    <SWrapper>
      {customCoverImageUrl ? (
        <img alt='cover' src={customCoverImageUrl} />
      ) : (
        <SSetCoverImageForm>
          <SCaption variant={2}>{t('uploadCoverImage.caption')}</SCaption>
          <SUploadButton>{t('uploadCoverImage.uploadBtn')}</SUploadButton>
        </SSetCoverImageForm>
      )}
    </SWrapper>
  );
};

export default CoverImageUpload;

const SWrapper = styled.div`
  min-height: 72px;
  width: 100%;

  border-radius: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SSetCoverImageForm = styled.div`
  display: flex;
`;

const SCaption = styled(Caption)``;

const SUploadButton = styled(Button)``;
