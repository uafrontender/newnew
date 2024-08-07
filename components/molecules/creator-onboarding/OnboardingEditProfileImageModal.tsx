import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { Area, Point } from 'react-easy-crop/types';

import getCroppedImg from '../../../utils/cropImage';

import Modal from '../../organisms/Modal';
import GoBackButton from '../GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';
import ProfileImageCropper from '../profile/ProfileImageCropper';
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import ZoomOutIcon from '../../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../../public/images/svg/icons/outlined/Plus.svg';
import Button from '../../atoms/Button';
import ImageZoomSlider from '../../atoms/profile/ProfileImageZoomSlider';
import { useAppState } from '../../../contexts/appStateContext';

interface IOnboardingEditProfileImageModal {
  isOpen: boolean;
  avatarUrlInEdit: string;
  originalProfileImageWidth: number;
  minZoom: number;
  setAvatarUrlInEdit: (value: string) => void;
  handleSetImageToSave: (value: File) => void;
  onClose: () => void;
}

const OnboardingEditProfileImageModal: React.FunctionComponent<
  IOnboardingEditProfileImageModal
> = ({
  isOpen,
  avatarUrlInEdit,
  originalProfileImageWidth,
  minZoom,
  setAvatarUrlInEdit,
  handleSetImageToSave,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-CreatorOnboarding');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Profile image
  const [cropProfileImage, setCropProfileImage] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [croppedAreaProfileImage, setCroppedAreaProfileImage] =
    useState<Area>();
  const [zoomProfileImage, setZoomProfileImage] = useState(minZoom);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetStageToEditingGeneralUnsetPicture = () => {
    onClose();
    setAvatarUrlInEdit('');
    setZoomProfileImage(minZoom);
  };

  const handleZoomOutProfileImage = () => {
    setZoomProfileImage((z) => Math.max(z - 0.2, minZoom));
  };

  const handleZoomInProfileImage = () => {
    setZoomProfileImage((z) => Math.min(z + 0.2, minZoom + 2));
  };

  const onCropCompleteProfileImage = useCallback(
    (_: any, croppedAreaPixels: Area) => {
      setCroppedAreaProfileImage(croppedAreaPixels);
    },
    []
  );

  const completeProfileImageCropAndUpdateImageToSave = useCallback(async () => {
    try {
      setIsLoading(true);
      const croppedImage = await getCroppedImg(
        avatarUrlInEdit,
        croppedAreaProfileImage!!,
        0,
        'avatarImage.jpeg'
      );
      handleSetImageToSave(croppedImage);
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, [avatarUrlInEdit, croppedAreaProfileImage, handleSetImageToSave, onClose]);

  return (
    <Modal show={isOpen} onClose={onClose}>
      <SEditPictureMenu onClick={(e) => e.stopPropagation()}>
        {isMobile ? (
          <SGoBackButtonMobile onClick={() => onClose()}>
            {t('detailsSection.editProfileImageModal.button.back')}
          </SGoBackButtonMobile>
        ) : (
          <SGoBackButtonDesktop onClick={() => onClose()}>
            <div>{t('detailsSection.editProfileImageModal.button.back')}</div>
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </SGoBackButtonDesktop>
        )}
        <ProfileImageCropper
          crop={cropProfileImage}
          zoom={zoomProfileImage}
          minZoom={minZoom}
          maxZoom={minZoom + 2}
          avatarUrlInEdit={avatarUrlInEdit}
          originalImageWidth={originalProfileImageWidth}
          disabled={isLoading}
          onCropChange={setCropProfileImage}
          onCropComplete={onCropCompleteProfileImage}
          onZoomChange={setZoomProfileImage}
        />
        <SSliderWrapper>
          <Button
            iconOnly
            size='sm'
            view='transparent'
            disabled={zoomProfileImage <= minZoom || isLoading}
            onClick={handleZoomOutProfileImage}
          >
            <InlineSvg
              svg={ZoomOutIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </Button>
          <ImageZoomSlider
            value={zoomProfileImage}
            min={minZoom}
            max={minZoom + 2}
            step={0.1}
            ariaLabel='Zoom'
            disabled={isLoading}
            onChange={(e) => setZoomProfileImage(Number(e.target.value))}
          />
          <Button
            iconOnly
            size='sm'
            view='transparent'
            disabled={zoomProfileImage >= minZoom + 2 || isLoading}
            onClick={handleZoomInProfileImage}
          >
            <InlineSvg
              svg={ZoomInIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </Button>
        </SSliderWrapper>
        <SControlsWrapperPicture>
          <Button
            view='secondary'
            disabled={isLoading}
            onClick={handleSetStageToEditingGeneralUnsetPicture}
          >
            {t('detailsSection.editProfileImageModal.button.cancel')}
          </Button>
          <Button
            id='save-image'
            withShadow
            disabled={isLoading}
            onClick={completeProfileImageCropAndUpdateImageToSave}
          >
            {t('detailsSection.editProfileImageModal.button.save')}
          </Button>
        </SControlsWrapperPicture>
      </SEditPictureMenu>
    </Modal>
  );
};

export default OnboardingEditProfileImageModal;

const SEditPictureMenu = styled.div`
  position: relative;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: max(min((100vh - 690px) / 2, 136px), 0px);
    left: calc(50% - 232px);

    width: 454px;
    height: 100%;
    max-height: 690px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.desktop} {
    top: 100px;
    left: calc(50% - 240px);

    width: 480px;
  }
`;

const SGoBackButtonMobile = styled(GoBackButton)`
  width: 100%;
  padding: 18px 16px;
`;

const SGoBackButtonDesktop = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SSliderWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    justify-content: center;

    margin-top: 24px;
    padding: 0px 24px;

    button {
      background: transparent;

      &:hover:enabled {
        background: transparent;
        cursor: pointer;
      }
      &:focus:enabled {
        background: transparent;
        cursor: pointer;
      }
    }

    input {
      margin: 0px 12px;
    }
  }
`;

const SControlsWrapperPicture = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 8px;
  }
`;
