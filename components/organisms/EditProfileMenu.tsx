/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce, isEqual } from 'lodash';
import validator from 'validator';
import { Area, Point } from 'react-easy-crop/types';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import {
  logoutUserClearCookiesAndRedirect,
  setUserData,
} from '../../redux-store/slices/userStateSlice';

// Components
import Button from '../atoms/Button';
import InlineSvg from '../atoms/InlineSVG';
import GoBackButton from '../molecules/GoBackButton';
import BioTextarea from '../atoms/profile/BioTextarea';
import UsernameInput from '../atoms/profile/UsernameInput';
import NicknameInput from '../atoms/profile/NicknameInput';
import ProfileImageInput from '../molecules/profile/ProfileImageInput';
import ProfileBackgroundInput from '../molecules/profile/ProfileBackgroundInput';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import ZoomOutIcon from '../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../public/images/svg/icons/outlined/Plus.svg';

// Utils
import isImage from '../../utils/isImage';
import urlToFile from '../../utils/urlToFile';
import getCroppedImg from '../../utils/cropImage';
import ProfileImageCropper from '../molecules/profile/ProfileImageCropper';
import ProfileImageZoomSlider from '../atoms/profile/ProfileImageZoomSlider';
import { updateMe, validateUsernameTextField } from '../../api/endpoints/user';
import { validateText } from '../../api/endpoints/infrastructure';
import { getImageUploadUrl } from '../../api/endpoints/upload';
import { CropperObjectFit } from '../molecules/profile/ProfileBackgroundCropper';
import isBrowser from '../../utils/isBrowser';
import isAnimatedImage from '../../utils/isAnimatedImage';

export type TEditingStage = 'edit-general' | 'edit-profile-picture';

interface IEditProfileMenu {
  stage: TEditingStage;
  wasModified: boolean;
  handleClose: () => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
  handleSetStageToEditingProfilePicture: () => void;
  handleSetStageToEditingGeneral: () => void;
}

type ModalMenuUserData = {
  username: string;
  nickname: string;
  bio: string;
};

type TFormErrors = {
  nicknameError?: string;
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
    case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE: {
      errorMsg = 'innappropriate';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION: {
      errorMsg = 'linksForbidden';
      break;
    }
    default: {
      break;
    }
  }

  return errorMsg;
};

