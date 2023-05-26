import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme, css } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
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
import DropdownSelect, { TDropdownSelectItem } from '../atoms/DropdownSelect';
import HelperText from '../atoms/HelperText';

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
import resizeImage from '../../utils/resizeImage';
import genderPronouns from '../../constants/genderPronouns';
import getGenderPronouns from '../../utils/genderPronouns';
import validateInputText from '../../utils/validateMessageText';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../../utils/hooks/useErrorToasts';
import { I18nNamespaces } from '../../@types/i18next';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';
import { NAME_LENGTH_LIMIT } from '../../utils/consts';

export type TEditingStage = 'edit-general' | 'edit-profile-picture';

interface IEditProfileMenu {
  stage: TEditingStage;
  wasModified: boolean;
  handleClose: (preventGoBack?: boolean) => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
  handleSetStageToEditingProfilePicture: () => void;
  handleSetStageToEditingGeneral: () => void;
}

type ModalMenuUserData = {
  username: string;
  nickname: string;
  bio: string;
  genderPronouns?: newnewapi.User.GenderPronouns;
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
      errorMsg = 'inappropriate';
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
      errorMsg = 'inappropriate';
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
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode, setUserLoggedIn } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Common
  const [isLoading, setIsLoading] = useState(false);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    nickname: user.userData?.nickname ?? '',
    username: user.userData?.username ?? '',
    bio: user.userData?.bio ?? '',
    genderPronouns: user.userData?.genderPronouns
      ? getGenderPronouns(user.userData?.genderPronouns).value
      : undefined,
  });
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [isDataValid, setIsDataValid] = useState(false);
  const [formErrors, setFormErrors] = useState<TFormErrors>({
    nicknameError: '',
    usernameError: '',
    bioError: '',
  });

  const validateUsernameAbortControllerRef = useRef<
    AbortController | undefined
  >();
  const validateUsernameViaAPI = useCallback(
    async (text: string) => {
      if (validateUsernameAbortControllerRef.current) {
        validateUsernameAbortControllerRef.current?.abort();
      }
      validateUsernameAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateUsernameRequest({
          username: text,
        });

        const res = await validateUsernameTextField(
          payload,
          validateUsernameAbortControllerRef.current?.signal
        );

        if (!res.data?.status) throw new Error('An error occurred');
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
          setUserLoggedIn(false);
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          setUserLoggedIn(false);
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    },
    [setFormErrors, dispatch, setUserLoggedIn]
  );

  const validateUsernameViaAPIDebounced = useMemo(
    () =>
      debounce((text: string) => {
        validateUsernameViaAPI(text);
      }, 250),
    [validateUsernameViaAPI]
  );

  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateTextViaAPI = useCallback(
    async (kind: newnewapi.ValidateTextRequest.Kind, text: string) => {
      if (validateTextAbortControllerRef.current) {
        validateTextAbortControllerRef.current?.abort();
      }
      validateTextAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind,
          text: text.trim(),
        });

        const res = await validateText(
          payload,
          validateTextAbortControllerRef.current?.signal
        );

        if (!res.data?.status) {
          throw new Error('An error occurred');
        }

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
        } else if (kind === newnewapi.ValidateTextRequest.Kind.CREATOR_BIO) {
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
          setUserLoggedIn(false);
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          setUserLoggedIn(false);
          dispatch(
            logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
          );
        }
      }
    },
    [setFormErrors, dispatch, setUserLoggedIn]
  );

  const validateTextViaAPIDebounced = useMemo(
    () =>
      debounce((kind: newnewapi.ValidateTextRequest.Kind, text: string) => {
        validateTextViaAPI(kind, text);
      }, 250),
    [validateTextViaAPI]
  );

  const handleUpdateDataInEdit = useCallback(
    <T extends keyof ModalMenuUserData>(
      key: T,
      value: ModalMenuUserData[T]
    ) => {
      const workingData: ModalMenuUserData = { ...dataInEdit };
      workingData[key] = value;

      setDataInEdit({ ...workingData });

      if (key === 'nickname') {
        const typedValue = value as ModalMenuUserData['nickname'];
        if (typedValue.trim() !== typedValue) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.nicknameError = 'sideSpacesForbidden';
            return errorsWorking;
          });
          return;
        }

        if (typedValue.length > NAME_LENGTH_LIMIT) {
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.nicknameError = 'tooLong';
            return errorsWorking;
          });
          return;
        }

        validateTextViaAPIDebounced(
          newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
          typedValue
        );
      } else if (key === 'username') {
        if (value === user.userData?.username) {
          validateUsernameViaAPIDebounced.cancel();
          // reset error if username equal to initial username
          setFormErrors((errors) => {
            const errorsWorking = { ...errors };
            errorsWorking.usernameError = '';
            return errorsWorking;
          });
        } else {
          validateUsernameViaAPIDebounced(
            value as ModalMenuUserData['username']
          );
        }
      } else if (key === 'bio') {
        validateTextViaAPIDebounced(
          user.userData?.options?.isCreator
            ? newnewapi.ValidateTextRequest.Kind.CREATOR_BIO
            : newnewapi.ValidateTextRequest.Kind.USER_BIO,
          value as ModalMenuUserData['bio']
        );
      }
    },
    [
      dataInEdit,
      user.userData?.username,
      user.userData?.options?.isCreator,
      validateTextViaAPIDebounced,
      validateUsernameViaAPIDebounced,
    ]
  );

  // Avatar
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');

  // Cover image
  const [coverUrlInEdit, setCoverUrlInEdit] = useState(user.userData?.coverUrl);
  const [coverUrlInEditAnimated, setCoverUrlInEditAnimated] = useState(false);
  const [coverUrlInEditAnimatedExtension, setCoverUrlInEditAnimatedExtension] =
    useState('');
  const [coverUrlInEditAnimatedMimeType, setCoverUrlInEditAnimatedMimeType] =
    useState('');
  const [coverImageInitialObjectFit, setCoverImageInitialObjectFit] =
    useState<CropperObjectFit>('horizontal-cover');
  const [cropCoverImage, setCropCoverImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);

  const handleSetBackgroundPictureInEdit = async (files: FileList | null) => {
    if (files?.length === 1) {
      const file = files[0];

      // Return if file is not an image
      if (!isImage(file.name)) {
        showErrorToastPredefined(
          ErrorToastPredefinedMessage.UnsupportedImageFormatError
        );
        return;
      }
      // Return if original image is larger than 10 Mb
      // if ((file.size / (1024 * 1024)) > 10) return;

      // Read uploaded file as data URL
      const reader = new FileReader();
      const img = new Image();
      reader.readAsDataURL(file);
      reader.addEventListener('load', async () => {
        if (reader.result) {
          const imageUrl = reader.result as string;
          const properlySizedImage = await resizeImage(imageUrl, 2000);
          img.src = properlySizedImage.url;

          // eslint-disable-next-line func-names
          img.addEventListener('load', async function () {
            // eslint-disable-next-line react/no-this-in-sfc
            if (this.width < this.height * 2.5) {
              setCoverImageInitialObjectFit('horizontal-cover');
              setZoomCoverImage(1);
              // eslint-disable-next-line react/no-this-in-sfc
            } else if (this.width < this.height * 5) {
              setCoverImageInitialObjectFit('horizontal-cover');
              setZoomCoverImage(2);
            } else {
              setCoverImageInitialObjectFit('vertical-cover');
              setZoomCoverImage(1);
            }

            setCropCoverImage({ x: 0, y: 0 });
            setCoverUrlInEdit(properlySizedImage.url);

            const imageMeta = await isAnimatedImage(file);

            if (imageMeta && imageMeta.animated) {
              setCoverUrlInEditAnimated(imageMeta.animated);
              setCoverUrlInEditAnimatedExtension(imageMeta.ext);
              setCoverUrlInEditAnimatedMimeType(imageMeta.mime);
            } else {
              setCoverUrlInEditAnimated(false);
              setCoverUrlInEditAnimatedExtension('');
              setCoverUrlInEditAnimatedMimeType('');
            }
          });
        }
      });
    }
  };

  const handleUnsetPictureInEdit = () => setCoverUrlInEdit('');

  const handleCoverImageCropChange = (location: Point) => {
    setCropCoverImage(location);
  };

  const onCropCompleteCoverImage = useCallback(
    (_: any, croppedAreaPixels: Area) => {
      setCroppedAreaCoverImage(croppedAreaPixels);
    },
    []
  );

  const handleUpdateUserData = useCallback(async () => {
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
          : await urlToFile(
              coverUrlInEdit,
              `coverImage.${coverUrlInEditAnimatedExtension}`,
              coverUrlInEditAnimatedMimeType
            );

        // API request would be here
        const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
          filename: croppedCoverImage.name,
        });

        const res = await getImageUploadUrl(imageUrlPayload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'An error occurred');
        }

        const uploadResponse = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: croppedCoverImage,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        newCoverImgURL = res.data.publicUrl;
      }

      const payload = new newnewapi.UpdateMeRequest({
        nickname: dataInEdit.nickname,
        bio: dataInEdit.bio.trim(),
        // Update avatar
        ...(avatarUrlInEdit && avatarUrlInEdit !== user.userData?.avatarUrl
          ? { avatarUrl: avatarUrlInEdit }
          : {}),
        // Send username only if it was updated
        ...(dataInEdit.username !== user.userData?.username
          ? { username: dataInEdit.username }
          : {}),
        // Update cover image, if it was updated
        ...(newCoverImgURL ? { coverUrl: newCoverImgURL } : {}),
        // Delete cover image, if it was deleted and no new image provided
        ...(!coverUrlInEdit ? { coverUrl: '' } : {}),
        ...(dataInEdit.genderPronouns
          ? { genderPronouns: dataInEdit.genderPronouns }
          : {}),
      });

      const res = await updateMe(payload);

      if (!res?.data || res.error) {
        throw new Error('Request failed');
      }

      dispatch(
        setUserData({
          username: res.data.me?.username,
          nickname: res.data.me?.nickname,
          avatarUrl: res.data.me?.avatarUrl,
          bio: res.data.me?.bio,
          coverUrl: res.data.me?.coverUrl,
          genderPronouns: res.data.me?.genderPronouns,
          options: {
            ...user.userData?.options,
          },
        })
      );

      setIsLoading(false);
      handleClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      if ((err as Error).message === 'No token') {
        setUserLoggedIn(false);
        dispatch(logoutUserClearCookiesAndRedirect());
      } else if ((err as Error).message === 'Refresh token invalid') {
        setUserLoggedIn(false);
        dispatch(
          logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
        );
      } else {
        showErrorToastPredefined(undefined);
      }
    }
  }, [
    isAPIValidateLoading,
    coverUrlInEdit,
    user.userData?.coverUrl,
    user.userData?.avatarUrl,
    user.userData?.username,
    user.userData?.options,
    dataInEdit.nickname,
    dataInEdit.bio,
    dataInEdit.username,
    dataInEdit.genderPronouns,
    avatarUrlInEdit,
    dispatch,
    handleClose,
    coverUrlInEditAnimated,
    croppedAreaCoverImage,
    coverUrlInEditAnimatedExtension,
    coverUrlInEditAnimatedMimeType,
    showErrorToastPredefined,
    setUserLoggedIn,
  ]);

  // Profile image editing
  const [originalProfileImageWidth, setOriginalProfileImageWidth] = useState(0);
  const [cropProfileImage, setCropProfileImage] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [croppedAreaProfileImage, setCroppedAreaProfileImage] =
    useState<Area>();
  const [zoomProfileImage, setZoomProfileImage] = useState(1);
  const [minZoomProfileImage, setMinZoomProfileImage] = useState(1);
  const [updateProfileImageLoading, setUpdateProfileImageLoading] =
    useState(false);

  // Profile picture
  const handleSetProfilePictureInEdit = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = e.target;

    if (files?.length === 1) {
      const file = files[0];

      if (!isImage(file.name)) {
        showErrorToastPredefined(
          ErrorToastPredefinedMessage.UnsupportedImageFormatError
        );
        return;
      }
      // if ((file.size / (1024 * 1024)) > 3) return;

      // Read uploaded file as data URL
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.addEventListener('load', async () => {
        if (reader.result) {
          const imageUrl = reader.result as string;
          const properlySizedImage = await resizeImage(imageUrl, 1000);
          // eslint-disable-next-line func-names

          // eslint-disable-next-line react/no-this-in-sfc
          setOriginalProfileImageWidth(properlySizedImage.width);

          // Circle, aspect ration 1:1, used for cropper with auto-cover
          const minZoom =
            Math.max(properlySizedImage.height, properlySizedImage.width) /
            Math.min(properlySizedImage.height, properlySizedImage.width);

          setMinZoomProfileImage(minZoom);
          setZoomProfileImage(minZoom);
          setAvatarUrlInEdit(properlySizedImage.url);
          handleSetStageToEditingProfilePicture();
        }
      });
    }
  };

  const handleSetStageToEditingGeneralUnsetPicture = () => {
    setUpdateProfileImageLoading(false);
    handleSetStageToEditingGeneral();
    setAvatarUrlInEdit('');
    setZoomProfileImage(1);
    setMinZoomProfileImage(1);
  };

  const handleZoomOutProfileImage = () => {
    setZoomProfileImage((z) => Math.max(z - 0.2, minZoomProfileImage));
  };

  const handleZoomInProfileImage = () => {
    setZoomProfileImage((z) => Math.min(z + 0.2, minZoomProfileImage + 2));
  };

  const onCropCompleteProfileImage = useCallback(
    (_: any, croppedAreaPixels: Area) => {
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

      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'An error occurred');
      }

      const uploadResponse = await fetch(res.data.uploadUrl, {
        method: 'PUT',
        body: croppedImage,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setAvatarUrlInEdit(res.data.publicUrl);

      setUpdateProfileImageLoading(false);
      handleSetStageToEditingGeneral();
    } catch (err) {
      console.error(err);
      setUpdateProfileImageLoading(false);
      if ((err as Error).message === 'No token') {
        setUserLoggedIn(false);
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        setUserLoggedIn(false);
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
    setUserLoggedIn,
  ]);

  useEffect(() => {
    const verify = () => {
      if (!isBrowser()) {
        return;
      }

      const { stage: currStage } = window.history.state;

      if (!currStage) {
        handleClose(true);
      } else if (currStage === 'edit-general') {
        setUpdateProfileImageLoading(false);
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
      genderPronouns: user.userData?.genderPronouns
        ? getGenderPronouns(user.userData?.genderPronouns).value
        : undefined,
    };

    if (
      (!avatarUrlInEdit ||
        isEqual(avatarUrlInEdit, user.userData?.avatarUrl)) &&
      dataInEdit.bio.trim() === initialData.bio &&
      dataInEdit.genderPronouns === initialData.genderPronouns &&
      dataInEdit.nickname.trim() === initialData.nickname &&
      dataInEdit.username.trim() === initialData.username &&
      isEqual(coverUrlInEdit, user.userData?.coverUrl)
    ) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [
    avatarUrlInEdit,
    dataInEdit,
    user.userData,
    handleSetWasModified,
    coverUrlInEdit,
  ]);

  useEffect(() => {
    const hasInvalidFields = Object.entries(dataInEdit).some(([key, value]) => {
      const typedKey = key as keyof ModalMenuUserData;

      // Skip these fields
      if (typedKey === 'genderPronouns' || typedKey === 'bio') {
        return false;
      }

      // Can't validate non string value, only genderPronouns have them
      if (typeof value !== 'string') {
        return false;
      }

      // Return true if we have no initial values (should not happen often)
      if (!user.userData) {
        return true;
      }

      const initialValue = user.userData[typedKey] ?? '';

      if (value === initialValue) {
        return false;
      }

      return !validateInputText(value);
    });

    if (hasInvalidFields) {
      setIsDataValid(false);
      return;
    }

    if (Object.values(formErrors).some((v) => v !== '')) {
      setIsDataValid(false);
      return;
    }

    setIsDataValid(true);
  }, [formErrors, dataInEdit, user.userData]);

  // Gender Pronouns
  const genderOptions: TDropdownSelectItem<number>[] = useMemo(
    () =>
      Object.values(genderPronouns)
        .filter(
          (genderP) => genderP.value !== newnewapi.User.GenderPronouns.UNKNOWN
        )
        .map((genderP) => ({
          name: t(
            `genderPronouns.${
              genderP.name as keyof I18nNamespaces['page-Profile']['genderPronouns']
            }`
          ),
          value: genderP.value,
        })),
    [t]
  );

  return (
    <SEditProfileMenu
      initial={MInitial}
      animate={MAnimation}
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence>
        {stage === 'edit-general' ? (
          <SEditProfileGeneral
            key='edit-general'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isMobile ? (
              <SGoBackButtonMobile onClick={handleClosePreventDiscarding}>
                {t('editProfileMenu.button.backToProfile')}
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop onClick={handleClosePreventDiscarding}>
                <div>{t('editProfileMenu.button.backToProfile')}</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SGoBackButtonDesktop>
            )}
            <ProfileGeneralContent>
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
                  publicUrl={avatarUrlInEdit || user.userData?.avatarUrl!!}
                  disabled={isLoading}
                  handleImageInputChange={handleSetProfilePictureInEdit}
                />
              </SImageInputsWrapper>
              <STextInputsWrapper>
                <NicknameInput
                  type='text'
                  value={dataInEdit.nickname as string}
                  disabled={isLoading}
                  placeholder={t('editProfileMenu.inputs.nickname.placeholder')}
                  errorCaption={t(
                    `editProfileMenu.inputs.nickname.errors.${
                      formErrors.nicknameError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['nickname']['errors']
                    }`
                  )}
                  isValid={!formErrors.nicknameError}
                  onChange={(e) =>
                    handleUpdateDataInEdit('nickname', e.target.value)
                  }
                />
                <UsernameInput
                  type='text'
                  value={dataInEdit.username}
                  disabled={isLoading}
                  popupCaption={
                    <UsernamePopupList
                      points={[
                        {
                          text: t('editProfileMenu.inputs.username.points.1'),
                          isValid: dataInEdit.username
                            ? dataInEdit.username.length >= 2 &&
                              dataInEdit.username.length <= 25
                            : false,
                        },
                        {
                          text: t('editProfileMenu.inputs.username.points.2'),
                          isValid: dataInEdit.username
                            ? validator.isLowercase(dataInEdit.username)
                            : false,
                        },
                        {
                          text: t('editProfileMenu.inputs.username.points.3'),
                          isValid: dataInEdit.username
                            ? validator.isAlphanumeric(dataInEdit.username)
                            : false,
                        },
                      ]}
                    />
                  }
                  errorCaption={t(
                    `editProfileMenu.inputs.username.errors.${
                      formErrors.usernameError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['username']['errors']
                    }`
                  )}
                  placeholder={t('editProfileMenu.inputs.username.placeholder')}
                  isValid={!formErrors.usernameError}
                  onChange={(value: any) => {
                    handleUpdateDataInEdit('username', value as string);
                  }}
                />
                <SDropdownSelectWrapper>
                  <SDropdownSelect<number>
                    width='100%'
                    disabled={isLoading}
                    label={
                      dataInEdit?.genderPronouns
                        ? genderOptions.find(
                            (o) => o.value === dataInEdit.genderPronouns
                          )?.name!!
                        : t('editProfileMenu.inputs.genderPronouns.placeholder')
                    }
                    options={genderOptions}
                    selected={dataInEdit.genderPronouns}
                    closeOnSelect
                    onSelect={(value: number) =>
                      handleUpdateDataInEdit('genderPronouns', value)
                    }
                  />
                  <HelperText>
                    {t('editProfileMenu.inputs.genderPronouns.caption')}
                  </HelperText>
                </SDropdownSelectWrapper>
                <BioTextarea
                  maxChars={150}
                  value={dataInEdit.bio}
                  disabled={isLoading}
                  placeholder={t('editProfileMenu.inputs.bio.placeholder')}
                  errorCaption={t(
                    `editProfileMenu.inputs.bio.errors.${
                      formErrors.bioError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['bio']['errors']
                    }`
                  )}
                  isValid={!formErrors.bioError}
                  onChange={(e) =>
                    handleUpdateDataInEdit('bio', e.target.value)
                  }
                />
              </STextInputsWrapper>
            </ProfileGeneralContent>
            <SControlsWrapper>
              {!isMobile ? (
                <Button
                  view='secondary'
                  onClick={() => handleClosePreventDiscarding()}
                  onClickCapture={() => {
                    Mixpanel.track('Click Cancel Editing Profile Button', {
                      _stage: 'MyProfile',
                      _component: 'EditProfileMenu',
                    });
                  }}
                >
                  {t('editProfileMenu.button.cancel')}
                </Button>
              ) : null}
              <Button
                withShadow
                disabled={
                  (!wasModified &&
                    ((!user.userData?.bio && dataInEdit.bio === '') ||
                      dataInEdit.bio === user.userData?.bio)) ||
                  !isDataValid ||
                  isLoading ||
                  !coverUrlInEdit
                }
                style={{
                  width: isMobile ? '100%' : 'initial',
                  ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
                }}
                onClick={() => {
                  // If trimmable spaces were added, allow to click the button and close modal
                  if (!wasModified && dataInEdit.bio !== user.userData?.bio) {
                    handleClose();
                  } else {
                    handleUpdateUserData();
                  }
                }}
                onClickCapture={() => {
                  Mixpanel.track('Click Save Profile Changes Button', {
                    _stage: 'MyProfile',
                    _component: 'EditProfileMenu',
                  });
                }}
              >
                {t('editProfileMenu.button.save')}
              </Button>
            </SControlsWrapper>
          </SEditProfileGeneral>
        ) : (
          <SEditProfilePicture
            key='edit-picture'
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}
            exit={{ x: 300, opacity: 0, transition: { duration: 0 } }}
          >
            {isMobile ? (
              <SGoBackButtonMobile
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                {t('editProfileMenu.button.backToImage')}
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                <div>{t('editProfileMenu.button.backToImage')}</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SGoBackButtonDesktop>
            )}
            <ProfilePictureContent>
              <ProfileImageCropper
                crop={cropProfileImage}
                zoom={zoomProfileImage}
                minZoom={minZoomProfileImage}
                maxZoom={minZoomProfileImage + 2}
                avatarUrlInEdit={avatarUrlInEdit}
                originalImageWidth={originalProfileImageWidth}
                disabled={updateProfileImageLoading}
                onCropChange={setCropProfileImage}
                onCropComplete={onCropCompleteProfileImage}
                onZoomChange={setZoomProfileImage}
              />
            </ProfilePictureContent>
            <SSliderWrapper>
              <Button
                iconOnly
                size='sm'
                view='transparent'
                disabled={
                  zoomProfileImage <= minZoomProfileImage ||
                  updateProfileImageLoading
                }
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
                min={minZoomProfileImage}
                max={minZoomProfileImage + 2}
                step={0.1}
                ariaLabel='Zoom'
                disabled={updateProfileImageLoading}
                onChange={(e) =>
                  setZoomProfileImage(
                    Math.max(Number(e.target.value), minZoomProfileImage)
                  )
                }
              />
              <Button
                iconOnly
                size='sm'
                view='transparent'
                disabled={
                  zoomProfileImage >= minZoomProfileImage + 2 ||
                  updateProfileImageLoading
                }
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
                onClickCapture={() => {
                  Mixpanel.track('Click Cancel Profile Image Button', {
                    _stage: 'MyProfile',
                    _component: 'EditProfileMenu',
                  });
                }}
              >
                {t('editProfileMenu.button.cancel')}
              </Button>
              <Button
                withShadow
                disabled={updateProfileImageLoading}
                onClick={completeProfileImageCropAndSave}
                onClickCapture={() => {
                  Mixpanel.track('Click Save Profile Image Button', {
                    _stage: 'MyProfile',
                    _component: 'EditProfileMenu',
                  });
                }}
              >
                {t('editProfileMenu.button.save')}
              </Button>
            </SControlsWrapperPicture>
          </SEditProfilePicture>
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
    top: max(min((100vh - 690px) / 2, 136px), 0px);
    left: calc(50% - 232px);

    width: 494px;
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

const SEditProfileGeneral = styled(motion.div)`
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ProfileGeneralContent = styled.div`
  overflow-y: auto;
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

const ProfilePictureContent = styled.div`
  overflow-y: auto;
  padding: 0 20px;
  height: 100%;
`;

const SSliderWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.media.tablet} {
    z-index: 1;
    background-color: ${({ theme }) =>
      theme.name === 'light'
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(11, 10, 19, 0.5)'};
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
    padding: 0 24px;
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

const SEditProfilePicture = styled(motion.div)`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
  }
`;

const SControlsWrapperPicture = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-top: auto;
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

const SUsernamePopupListItem = styled.div<{ isValid: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &:before {
    content: '✓';
    color: ${({ isValid }) => (isValid ? '#fff' : 'transparent')};
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
  color: #fff;
`;

const SDropdownSelectWrapper = styled.div`
  margin-bottom: 16px;
`;

const SDropdownSelect = styled(DropdownSelect)`
  ${(props) =>
    !props.selected &&
    css`
      & > button > span {
        color: ${({ theme }) => theme.colorsThemed.text.tertiary};
      }
    `}
` as typeof DropdownSelect;
