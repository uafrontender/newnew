/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { isEqual } from 'lodash';
import validator from 'validator';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setUserData } from '../../redux-store/slices/userStateSlice';

// Components
import Button from '../atoms/Button';
import InlineSvg from '../atoms/InlineSVG';
import GoBackButton from '../molecules/GoBackButton';
import BioTextarea from '../atoms/profile/BioTextarea';
import UsernameInput from '../atoms/profile/UsernameInput';
import DisplaynameInput from '../atoms/profile/DisplayNameInput';
import ProfileImageInput from '../molecules/profile/ProfileImageInput';
import ProfileBackgroundInput from '../molecules/profile/ProfileBackgroundInput';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import ZoomOutIcon from '../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../public/images/svg/icons/outlined/Plus.svg';

// Utils
import isImage from '../../utils/isImage';
import getCroppedImg from '../../utils/cropImage';
import ProfileImageCropper from '../molecules/profile/ProfileImageCropper';
import ProfileImageZoomSlider from '../atoms/profile/ProfileImageZoomSlider';

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

  const dispatch = useAppDispatch();
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
  const [originalImageWidth, setOriginalImageWidth] = useState(0);
  const [originalImageHeight, setOriginalImageHeight] = useState(0);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = useState<Area>();
  const [zoom, setZoom] = useState(1);

  // Profile picture
  const handleSetProfilePictureInEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files?.length === 1) {
      const file = files[0];

      if (!isImage(file.name)) return;
      // if ((file.size / (1024 * 1024)) > 3) return;

      // Read uploaded file as data URL
      const reader = new FileReader();
      const img = new Image();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (reader.result) {
          setAvatarUrlInEdit(reader.result as string);
          handleSetStageToEditingProfilePicture();

          img.src = reader.result as string;

          // eslint-disable-next-line func-names
          img.addEventListener('load', function () {
            // eslint-disable-next-line react/no-this-in-sfc
            setOriginalImageWidth(this.width);
            // eslint-disable-next-line react/no-this-in-sfc
            setOriginalImageHeight(this.height);
          });
        }
      });
    }
  };

  const handleSetStageToEditingGeneralUnsetPicture = () => {
    handleSetStageToEditingGeneral();
    setAvatarUrlInEdit('');
    setZoom(1);
  };

  const handleZoomOut = () => {
    if (zoom <= 1) return;

    setZoom((z) => {
      if (zoom - 0.2 <= 1) return 1;
      return z - 0.2;
    });
  };

  const handleZoomIn = () => {
    if (zoom >= 3) return;

    setZoom((z) => {
      if (zoom + 0.2 >= 3) return 3;
      return z + 0.2;
    });
  };

  const onCropComplete = useCallback(
    (_, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);
    }, [],
  );

  const completeImageCrop = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        avatarUrlInEdit,
        croppedArea,
        0,
      );
      console.log('done', { croppedImage });

      // API request would be here

      // Temp
      dispatch(setUserData({
        ...user.userData,
        avatarUrl: croppedImage,
      }));

      handleSetStageToEditingGeneral();
    } catch (e) {
      console.error(e);
    }
  }, [
    croppedArea,
    avatarUrlInEdit, handleSetStageToEditingGeneral, dispatch, user.userData,
  ]);

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
      initial={MInitial}
      animate={MAnimation}
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence>
        {stage === 'edit-general'
          ? (
            <motion.div
              key="edit-general"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
                  withShadow
                  disabled={!wasModified || !isDataValid}
                  style={{
                    width: isMobile ? '100%' : 'initial',
                  }}
                >
                  { t('EditProfileMenu.saveButton') }
                </Button>
              </SControlsWrapper>
            </motion.div>
          ) : (
            <motion.div
              key="edit-picture"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}
              exit={{ x: 300, opacity: 0 }}
            >
              {isMobile ? (
                <SGoBackButtonMobile
                  onClick={handleSetStageToEditingGeneralUnsetPicture}
                >
                  { t('EditProfileMenu.goBackBtn.profilePicture') }
                </SGoBackButtonMobile>
              ) : (
                <SGoBackButtonDesktop
                  onClick={handleSetStageToEditingGeneralUnsetPicture}
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
              <ProfileImageCropper
                crop={crop}
                zoom={zoom}
                avatarUrlInEdit={avatarUrlInEdit}
                originalImageWidth={originalImageWidth}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
              <SSliderWrapper>
                <Button
                  iconOnly
                  size="sm"
                  view="transparent"
                  disabled={zoom <= 1}
                  onClick={handleZoomOut}
                >
                  <InlineSvg
                    svg={ZoomOutIcon}
                    fill={theme.colorsThemed.text.primary}
                    width="24px"
                    height="24px"
                  />
                </Button>
                <ProfileImageZoomSlider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  ariaLabel="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                <Button
                  iconOnly
                  size="sm"
                  view="transparent"
                  disabled={zoom >= 3}
                  onClick={handleZoomIn}
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
                  onClick={handleSetStageToEditingGeneralUnsetPicture}
                >
                  { t('EditProfileMenu.cancelButton') }
                </Button>
                <Button
                  withShadow
                  onClick={completeImageCrop}
                >
                  { t('EditProfileMenu.saveButton') }
                </Button>
              </SControlsWrapperPicture>
            </motion.div>
          )}
      </AnimatePresence>
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

const SControlsWrapper = styled.div`
  display: flex;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-content: space-between;
    align-items: center;
  }
`;

const SControlsWrapperPicture = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px;
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
