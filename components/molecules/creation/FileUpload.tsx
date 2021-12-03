import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import { useAppSelector } from '../../../redux-store/store';

export const FileUpload = () => {
  const { t } = useTranslation('creation');
  const [file, setFile] = useState();
  const inputRef: any = useRef();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleButtonClick = useCallback(() => {
    inputRef.current.click();
  }, []);
  const handleFileChange = useCallback((e) => {
    setFile(e.target?.files[0]);
  }, []);

  return (
    <SWrapper>
      {!isMobile && (
        <STitle variant={1} weight={700}>
          {t('secondStep.fileUpload.title')}
        </STitle>
      )}
      {file ? (
        <SFileBox>
          File was uploaded
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

const SFileBox = styled.div``;
