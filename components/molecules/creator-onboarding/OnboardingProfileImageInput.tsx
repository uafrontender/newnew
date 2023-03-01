import React, { useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSvg from '../../atoms/InlineSVG';
import Button from '../../atoms/Button';

import DownloadIcon from '../../../public/images/svg/icons/outlined/Upload.svg';
import { useAppState } from '../../../contexts/appStateContext';

interface IOnboardingProfileImageInput {
  id?: string;
  imageInEditUrl: string;
  handleChangeImageInEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OnboardingProfileImageInput: React.FunctionComponent<
  IOnboardingProfileImageInput
> = ({ id, imageInEditUrl, handleChangeImageInEdit }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-CreatorOnboarding');
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const imageInputRef = useRef<HTMLInputElement>();

  return (
    <SContainer>
      <SLabel>{t('detailsSection.form.profilePicture.label')}</SLabel>
      <SInputContainer>
        {imageInEditUrl && (
          <SProfileImage>
            <img alt='Profile avatar' src={imageInEditUrl} draggable={false} />
          </SProfileImage>
        )}
        <SUploadButton
          view='secondary'
          onClick={() => imageInputRef.current?.click()}
        >
          <InlineSvg
            svg={DownloadIcon}
            width='24px'
            height='24px'
            fill={theme.colorsThemed.text.primary}
          />
          {!imageInEditUrl
            ? t('detailsSection.form.profilePicture.button.upload')
            : t('detailsSection.form.profilePicture.button.uploadNew')}
        </SUploadButton>
        <SImageInput
          id={id}
          type='file'
          accept='image/*'
          multiple={false}
          ref={(el) => {
            imageInputRef.current = el!!;
          }}
          onChange={(e) => {
            handleChangeImageInEdit(e);
            if (imageInputRef.current) {
              imageInputRef.current.value = '';
            }
          }}
        />
      </SInputContainer>
      <SCaption>
        {isMobileOrTablet
          ? t('detailsSection.form.profilePicture.captionMobile')
          : t('detailsSection.form.profilePicture.captionDesktop')}
      </SCaption>
    </SContainer>
  );
};

export default OnboardingProfileImageInput;

const SContainer = styled.div`
  position: relative;
`;

const SLabel = styled.label`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 12px;
`;

const SCaption = styled.span`
  display: block;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-top: 12px;
  margin-bottom: 38px;
`;

const SInputContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 12px;
  }
`;

const SImageInput = styled.input`
  visibility: hidden;
  display: none;
`;

const SUploadButton = styled(Button)`
  span {
    display: flex;
    gap: 4px;
    font-weight: 600;
  }
`;

const SProfileImage = styled.div`
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  width: 48px;
  height: 48px;

  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  margin-right: 16px;

  img {
    display: block;
    width: 48px;
    height: 48px;
  }

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
