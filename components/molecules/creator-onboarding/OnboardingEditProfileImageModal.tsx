import React, { useCallback, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { Area, Point } from 'react-easy-crop/types';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import getCroppedImg from '../../../utils/cropImage';
import { getImageUploadUrl } from '../../../api/endpoints/upload';

import Modal from '../../organisms/Modal';
import GoBackButton from '../GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';
import ProfileImageCropper from '../profile/ProfileImageCropper';
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import ZoomOutIcon from '../../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../../public/images/svg/icons/outlined/Plus.svg';
import Button from '../../atoms/Button';
import { updateMe } from '../../../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect, setUserData } from '../../../redux-store/slices/userStateSlice';
import ProfileImageZoomSlider from '../../atoms/profile/ProfileImageZoomSlider';

interface IOnboardingEditProfileImageModal {
  isOpen: boolean;
  avatarUrlInEdit: string;
  originalProfileImageWidth: number;
  setAvatarUrlInEdit: (value: string) => void;
  onClose: () => void;
}

const OnboardingEditProfileImageModal: React.FunctionComponent<
IOnboardingEditProfileImageModal> = ({
  isOpen,
  avatarUrlInEdit,
  originalProfileImageWidth,
  setAvatarUrlInEdit,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('creator-onboarding');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Profile image
  const [cropProfileImage, setCropProfileImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaProfileImage, setCroppedAreaProfileImage] = useState<Area>();
  const [zoomProfileImage, setZoomProfileImage] = useState(1);
  const [updateProfileImageLoading, setUpdateProfileImageLoading] = useState(false);

  const handleSetStageToEditingGeneralUnsetPicture = () => {
    onClose();
    setAvatarUrlInEdit('');
    setZoomProfileImage(1);
  };

  const handleZoomOutProfileImage = () => {
    if (zoomProfileImage <= 1) return;

    setZoomProfileImage((z) => {
      if (zoomProfileImage - 0.2 <= 1) return 1;
      return z - 0.2;
    });
  };

  const handleZoomInProfileImage = () => {
    if (zoomProfileImage >= 3) return;

    setZoomProfileImage((z) => {
      if (zoomProfileImage + 0.2 >= 3) return 3;
      return z + 0.2;
    });
  };

  const onCropCompleteProfileImage = useCallback(
    (_, croppedAreaPixels: Area) => {
      setCroppedAreaProfileImage(croppedAreaPixels);
    }, [],
  );

  const completeProfileImageCropAndSave = useCallback(async () => {
    try {
      setUpdateProfileImageLoading(true);
      const croppedImage = await getCroppedImg(
        avatarUrlInEdit,
        croppedAreaProfileImage!!,
        0,
        'avatarImage.jpeg',
      );

      // Get upload and public URLs
      const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
        filename: croppedImage.name,
      });

      const res = await getImageUploadUrl(
        imageUrlPayload,
      );

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'An error occured');

      const uploadResponse = await fetch(
        res.data.uploadUrl,
        {
          method: 'PUT',
          body: croppedImage,
          headers: {
            'Content-Type': 'image/png',
          },
        },
      );

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const updateMePayload = new newnewapi.UpdateMeRequest({
        avatarUrl: res.data.publicUrl,
      });

      const updateMeRes = await updateMe(
        updateMePayload,
      );

      if (!updateMeRes.data || updateMeRes.error) throw new Error('Request failed');

      // Update Redux state
      dispatch(setUserData({
        ...user.userData,
        avatarUrl: updateMeRes.data.me?.avatarUrl,
      }));

      setUpdateProfileImageLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setUpdateProfileImageLoading(false);
      if ((err as Error).message === 'No token') {
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
      }
    }
  }, [
    croppedAreaProfileImage,
    avatarUrlInEdit, onClose, dispatch,
    user.userData,
  ]);

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
    >
      <SEditPictureMenu
        initial={MInitial}
        animate={MAnimation}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile ? (
          <SGoBackButtonMobile
            onClick={() => onClose()}
          >
            { t('DetailsSection.EditProfileImageModal.goBackButton') }
          </SGoBackButtonMobile>
        ) : (
          <SGoBackButtonDesktop
            onClick={() => onClose()}
          >
            <div>{ t('DetailsSection.EditProfileImageModal.goBackButton') }</div>
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </SGoBackButtonDesktop>
        )}
        <ProfileImageCropper
          crop={cropProfileImage}
          zoom={zoomProfileImage}
          avatarUrlInEdit={avatarUrlInEdit}
          originalImageWidth={originalProfileImageWidth}
          disabled={updateProfileImageLoading}
          onCropChange={setCropProfileImage}
          onCropComplete={onCropCompleteProfileImage}
          onZoomChange={setZoomProfileImage}
        />
        <SSliderWrapper>
          <Button
            iconOnly
            size="sm"
            view="transparent"
            disabled={zoomProfileImage <= 1 || updateProfileImageLoading}
            onClick={handleZoomOutProfileImage}
          >
            <InlineSvg
              svg={ZoomOutIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </Button>
          <ProfileImageZoomSlider
            value={zoomProfileImage}
            min={1}
            max={3}
            step={0.1}
            ariaLabel="Zoom"
            disabled={updateProfileImageLoading}
            onChange={(e) => setZoomProfileImage(Number(e.target.value))}
          />
          <Button
            iconOnly
            size="sm"
            view="transparent"
            disabled={zoomProfileImage >= 3 || updateProfileImageLoading}
            onClick={handleZoomInProfileImage}
          >
            <InlineSvg
              svg={ZoomInIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </Button>
        </SSliderWrapper>
        <SControlsWrapperPicture>
          <Button
            view="secondary"
            disabled={updateProfileImageLoading}
            onClick={handleSetStageToEditingGeneralUnsetPicture}
          >
            { t('DetailsSection.EditProfileImageModal.cancelButton') }
          </Button>
          <Button
            withShadow
            disabled={updateProfileImageLoading}
            onClick={completeProfileImageCropAndSave}
          >
            { t('DetailsSection.EditProfileImageModal.saveButton') }
          </Button>
        </SControlsWrapperPicture>
      </SEditPictureMenu>
    </Modal>
  );
};

export default OnboardingEditProfileImageModal;

const SEditPictureMenu = styled(motion.div)`
  position: relative;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 136px;
    left: calc(50% - 232px);

    width: 464px;
    height: 72vh;
    max-height: 684px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.desktop} {
    top: 100px;
    left: calc(50% - 240px);

    width: 480px;
  }
`;

const MInitial = {
  opacity: 0,
  y: 1000,
};

const MAnimation = {
  opacity: 1,
  y: 0,
  transition: {
    opacity: {
      duration: 0.1,
      delay: 0.1,
    },
    y: {
      type: 'spring',
      stiffness: 50,
      delay: 0.2,
    },
    default: { duration: 2 },
  },
};

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