const errorSwitchUsername = (
  status: newnewapi.ValidateUsernameResponse.Status
) => {
  let errorMsg = 'generic';

  switch (status) {
    case newnewapi.ValidateUsernameResponse.Status.TOO_LONG: {
      errorMsg = 'tooLong';
      break;
    }
    case newnewapi.ValidateUsernameResponse.Status.TOO_SHORT: {
      errorMsg = 'tooShort';
      break;
    }
    case newnewapi.ValidateUsernameResponse.Status.INVALID_CHARACTER: {
      errorMsg = 'invalidChar';
      break;
    }
    case newnewapi.ValidateUsernameResponse.Status.INAPPROPRIATE: {
      errorMsg = 'innappropriate';
      break;
    }
    case newnewapi.ValidateUsernameResponse.Status.USERNAME_TAKEN: {
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
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { user, ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );

  // Common
  const [isLoading, setIsLoading] = useState(false);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    nickname: user.userData?.nickname ?? '',
    username: user.userData?.username ?? '',
    bio: user.userData?.bio ?? '',
  });
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [isDataValid, setIsDataValid] = useState(false);
  const [formErrors, setFormErrors] = useState<TFormErrors>({
    nicknameError: '',
    usernameError: '',
    bioError: '',
  });

  const validateUsernameViaAPI = useCallback(
    async (text: string) => {
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateUsernameRequest({
          username: text,
        });

        const res = await validateUsernameTextField(payload);

        if (!res.data?.status) throw new Error('An error occured');
        if (res.data?.status !== newnewapi.ValidateUsernameResponse.Status.OK) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.usernameError = errorSwitchUsername(
              res.data?.status!!
            );
            return errorsWorking;
          });
        } else {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.usernameError = '';
            return errorsWorking;
          });
        }

        setIsAPIValidateLoading(false);
      } catch (err) {
        console.error(err);
        setIsAPIValidateLoading(false);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    },
    [setFormErrors, dispatch]
  );

  const validateUsernameViaAPIDebounced = useMemo(
    () =>
      debounce((text: string) => {
        validateUsernameViaAPI(text);
      }, 250),
    [validateUsernameViaAPI]
  );

  const validateTextViaAPI = useCallback(
    async (kind: newnewapi.ValidateTextRequest.Kind, text: string) => {
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind,
          text,
        });

        const res = await validateText(payload);

        if (!res.data?.status) throw new Error('An error occured');

        if (kind === newnewapi.ValidateTextRequest.Kind.USER_NICKNAME) {
          if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
            setFormErrors((errors) => {
              const errorsWorking = { ...errors };
              errorsWorking.nicknameError = errorSwitch(res.data?.status!!);
              return errorsWorking;
            });
          } else {
            setFormErrors((errors) => {
              const errorsWorking = { ...errors };
              errorsWorking.nicknameError = '';
              return errorsWorking;
            });
          }
        } else if (kind === newnewapi.ValidateTextRequest.Kind.USER_BIO) {
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
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    },
    [setFormErrors, dispatch]
  );

  const validateTextViaAPIDebounced = useMemo(
    () =>
      debounce((kind: newnewapi.ValidateTextRequest.Kind, text: string) => {
        validateTextViaAPI(kind, text);
      }, 250),
    [validateTextViaAPI]
  );

  const handleUpdateDataInEdit = useCallback(
    (key: keyof ModalMenuUserData, value: any) => {
      setIsDataValid(false);

      const workingData = { ...dataInEdit };
      workingData[key] = value;
      setDataInEdit({ ...workingData });

      if (key === 'nickname') {
        validateTextViaAPIDebounced(
          newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
          value
        );
      } else if (key === 'username' && value !== user.userData?.username) {
        validateUsernameViaAPIDebounced(value);
      } else if (key === 'bio') {
        validateTextViaAPIDebounced(
          newnewapi.ValidateTextRequest.Kind.USER_BIO,
          value
        );
      }
    },
    [
      dataInEdit,
      user.userData?.username,
      setDataInEdit,
      validateTextViaAPIDebounced,
      validateUsernameViaAPIDebounced,
      setIsDataValid,
    ]
  );

  // Cover image
  const [coverUrlInEdit, setCoverUrlInEdit] = useState(user.userData?.coverUrl);
  const [coverUrlInEditAnimated, setCoverUrlInEditAinmated] = useState(false);
  const [coverImageInitialObjectFit, setCoverImageInitialObjectFit] =
    useState<CropperObjectFit>('horizontal-cover');
  const [cropCoverImage, setCropCoverImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);

  const handleSetBackgroundPictureInEdit = (files: FileList | null) => {
    if (files?.length === 1) {
      const file = files[0];

      // Return if file is not an image
      if (!isImage(file.name)) return;
      // Return if original image is larger than 10 Mb
      // if ((file.size / (1024 * 1024)) > 10) return;

      // Read uploaded file as data URL
      const reader = new FileReader();
      const img = new Image();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (reader.result) {
          img.src = reader.result as string;

          // eslint-disable-next-line func-names
          img.addEventListener('load', function () {
            // eslint-disable-next-line react/no-this-in-sfc
            if (this.width > this.height) {
              setCoverImageInitialObjectFit('vertical-cover');
            } else {
              setCoverImageInitialObjectFit('horizontal-cover');
            }
            setCropCoverImage({ x: 0, y: 0 });
            setZoomCoverImage(1);
            setCoverUrlInEdit(reader.result as string);
            setCoverUrlInEditAinmated(isAnimatedImage(file.name));
          });
        }
      });
    }
  };

  const handleUnsetPictureInEdit = () => setCoverUrlInEdit('');

  const handleCoverImageCropChange = (location: Point) => {
    setCropCoverImage(location);
  };

  const onCropCompleteCoverImage = useCallback((_, croppedAreaPixels: Area) => {
    setCroppedAreaCoverImage(croppedAreaPixels);
  }, []);

  // Update textual data and cover URL
  const handleUpdateTextualDataAndCover = useCallback(async () => {
    if (isAPIValidateLoading) return;
    try {
      setIsLoading(true);

      // In case cover image was updated
      let croppedCoverImage: File;
      let newCoverImgURL;

      if (coverUrlInEdit && coverUrlInEdit !== user.userData?.coverUrl) {
        croppedCoverImage = !coverUrlInEditAnimated
          ? await getCroppedImg(
              coverUrlInEdit,
              croppedAreaCoverImage!!,
              0,
              'coverImage.jpeg'
            )
          : await urlToFile(coverUrlInEdit, 'coverImage.webp', 'image/webp');

        // API request would be here
        const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
          filename: croppedCoverImage.name,
        });

        const res = await getImageUploadUrl(imageUrlPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'An error occured');

        const uploadResponse = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: croppedCoverImage,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadResponse.ok) throw new Error('Upload failed');

        newCoverImgURL = res.data.publicUrl;
      }

      const payload = new newnewapi.UpdateMeRequest({
        nickname: dataInEdit.nickname,
        bio: dataInEdit.bio,
        // Send username only if it was updated
        ...(dataInEdit.username !== user.userData?.username
          ? { username: dataInEdit.username }
          : {}),
        // Update cover image, if it was updated
        ...(newCoverImgURL ? { coverUrl: newCoverImgURL } : {}),
        // Delete cover image, if it was deleted and no new image provided
        ...(!coverUrlInEdit ? { coverUrl: '' } : {}),
      });

      const res = await updateMe(payload);

      if (!res.data || res.error) throw new Error('Request failed');

      dispatch(
        setUserData({
          username: res.data.me?.username,
          nickname: res.data.me?.nickname,
          bio: res.data.me?.bio,
          coverUrl: res.data.me?.coverUrl,
          options: {
            ...user.userData?.options,
            canChangeUsername: res.data.me?.options?.canChangeUsername,
          },
        })
      );

      setIsLoading(false);
      handleClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      if ((err as Error).message === 'No token') {
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        dispatch(
          logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
        );
      }
    }
  }, [
    setIsLoading,
    handleClose,
    dispatch,
    dataInEdit,
    coverUrlInEdit,
    coverUrlInEditAnimated,
    croppedAreaCoverImage,
    user.userData?.username,
    user.userData?.coverUrl,
    user.userData?.options,
    isAPIValidateLoading,
  ]);

  // Profile image
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
  const [originalProfileImageWidth, setOriginalProfileImageWidth] = useState(0);
  const [cropProfileImage, setCropProfileImage] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [croppedAreaProfileImage, setCroppedAreaProfileImage] =
    useState<Area>();
  const [zoomProfileImage, setZoomProfileImage] = useState(1);
  const [updateProfileImageLoading, setUpdateProfileImageLoading] =
    useState(false);

  // Profile picture
  const handleSetProfilePictureInEdit = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    },
    []
  );

  const completeProfileImageCropAndSave = useCallback(async () => {
    try {
      setUpdateProfileImageLoading(true);
      const croppedImage = await getCroppedImg(
        avatarUrlInEdit,
        croppedAreaProfileImage!!,
        0,
        'avatarImage.jpeg'
      );

      // Get upload and public URLs
      const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
        filename: croppedImage.name,
      });

      const res = await getImageUploadUrl(imageUrlPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'An error occured');

      const uploadResponse = await fetch(res.data.uploadUrl, {
        method: 'PUT',
        body: croppedImage,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const updateMePayload = new newnewapi.UpdateMeRequest({
        avatarUrl: res.data.publicUrl,
      });

      const updateMeRes = await updateMe(updateMePayload);

      if (!updateMeRes.data || updateMeRes.error)
        throw new Error('Request failed');

      // Update Redux state
      dispatch(
        setUserData({
          ...user.userData,
          avatarUrl: updateMeRes.data.me?.avatarUrl,
        })
      );

      setUpdateProfileImageLoading(false);
      handleSetStageToEditingGeneral();
    } catch (err) {
      console.error(err);
      setUpdateProfileImageLoading(false);
      if ((err as Error).message === 'No token') {
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        dispatch(
          logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
        );
      }
    }
  }, [
    croppedAreaProfileImage,
    avatarUrlInEdit,
    handleSetStageToEditingGeneral,
    dispatch,
    user.userData,
  ]);

  // Effects
  useEffect(() => {
    const verify = () => {
      if (!isBrowser()) return;

      const { stage: currStage } = window.history.state;

      if (!currStage) {
        handleClose();
      } else if (currStage === 'edit-general') {
        handleSetStageToEditingGeneral();
      }
    };

    window.addEventListener('popstate', verify);

    return () => window.removeEventListener('popstate', verify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if data was modified
  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      nickname: user.userData?.nickname ?? '',
      username: user.userData?.username ?? '',
      bio: user.userData?.bio ?? '',
    };

    if (
      isEqual(dataInEdit, initialData) &&
      isEqual(coverUrlInEdit, user.userData?.coverUrl)
    ) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [dataInEdit, user.userData, handleSetWasModified, coverUrlInEdit]);

  // Check fields validity
  useEffect(() => {
    const isUsernameValid =
      dataInEdit.username.length >= 2 &&
      dataInEdit.username.length <= 25 &&
      validator.isAlphanumeric(dataInEdit.username) &&
      validator.isLowercase(dataInEdit.username);
    const isNicknameValid = dataInEdit && dataInEdit!!.nickname!!.length > 0;

    if (!isNicknameValid || !isUsernameValid) {
      setFormErrors((errors) => {
        const errorsWorking = { ...errors };
        errorsWorking.usernameError = isUsernameValid ? '' : 'generic';
        errorsWorking.nicknameError = isNicknameValid ? '' : 'generic';
        return errorsWorking;
      });
      setIsDataValid(false);
    } else {
      setFormErrors({
        usernameError: '',
        nicknameError: '',
      });
      setIsDataValid(true);
    }
  }, [dataInEdit]);

  // Set and unset form errors
  useEffect(() => {
    if (Object.values(formErrors).some((v) => v !== '')) {
      setIsDataValid(false);
    } else {
      const isUsernameValid =
        dataInEdit.username.length >= 2 &&
        dataInEdit.username.length <= 25 &&
        validator.isAlphanumeric(dataInEdit.username) &&
        validator.isLowercase(dataInEdit.username);
      const isNicknameValid = dataInEdit && dataInEdit!!.nickname!!.length > 0;

      if (!isNicknameValid || !isUsernameValid) {
        setFormErrors((errors) => {
          const errorsWorking = { ...errors };
          errorsWorking.usernameError = isUsernameValid ? '' : 'generic';
          errorsWorking.nicknameError = isNicknameValid ? '' : 'generic';
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
        {stage === 'edit-general' ? (
          <motion.div
            key='edit-general'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isMobile ? (
              <SGoBackButtonMobile onClick={handleClosePreventDiscarding}>
                {t('EditProfileMenu.goBackBtn.general')}
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop onClick={handleClosePreventDiscarding}>
                <div>{t('EditProfileMenu.goBackBtn.general')}</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SGoBackButtonDesktop>
            )}
            <SImageInputsWrapper>
              <ProfileBackgroundInput
                originalPictureUrl={user?.userData?.coverUrl ?? ''}
                pictureInEditUrl={coverUrlInEdit ?? ''}
                coverUrlInEditAnimated={coverUrlInEditAnimated}
                crop={cropCoverImage}
                zoom={zoomCoverImage}
                initialObjectFit={coverImageInitialObjectFit}
                disabled={isLoading}
                handleSetPictureInEdit={handleSetBackgroundPictureInEdit}
                handleUnsetPictureInEdit={handleUnsetPictureInEdit}
                onCropChange={handleCoverImageCropChange}
                onCropComplete={onCropCompleteCoverImage}
                onZoomChange={setZoomCoverImage}
              />
              <ProfileImageInput
                publicUrl={user.userData?.avatarUrl!!}
                disabled={isLoading}
                handleImageInputChange={handleSetProfilePictureInEdit}
              />
            </SImageInputsWrapper>
            <STextInputsWrapper>
              <NicknameInput
                type='text'
                value={dataInEdit.nickname as string}
                disabled={isLoading}
                placeholder={t('EditProfileMenu.inputs.nickname.placeholder')}
                errorCaption={t(
                  `EditProfileMenu.inputs.nickname.errors.${formErrors.nicknameError}`
                )}
                isValid={!formErrors.nicknameError}
                onChange={(e) =>
                  handleUpdateDataInEdit('nickname', e.target.value)
                }
              />
              <UsernameInput
                type='text'
                value={dataInEdit.username}
                disabled={
                  isLoading || !user.userData?.options?.canChangeUsername
                }
                popupCaption={
                  <UsernamePopupList
                    points={[
                      {
                        text: t('EditProfileMenu.inputs.username.points.1'),
                        isValid: dataInEdit.username
                          ? dataInEdit.username.length >= 2 &&
                            dataInEdit.username.length <= 25
                          : false,
                      },
                      {
                        text: t('EditProfileMenu.inputs.username.points.2'),
                        isValid: dataInEdit.username
                          ? validator.isLowercase(dataInEdit.username)
                          : false,
                      },
                      {
                        text: t('EditProfileMenu.inputs.username.points.3'),
                        isValid: dataInEdit.username
                          ? validator.isAlphanumeric(dataInEdit.username)
                          : false,
                      },
                    ]}
                  />
                }
                frequencyCaption={
                  user.userData?.options?.canChangeUsername
                    ? t('EditProfileMenu.inputs.username.frequencyCaption', {
                        domain:
                          process.env.NEXT_PUBLIC_APP_URL &&
                          process.env.NEXT_PUBLIC_APP_URL[
                            (process.env.NEXT_PUBLIC_APP_URL?.length ?? 1) - 1
                          ] === '/'
                            ? process.env.NEXT_PUBLIC_APP_URL
                            : `${process.env.NEXT_PUBLIC_APP_URL}/`,
                        username: dataInEdit.username,
                      })
                    : t(
                        'EditProfileMenu.inputs.username.cannotBeChangedCaption'
                      )
                }
                errorCaption={t(
                  `EditProfileMenu.inputs.username.errors.${formErrors.usernameError}`
                )}
                placeholder={t('EditProfileMenu.inputs.username.placeholder')}
                isValid={!formErrors.usernameError}
                onChange={(value) => {
                  handleUpdateDataInEdit('username', value);
                }}
              />
              <BioTextarea
                maxChars={150}
                value={dataInEdit.bio}
                disabled={isLoading}
                placeholder={t('EditProfileMenu.inputs.bio.placeholder')}
                errorCaption={t(
                  `EditProfileMenu.inputs.bio.errors.${formErrors.bioError}`
                )}
                isValid={!formErrors.bioError}
                onChange={(e) => handleUpdateDataInEdit('bio', e.target.value)}
              />
            </STextInputsWrapper>
            <SControlsWrapper>
              {!isMobile ? (
                <Button view='secondary' onClick={handleClose}>
                  {t('EditProfileMenu.cancelButton')}
                </Button>
              ) : null}
              <Button
                withShadow
                disabled={!wasModified || !isDataValid || isLoading}
                style={{
                  width: isMobile ? '100%' : 'initial',
                  ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
                }}
                onClick={() => handleUpdateTextualDataAndCover()}
              >
                {t('EditProfileMenu.saveButton')}
              </Button>
            </SControlsWrapper>
          </motion.div>
        ) : (
          <motion.div
            key='edit-picture'
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}
            exit={{ x: 300, opacity: 0 }}
          >
            {isMobile ? (
              <SGoBackButtonMobile
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                {t('EditProfileMenu.goBackBtn.profilePicture')}
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                <div>{t('EditProfileMenu.goBackBtn.profilePicture')}</div>
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
                size='sm'
                view='transparent'
                disabled={zoomProfileImage <= 1 || updateProfileImageLoading}
                onClick={handleZoomOutProfileImage}
              >
                <InlineSvg
                  svg={ZoomOutIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </Button>
              <ProfileImageZoomSlider
                value={zoomProfileImage}
                min={1}
                max={3}
                step={0.1}
                ariaLabel='Zoom'
                disabled={updateProfileImageLoading}
                onChange={(e) => setZoomProfileImage(Number(e.target.value))}
              />
              <Button
                iconOnly
                size='sm'
                view='transparent'
                disabled={zoomProfileImage >= 3 || updateProfileImageLoading}
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
                disabled={updateProfileImageLoading}
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                {t('EditProfileMenu.cancelButton')}
              </Button>
              <Button
                withShadow
                disabled={updateProfileImageLoading}
                onClick={completeProfileImageCropAndSave}
              >
                {t('EditProfileMenu.saveButton')}
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
      stiffness: 50,
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

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

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

    margin-bottom: 8px;
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

type TUsernamePopupListItem = {
  text: string;
  isValid: boolean;
};

const UsernamePopupList = ({
  points,
}: {
  points: TUsernamePopupListItem[];
}) => (
  <SUsernamePopupList>
    {points.map((p) => (
      <SUsernamePopupListItem key={p.text} isValid={p.isValid}>
        {p.text}
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
    border-color: ${({ theme, isValid }) =>
      isValid ? 'transparent' : theme.colorsThemed.text.secondary};

    background-color: ${({ theme, isValid }) =>
      isValid ? theme.colorsThemed.accent.success : 'transparent'};

    transition: 0.2s ease-in-out;
  }
`;

const SUsernamePopupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: #ffffff;
`;
