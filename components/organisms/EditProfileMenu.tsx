/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { isEqual } from 'lodash';
import validator from 'validator';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

import { useAppSelector } from '../../redux-store/store';

// Components
import GoBackButton from '../molecules/GoBackButton';
import InlineSvg from '../atoms/InlineSVG';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import Button from '../atoms/Button';
import DisplaynameInput from '../atoms/profile/DisplayNameInput';
import UsernameInput from '../atoms/profile/UsernameInput';
import BioTextarea from '../atoms/profile/BioTextarea';
import ProfileBackgroundInput from '../molecules/profile/ProfileBackgroundInput';
import ProfileImageInput from '../molecules/profile/ProfileImageInput';
import isImage from '../../utils/isImage';

export type TEditingStage = 'edit-general' | 'edit-profile-picture'

interface IEditProfileMenu {
  stage: TEditingStage,
  wasModified: boolean;
  handleClose: () => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
  handleSetStageToEditingProfilePicture: () => void;
  handleSetStageToEditingGeneral: () => void;
}

type ModalMenuUserData = {
  username: string;
  displayName: string;
  bio: string;
}

type TFormErrors = {
  displaynameError?: string;
  usernameError?: string;
};

const EditProfileMenu: React.FunctionComponent<IEditProfileMenu> = ({
  stage,
  wasModified,
  handleClose,
  handleSetWasModified,
  handleClosePreventDiscarding,
  handleSetStageToEditingProfilePicture,
  handleSetStageToEditingGeneral,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('profile');

  const { user, ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(ui.resizeMode);

  // Cover image
  const [coverUrl, setCoverUrl] = useState(user.userData?.coverUrl);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    displayName: user.userData?.displayName ?? '',
    username: user.userData?.username ?? '',
    bio: user.userData?.bio ?? '',
  });
  const [isDataValid, setIsDataValid] = useState(false);
  const [formErrors, setFormErrors] = useState<TFormErrors>({
    displaynameError: '',
    usernameError: '',
  });

  const handleUpdateDataInEdit = useCallback((
    key: keyof ModalMenuUserData,
    value: any,
  ) => {
    const workingData = { ...dataInEdit };
    workingData[key] = value;
    setDataInEdit({ ...workingData });
  },
  [dataInEdit, setDataInEdit]);

  // Profile image
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Profile picture
  const handleSetProfilePictureInEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files?.length === 1) {
      const file = files[0];

      if (!isImage(file.name)) return;
      if ((file.size / (1024 * 1024)) > 3) return;

      // Read uploaded file as data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (reader.result) {
          setAvatarUrlInEdit(reader.result as string);
          handleSetStageToEditingProfilePicture();
        }
      });
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      console.log(croppedArea, croppedAreaPixels);
    }, [],
  );

  // Check if data was modified
  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      displayName: user.userData?.displayName ?? '',
      username: user.userData?.username ?? '',
      bio: user.userData?.bio ?? '',
    };

    if (isEqual(dataInEdit, initialData)) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [dataInEdit, user.userData, handleSetWasModified]);

  // Check fields validity
  useEffect(() => {
    const isUsernameValid = dataInEdit.username.length >= 8
      && dataInEdit.username.length <= 15
      && validator.isAlphanumeric(dataInEdit.username)
      && validator.isLowercase(dataInEdit.username);
    const isDisplaynameValid = dataInEdit && dataInEdit!!.displayName!!.length > 0;

    if (!isDisplaynameValid || !isUsernameValid) {
      setFormErrors((errors) => {
        const errorsWorking = { ...errors };
        errorsWorking.usernameError = isUsernameValid ? '' : 'Wrong input';
        errorsWorking.displaynameError = isDisplaynameValid ? '' : 'Wrong input';
        return errorsWorking;
      });
      setIsDataValid(false);
    } else {
      setFormErrors({
        usernameError: '',
        displaynameError: '',
      });
      setIsDataValid(true);
    }
  }, [dataInEdit]);

  return (
    <SEditProfileMenu
      initial={!isMobile ? MInitial : undefined}
      animate={!isMobile ? MAnimation : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {stage === 'edit-general'
        ? (
          <>
            {isMobile ? (
              <SGoBackButtonMobile
                onClick={handleClosePreventDiscarding}
              >
                { t('EditProfileMenu.goBackBtn.general') }
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop
                onClick={handleClosePreventDiscarding}
              >
                <div>{ t('EditProfileMenu.goBackBtn.general') }</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width="24px"
                  height="24px"
                />
              </SGoBackButtonDesktop>
            )}
            <SImageInputsWrapper onDoubleClick={() => handleSetStageToEditingProfilePicture()}>
              <ProfileBackgroundInput
                pictureURL={user?.userData?.coverUrl ?? '/images/mock/profile-bg.png'}
              />
              <ProfileImageInput
                publicUrl={user.userData?.avatarUrl!!}
                handleImageInputChange={handleSetProfilePictureInEdit}
              />
            </SImageInputsWrapper>
            <STextInputsWrapper>
              <DisplaynameInput
                type="text"
                value={dataInEdit.displayName as string}
                placeholder={t('EditProfileMenu.inputs.displayName.placeholder')}
                isValid={!formErrors.displaynameError}
                onChange={(e) => handleUpdateDataInEdit('displayName', e.target.value)}
              />
              <UsernameInput
                type="text"
                value={dataInEdit.username}
                popupCaption={(
                  <UsernamePopupList
                    points={[
                      t('EditProfileMenu.inputs.username.points.1'),
                      t('EditProfileMenu.inputs.username.points.2'),
                      t('EditProfileMenu.inputs.username.points.3'),
                    ]}
                  />
                )}
                frequencyCaption={t('EditProfileMenu.inputs.username.frequencyCaption')}
                placeholder={t('EditProfileMenu.inputs.username.placeholder')}
                isValid={!formErrors.usernameError}
                onChange={(e) => handleUpdateDataInEdit('username', e.target.value)}
              />
              <BioTextarea
                maxChars={150}
                value={dataInEdit.bio}
                placeholder={t('EditProfileMenu.inputs.bio.placeholder')}
                onChange={(e) => handleUpdateDataInEdit('bio', e.target.value)}
              />
            </STextInputsWrapper>
            <SControlsWrapper>
              {!isMobile
                ? (
                  <Button
                    view="secondary"
                    onClick={handleClose}
                  >
                    { t('EditProfileMenu.cancelButton') }
                  </Button>
                ) : null}
              <Button
                disabled={!wasModified || !isDataValid}
                style={{
                  width: isMobile ? '100%' : 'initial',
                }}
              >
                { t('EditProfileMenu.saveButton') }
              </Button>
            </SControlsWrapper>
          </>
        ) : (
          <>
            {isMobile ? (
              <SGoBackButtonMobile
                onClick={handleSetStageToEditingGeneral}
              >
                { t('EditProfileMenu.goBackBtn.profilePicture') }
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop
                onClick={handleSetStageToEditingGeneral}
              >
                <div>{ t('EditProfileMenu.goBackBtn.profilePicture') }</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width="24px"
                  height="24px"
                />
              </SGoBackButtonDesktop>
            )}
            <SCropperWrapper>
              {avatarUrlInEdit && (
                <Cropper
                  image={avatarUrlInEdit}
                  objectFit="vertical-cover"
                  crop={crop}
                  cropShape="round"
                  showGrid={false}
                  zoom={zoom}
                  aspect={1}
                  style={{
                    cropAreaStyle: {
                      boxShadow: 'none',
                    },
                  }}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </SCropperWrapper>
            <SSliderWrapper>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </SSliderWrapper>
            <SControlsWrapper>
              {!isMobile
                ? (
                  <Button
                    view="secondary"
                    onClick={handleSetStageToEditingGeneral}
                  >
                    { t('EditProfileMenu.cancelButton') }
                  </Button>
                ) : null}
              <Button
                style={{
                  width: isMobile ? '100%' : 'initial',
                }}
              >
                { t('EditProfileMenu.saveButton') }
              </Button>
            </SControlsWrapper>
          </>
        )}
    </SEditProfileMenu>
  );
};

export default EditProfileMenu;

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
      stiffness: 60,
      delay: 0.2,
    },
    default: { duration: 2 },
  },
};

const SEditProfileMenu = styled(motion.div)`
  position: relative;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 136px;
    left: calc(50% - 232px);

    width: 464px;
    height: 70vh;
    max-height: 724px;

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

const SImageInputsWrapper = styled.div`
position: relative;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const STextInputsWrapper = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;

  padding-left: 16px;
  padding-right: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const SCropperWrapper = styled.div`
  position: relative;
  height: 420px;
`;

const SSliderWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    justify-content: center;

    margin-top: 24px;
    padding: 0px 24px;

    input {
      display: block;
      width: 100%;
    }
  }
`;

const SControlsWrapper = styled.div`
  display: flex;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-content: space-between;
    align-items: center;
  }
`;

const UsernamePopupList = ({ points } : { points: string[] }) => (
  <SUsernamePopupList>
    {points.map((p) => (
      <div key={p}>
        { p }
      </div>
    ))}
  </SUsernamePopupList>
);

const SUsernamePopupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: #FFFFFF;

  div {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &:before {
      content: '';
      display: block;

      position: relative;
      top: -1px;

      width: 13px;
      height: 13px;
      margin-right: 4px;

      border-radius: 50%;
      border-width: 1.5px;
      border-style: solid;
      border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
    }
  }
`;
