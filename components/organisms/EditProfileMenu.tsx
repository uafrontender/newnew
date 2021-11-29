/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce, isEqual } from 'lodash';
import validator from 'validator';
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
import { updateMe, validateEditProfileTextFields } from '../../api/endpoints/user';
import { getImageUploadUrl } from '../../api/endpoints/upload';

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
  bioError?: string;
};

const errorSwitch = (status: newnewapi.ValidateTextResponse.Status) => {
  let errorMsg = 'generic';

  switch (status) {
    case newnewapi.ValidateTextResponse.Status.TOO_LONG: {
      errorMsg = 'tooLong';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.TOO_SHORT: {
      errorMsg = 'tooShort';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.INVALID_CHARACTER: {
      errorMsg = 'invalidChar';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE: {
      errorMsg = 'innappropriate';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.USERNAME_TAKEN: {
      errorMsg = 'taken';
      break;
    }
    default: {
      break;
    }
  }

  return errorMsg;
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

  // Common
  const [isLoading, setIsLoading] = useState(false);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    displayName: user.userData?.displayName ?? '',
    username: user.userData?.username ?? '',
    bio: user.userData?.bio ?? '',
  });
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [isDataValid, setIsDataValid] = useState(false);
  const [formErrors, setFormErrors] = useState<TFormErrors>({
    displaynameError: '',
    usernameError: '',
    bioError: '',
  });

  const validateTextViaAPI = useCallback(async (
    kind: newnewapi.ValidateTextRequest.Kind,
    text: string,
  ) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        kind,
        text,
      });

      console.log(payload);

      const res = await validateEditProfileTextFields(
        payload,
        user.credentialsData?.accessToken!!,
      );

      console.log(res.data);
      console.log(res.error);

      if (!res.data?.status) throw new Error('An error occured');

      if (kind === newnewapi.ValidateTextRequest.Kind.DISPLAY_NAME) {
        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.displaynameError = errorSwitch(res.data?.status!!);
            return errorsWorking;
          });
        } else {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.displaynameError = '';
            return errorsWorking;
          });
        }
      } else if (kind === newnewapi.ValidateTextRequest.Kind.USERNAME) {
        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.usernameError = errorSwitch(res.data?.status!!);
            return errorsWorking;
          });
        } else {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.usernameError = '';
            return errorsWorking;
          });
        }
      } else if (kind === newnewapi.ValidateTextRequest.Kind.BIO) {
        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.bioError = errorSwitch(res.data?.status!!);
            return errorsWorking;
          });
        } else {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.bioError = '';
            return errorsWorking;
          });
        }
      }

      setIsAPIValidateLoading(false);
    } catch (err) {
      console.error(err);
      setIsAPIValidateLoading(false);
    }
  }, [user.credentialsData?.accessToken, setFormErrors]);

  const validateTextViaAPIDebounced = useMemo(() => debounce((
    kind: newnewapi.ValidateTextRequest.Kind,
    text: string,
  ) => {
    validateTextViaAPI(kind, text);
  }, 500),
  [validateTextViaAPI]);

  const handleUpdateDataInEdit = useCallback((
    key: keyof ModalMenuUserData,
    value: any,
  ) => {
    setIsDataValid(false);

    const workingData = { ...dataInEdit };
    workingData[key] = value;
    setDataInEdit({ ...workingData });

    if (key === 'displayName') {
      validateTextViaAPIDebounced(
        newnewapi.ValidateTextRequest.Kind.DISPLAY_NAME,
        value,
      );
    } else if (key === 'username') {
      validateTextViaAPIDebounced(
        newnewapi.ValidateTextRequest.Kind.USERNAME,
        value,
      );
    } else if (key === 'bio') {
      validateTextViaAPIDebounced(
        newnewapi.ValidateTextRequest.Kind.BIO,
        value,
      );
    }
  },
  [dataInEdit, setDataInEdit, validateTextViaAPIDebounced, setIsDataValid]);

  const handleUpdateTextualDataAndCover = useCallback(async () => {
    try {
      setIsLoading(true);

      const payload = new newnewapi.UpdateMeRequest({
        displayName: dataInEdit.displayName,
        ...(dataInEdit.username !== user.userData?.username
          ? { username: dataInEdit.username } : {}),
        ...(dataInEdit.bio !== user.userData?.bio
          ? { bio: dataInEdit.bio } : {}),
      });

      console.log(payload);

      const res = await updateMe(
        payload,
        user.credentialsData?.accessToken!!,
      );

      if (!res.data || res.error) throw new Error('Request failed');

      dispatch(setUserData({
        username: res.data.me?.username,
        displayName: res.data.me?.displayName,
        bio: res.data.me?.bio,
      }));

      setIsLoading(false);
      handleClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, [
    setIsLoading, dataInEdit, handleClose, user.credentialsData, dispatch,
    user.userData?.username, user.userData?.bio,
  ]);

  // Cover image
  const [coverUrlInEdit, setCoverUrlInEdit] = useState(user.userData?.coverUrl);
  const [originalCoverImageWidth, setOriginalCoverImageWidth] = useState(0);
  const [cropCoverImage, setCropCoverImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);

  const handleSetBackgroundPictureInEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files?.length === 1) {
      const file = files[0];

      if (!isImage(file.name)) return;
      // if ((file.size / (1024 * 1024)) > 3) return;

      // Check aspect ratio!

      // Read uploaded file as data URL
      const reader = new FileReader();
      const img = new Image();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (reader.result) {
          setCoverUrlInEdit(reader.result as string);

          img.src = reader.result as string;

          // eslint-disable-next-line func-names
          img.addEventListener('load', function () {
            // eslint-disable-next-line react/no-this-in-sfc
            setOriginalCoverImageWidth(this.width);
          });
        }
      });
    }
  };

  const handleUnsetPictureInEdit = () => setCoverUrlInEdit('');

  const handleCoverImageCropChange = (location: Point) => {
    // console.log(location);

    // if (location.x < originalCoverImageWidth) return;

    setCropCoverImage(location);
  };

  // Important!!!
  const onCropCompleteCoverImage = useCallback(
    async (croppedAreaPercentages: Area, croppedAreaPixels: Area) => {
      setCroppedAreaCoverImage(croppedAreaPixels);

      // Temp
      const croppedModified = { ...croppedAreaPixels };

      croppedModified.width = 1280;
      croppedModified.height = 240;
      croppedModified.x = 1280 * (croppedAreaPixels.x / croppedAreaPixels.width);
      croppedModified.y = 240 * (croppedAreaPixels.y / croppedAreaPixels.height);

      console.log(`croppedAreaPixels: ${JSON.stringify(croppedAreaPixels)}`);
      console.log(`croppedAreaPercentages: ${JSON.stringify(croppedAreaPercentages)}`);
      console.log(`croppedModified: ${JSON.stringify(croppedModified)}`);
      const croppedImageAsIs = await getCroppedImg(
        coverUrlInEdit!!,
        croppedAreaPixels,
        0,
      );
      console.log('as is: ');

      console.log(URL.createObjectURL(croppedImageAsIs));

      const croppedImageModifed = await getCroppedImg(
        coverUrlInEdit!!,
        croppedModified,
        0,
      );
      console.log('modified: ');

      console.log(URL.createObjectURL(croppedImageModifed));

      dispatch(setUserData({
        coverUrl: URL.createObjectURL(croppedImageAsIs),
      }));
    }, [coverUrlInEdit, dispatch],
  );

  // Profile image
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
  const [originalProfileImageWidth, setOriginalProfileImageWidth] = useState(0);
  const [cropProfileImage, setCropProfileImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaProfileImage, setCroppedAreaProfileImage] = useState<Area>();
  const [zoomProfileImage, setZoomProfileImage] = useState(1);

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
            setOriginalProfileImageWidth(this.width);
          });
        }
      });
    }
  };

  const handleSetStageToEditingGeneralUnsetPicture = () => {
    handleSetStageToEditingGeneral();
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

  const completeProfileImageCrop = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        avatarUrlInEdit,
        croppedAreaProfileImage,
        0,
      );
      console.log('done', { croppedImage });

      console.log(URL.createObjectURL(croppedImage));

      // API request would be here
      const emptyPayload = new newnewapi.EmptyRequest({});

      const res = await getImageUploadUrl(
        emptyPayload,
        user.credentialsData?.accessToken!!,
      );

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'An error occured');

      console.log(res.data);

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

      console.log(uploadResponse);

      const updateMePayload = new newnewapi.UpdateMeRequest({
        avatarUrl: res.data.publicUrl,
      });

      console.log(updateMePayload);

      const updateMeRes = await updateMe(
        updateMePayload,
        user.credentialsData?.accessToken!!,
      );

      if (!updateMeRes.data || updateMeRes.error) throw new Error('Request failed');

      // Temp
      dispatch(setUserData({
        ...user.userData,
        avatarUrl: updateMeRes.data.me?.avatarUrl,
      }));

      handleSetStageToEditingGeneral();
    } catch (e) {
      console.error(e);
    }
  }, [
    croppedAreaProfileImage,
    avatarUrlInEdit, handleSetStageToEditingGeneral, dispatch,
    user.userData, user.credentialsData,
  ]);

  // Check if data was modified
  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      displayName: user.userData?.displayName ?? '',
      username: user.userData?.username ?? '',
      bio: user.userData?.bio ?? '',
    };

    if (isEqual(dataInEdit, initialData) && isEqual(coverUrlInEdit, user.userData?.coverUrl)) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [dataInEdit, user.userData, handleSetWasModified, coverUrlInEdit]);

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
        errorsWorking.usernameError = isUsernameValid ? '' : 'generic';
        errorsWorking.displaynameError = isDisplaynameValid ? '' : 'generic';
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
  useEffect(() => {
    if (Object.values(formErrors).some((v) => v !== '')) {
      setIsDataValid(false);
    } else {
      const isUsernameValid = dataInEdit.username.length >= 8
        && dataInEdit.username.length <= 15
        && validator.isAlphanumeric(dataInEdit.username)
        && validator.isLowercase(dataInEdit.username);
      const isDisplaynameValid = dataInEdit && dataInEdit!!.displayName!!.length > 0;

      if (!isDisplaynameValid || !isUsernameValid) {
        setFormErrors((errors) => {
          const errorsWorking = { ...errors };
          errorsWorking.usernameError = isUsernameValid ? '' : 'generic';
          errorsWorking.displaynameError = isDisplaynameValid ? '' : 'generic';
          return errorsWorking;
        });
        setIsDataValid(false);
      } else {
        setIsDataValid(true);
      }
    }
  }, [formErrors, dataInEdit]);

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
              <SImageInputsWrapper>
                <ProfileBackgroundInput
                  originalPictureUrl={user?.userData?.coverUrl ?? ''}
                  pictureInEditUrl={coverUrlInEdit ?? ''}
                  crop={cropCoverImage}
                  zoom={zoomCoverImage}
                  originalImageWidth={originalCoverImageWidth}
                  handleSetPictureInEdit={handleSetBackgroundPictureInEdit}
                  handleUnsetPictureInEdit={handleUnsetPictureInEdit}
                  onCropChange={handleCoverImageCropChange}
                  onCropComplete={onCropCompleteCoverImage}
                  onZoomChange={setZoomCoverImage}
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
                  errorCaption={t(`EditProfileMenu.inputs.displayName.errors.${formErrors.displaynameError}`)}
                  isValid={!formErrors.displaynameError}
                  onChange={(e) => handleUpdateDataInEdit('displayName', e.target.value)}
                />
                <UsernameInput
                  type="text"
                  value={dataInEdit.username}
                  popupCaption={(
                    <UsernamePopupList
                      points={[
                        {
                          text: t('EditProfileMenu.inputs.username.points.1'),
                          isValid: dataInEdit.username ? (
                            dataInEdit.username.length >= 8 && dataInEdit.username.length <= 15
                          ) : false,
                        },
                        {
                          text: t('EditProfileMenu.inputs.username.points.2'),
                          isValid: dataInEdit.username ? (
                            validator.isLowercase(dataInEdit.username)
                          ) : false,
                        },
                        {
                          text: t('EditProfileMenu.inputs.username.points.3'),
                          isValid: dataInEdit.username ? (
                            validator.isAlphanumeric(dataInEdit.username)
                          ) : false,
                        },
                      ]}
                    />
                  )}
                  frequencyCaption={t('EditProfileMenu.inputs.username.frequencyCaption')}
                  errorCaption={t(`EditProfileMenu.inputs.username.errors.${formErrors.usernameError}`)}
                  placeholder={t('EditProfileMenu.inputs.username.placeholder')}
                  isValid={!formErrors.usernameError}
                  onChange={(e) => handleUpdateDataInEdit('username', e.target.value)}
                />
                <BioTextarea
                  maxChars={150}
                  value={dataInEdit.bio}
                  placeholder={t('EditProfileMenu.inputs.bio.placeholder')}
                  errorCaption={t(`EditProfileMenu.inputs.username.errors.${formErrors.bioError}`)}
                  isValid={!formErrors.bioError}
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
                  disabled={!wasModified || !isDataValid || isAPIValidateLoading || isLoading}
                  style={{
                    width: isMobile ? '100%' : 'initial',
                  }}
                  onClick={() => handleUpdateTextualDataAndCover()}
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
                crop={cropProfileImage}
                zoom={zoomProfileImage}
                avatarUrlInEdit={avatarUrlInEdit}
                originalImageWidth={originalProfileImageWidth}
                onCropChange={setCropProfileImage}
                onCropComplete={onCropCompleteProfileImage}
                onZoomChange={setZoomProfileImage}
              />
              <SSliderWrapper>
                <Button
                  iconOnly
                  size="sm"
                  view="transparent"
                  disabled={zoomProfileImage <= 1}
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
                  onChange={(e) => setZoomProfileImage(Number(e.target.value))}
                />
                <Button
                  iconOnly
                  size="sm"
                  view="transparent"
                  disabled={zoomProfileImage >= 3}
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
                  onClick={handleSetStageToEditingGeneralUnsetPicture}
                >
                  { t('EditProfileMenu.cancelButton') }
                </Button>
                <Button
                  withShadow
                  onClick={completeProfileImageCrop}
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

type TUsernamePopupListItem = {
  text: string;
  isValid: boolean;
}

const UsernamePopupList = ({ points } : { points: TUsernamePopupListItem[] }) => (
  <SUsernamePopupList>
    {points.map((p) => (
      <SUsernamePopupListItem
        key={p.text}
        isValid={p.isValid}
      >
        { p.text }
      </SUsernamePopupListItem>
    ))}
  </SUsernamePopupList>
);

const SUsernamePopupListItem = styled.div<{
  isValid: boolean;
}>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &:before {
    content: '✓';
    color: ${({ isValid }) => (isValid ? '#FFFFFF' : 'transparent')};
    font-size: 8px;
    text-align: center;
    line-height: 13px;
    display: block;

    position: relative;
    top: -1px;

    width: 13px;
    height: 13px;
    margin-right: 4px;

    border-radius: 50%;
    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ theme, isValid }) => (isValid ? 'transparent' : theme.colorsThemed.text.secondary)};

    background-color: ${({ theme, isValid }) => (isValid ? theme.colorsThemed.accent.success : 'transparent')};

    transition: .2s ease-in-out;
  }
`;

const SUsernamePopupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: #FFFFFF;
`;
