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
import validator from 'validator';
import { Area, Point } from 'react-easy-crop/types';

import { useUserData } from '../../contexts/userDataContext';

// Components
import Button from '../atoms/Button';
import InlineSvg from '../atoms/InlineSVG';
import GoBackButton from '../molecules/GoBackButton';
import BioTextarea from '../atoms/profile/BioTextarea';
import UsernameInput from '../atoms/profile/UsernameInput';
import NicknameInput from '../atoms/profile/NicknameInput';
import ProfileImageInput from '../molecules/profile/ProfileImageInput';
import ProfileCoverImage from '../molecules/profile/ProfileCoverImage';
import DropdownSelect, { TDropdownSelectItem } from '../atoms/DropdownSelect';
import HelperText from '../atoms/HelperText';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import ZoomOutIcon from '../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../public/images/svg/icons/outlined/Plus.svg';

// Utils
import isImage from '../../utils/isImage';
import getCroppedImg from '../../utils/cropImage';
import ProfileImageCropper from '../molecules/profile/ProfileImageCropper';
import ImageZoomSlider from '../atoms/profile/ProfileImageZoomSlider';
import { updateMe, validateUsernameTextField } from '../../api/endpoints/user';
import { validateText } from '../../api/endpoints/infrastructure';
import { getImageUploadUrl } from '../../api/endpoints/upload';
import isBrowser from '../../utils/isBrowser';
import resizeImage from '../../utils/resizeImage';
import genderPronouns from '../../constants/genderPronouns';
import isAnimatedImage from '../../utils/isAnimatedImage';
import getGenderPronouns from '../../utils/genderPronouns';
import validateInputText from '../../utils/validateMessageText';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../../utils/hooks/useErrorToasts';
import { I18nNamespaces } from '../../@types/i18next';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';
import { NAME_LENGTH_LIMIT } from '../../utils/consts';
import ProfileCoverImageCropper from '../molecules/profile/ProfileCoverImageCropper';

export type TEditingStage =
  | 'edit-general'
  | 'edit-profile-picture'
  | 'edit-profile-cover';

interface IEditProfileMenu {
  stage: TEditingStage;
  wasModified: boolean;
  handleClose: (preventGoBack?: boolean) => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
  handleSetStageToEditingProfilePicture: () => void;
  handleSetStageToEditingCoverPicture: () => void;
  handleSetStageToEditingGeneral: () => void;
}

type ModalMenuUserData = {
  username: string;
  nickname: string;
  bio: string;
  genderPronouns?: newnewapi.User.GenderPronouns;
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

// TODO: Refactor to separate out components
const EditProfileMenu: React.FunctionComponent<IEditProfileMenu> = ({
  stage,
  wasModified,
  handleClose,
  handleSetWasModified,
  handleClosePreventDiscarding,
  handleSetStageToEditingProfilePicture,
  handleSetStageToEditingCoverPicture,
  handleSetStageToEditingGeneral,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();
  const { userData, updateUserData } = useUserData();
  const { resizeMode, userIsCreator, logoutAndRedirect } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Common
  const [isLoading, setIsLoading] = useState(false);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    nickname: userData?.nickname ?? '',
    username: userData?.username ?? '',
    bio: userData?.bio ?? '',
    genderPronouns: userData?.genderPronouns
      ? getGenderPronouns(userData?.genderPronouns).value
      : undefined,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [isDataValid, setIsDataValid] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [bioError, setBioError] = useState('');

  const validateUsernameAbortControllerRef = useRef<
    AbortController | undefined
  >();
  const validateUsernameViaAPI = useCallback(
    async (text: string): Promise<boolean> => {
      let result = false;
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

        if (!res.data?.status) {
          throw new Error('An error occurred');
        }

        if (res.data?.status !== newnewapi.ValidateUsernameResponse.Status.OK) {
          const error = errorSwitchUsername(res.data?.status!!);
          setUsernameError(error);
        } else {
          setUsernameError('');
          result = true;
        }

        setIsAPIValidateLoading(false);
        return result;
      } catch (err) {
        console.error(err);
        setIsAPIValidateLoading(false);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }

        return result;
      }
    },
    [logoutAndRedirect]
  );

  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateTextViaAPI = useCallback(
    async (
      kind: newnewapi.ValidateTextRequest.Kind,
      text: string
    ): Promise<boolean> => {
      let result = false;
      if (validateTextAbortControllerRef.current) {
        validateTextAbortControllerRef.current?.abort();
      }
      validateTextAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        if (kind === newnewapi.ValidateTextRequest.Kind.USER_NICKNAME) {
          if (text.length === 0 && userData?.nickname) {
            setNicknameError('tooShort');
            return result;
          }

          if (text.trim() !== text) {
            setNicknameError('sideSpacesForbidden');
            return result;
          }

          if (text.length > NAME_LENGTH_LIMIT) {
            setNicknameError('tooLong');
            return result;
          }
        }

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
            const error = errorSwitch(res.data?.status!!);
            setNicknameError(error);
          } else {
            setNicknameError('');
            result = true;
          }
        } else if (kind === newnewapi.ValidateTextRequest.Kind.USER_BIO) {
          if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
            const error = errorSwitch(res.data?.status!!);
            setBioError(error);
          } else {
            setBioError('');
            result = true;
          }
        } else if (kind === newnewapi.ValidateTextRequest.Kind.CREATOR_BIO) {
          if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
            const error = errorSwitch(res.data?.status!!);
            setBioError(error);
          } else {
            setBioError('');
            result = true;
          }
        }

        setIsAPIValidateLoading(false);
        return result;
      } catch (err) {
        console.error(err);
        setIsAPIValidateLoading(false);
        if ((err as Error).message === 'No token') {
          logoutAndRedirect();
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          logoutAndRedirect('/sign-up?reason=session_expired');
        }
        return result;
      }
    },
    [userData?.nickname, logoutAndRedirect]
  );

  const handleUpdateDataInEdit = useCallback(
    <T extends keyof ModalMenuUserData>(
      key: T,
      value: ModalMenuUserData[T]
    ) => {
      const workingData: ModalMenuUserData = { ...dataInEdit };
      workingData[key] = value;

      setDataInEdit({ ...workingData });

      if (key === 'username') {
        if (value === userData?.username) {
          // reset error if username equal to initial username
          setUsernameError('');
        }
      }
    },
    [dataInEdit, userData?.username]
  );

  const handleBlurNickname = useCallback(
    (e: React.FocusEvent<HTMLInputElement, Element>) => {
      const { value } = e.target;
      validateTextViaAPI(
        newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
        value
      );
    },
    [validateTextViaAPI]
  );

  const handleBlurBio = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
      const { value } = e.target;
      validateTextViaAPI(
        userIsCreator
          ? newnewapi.ValidateTextRequest.Kind.CREATOR_BIO
          : newnewapi.ValidateTextRequest.Kind.USER_BIO,
        value
      );
    },
    [userIsCreator, validateTextViaAPI]
  );

  const handleBlurUsername = useCallback(
    (e: React.FocusEvent<HTMLInputElement, Element>) => {
      const { value } = e.target;
      const valueRefined = value.length > 0 ? value.replace('@', '') : value;

      if (valueRefined === userData?.username) {
        // reset error if username equal to initial username
        setUsernameError('');
        return;
      }
      validateUsernameViaAPI(valueRefined);
    },
    [userData?.username, validateUsernameViaAPI]
  );

  const handleFocusNickname = useCallback(
    (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setNicknameError('');
    },
    []
  );
  const handleFocusUsername = useCallback(
    (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setUsernameError('');
    },
    []
  );
  const handleFocusBio = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
      setBioError('');
    },
    []
  );

  // Avatar image
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
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

  // Profile cover image
  const [coverUrlInEdit, setCoverUrlInEdit] = useState(
    userData?.coverUrl ?? ''
  );
  const [originalCoverImageWidth, setOriginalCoverImageWidth] = useState(0);
  const [cropCoverImage, setCropCoverImage] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);
  const [minZoomCoverImage, setMinZoomCoverImage] = useState(1);
  const [updateCoverImageLoading, setUpdateCoverImageLoading] = useState(false);

  const handleSetProfileCoverImageInEdit = async (files: FileList | null) => {
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

          img.addEventListener('load', async () => {
            const imageMeta = await isAnimatedImage(file);
            if (imageMeta && imageMeta.animated) {
              showErrorToastPredefined(
                ErrorToastPredefinedMessage.UnsupportedImageFormatError
              );
            } else {
              setOriginalCoverImageWidth(properlySizedImage.width);
              setMinZoomCoverImage(1);
              setZoomCoverImage(1);
              setCoverUrlInEdit(properlySizedImage.url);
              handleSetStageToEditingCoverPicture();
            }
          });
        }
      });
    }
  };

  const handleUnsetPictureInEdit = () => setCoverUrlInEdit('');

  const handleZoomOutCoverImage = () => {
    setZoomCoverImage((z) => Math.max(z - 0.2, minZoomCoverImage));
  };

  const handleZoomInCoverImage = () => {
    setZoomCoverImage((z) => Math.min(z + 0.2, minZoomCoverImage + 2));
  };

  const onCropCompleteCoverImage = useCallback(
    (_: any, croppedAreaPixels: Area) => {
      setCroppedAreaCoverImage(croppedAreaPixels);
    },
    []
  );

  const completeCoverImageCropAndSave = useCallback(async () => {
    try {
      setUpdateCoverImageLoading(true);
      const croppedImage = await getCroppedImg(
        coverUrlInEdit,
        croppedAreaCoverImage!!,
        0,
        'coverImage.jpeg'
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

      setCoverUrlInEdit(res.data.publicUrl);

      setUpdateCoverImageLoading(false);
      handleSetStageToEditingGeneral();
    } catch (err) {
      console.error(err);
      setUpdateCoverImageLoading(false);
      if ((err as Error).message === 'No token') {
        logoutAndRedirect();
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        logoutAndRedirect('/sign-up?reason=session_expired');
      }
    }
  }, [
    croppedAreaCoverImage,
    coverUrlInEdit,
    handleSetStageToEditingGeneral,
    logoutAndRedirect,
  ]);

  const handleUpdateUserData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Additional validation
      let nicknameValid = true;
      let bioValid = true;
      let usernameValid = true;

      nicknameValid = await validateTextViaAPI(
        newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
        dataInEdit.nickname
      );

      bioValid = await validateTextViaAPI(
        userIsCreator
          ? newnewapi.ValidateTextRequest.Kind.CREATOR_BIO
          : newnewapi.ValidateTextRequest.Kind.USER_BIO,
        dataInEdit.bio
      );

      if (dataInEdit.username !== userData?.username) {
        usernameValid = await validateUsernameViaAPI(dataInEdit.username);
      }

      if (!nicknameValid || !bioValid || !usernameValid) {
        setIsLoading(false);
        return;
      }

      const payload = new newnewapi.UpdateMeRequest({
        nickname: dataInEdit.nickname,
        bio: dataInEdit.bio.trim(),
        // Update avatar
        ...(avatarUrlInEdit && avatarUrlInEdit !== userData?.avatarUrl
          ? { avatarUrl: avatarUrlInEdit }
          : {}),
        // Send username only if it was updated
        ...(dataInEdit.username !== userData?.username
          ? { username: dataInEdit.username }
          : {}),
        // Update cover image, if it was updated
        ...(coverUrlInEdit && coverUrlInEdit !== userData?.coverUrl
          ? { coverUrl: coverUrlInEdit }
          : {}),
        // Delete cover image, if it was deleted and no new image provided
        ...(!coverUrlInEdit ? { coverUrl: '' } : {}),
        ...(dataInEdit.genderPronouns
          ? { genderPronouns: dataInEdit.genderPronouns }
          : {}),
      });

      const res = await updateMe(payload);

      if (!res?.data || res.error) {
        throw new Error(res.error?.message || 'Request failed');
      }

      updateUserData({
        username: res.data.me?.username ?? undefined,
        nickname: res.data.me?.nickname,
        avatarUrl: res.data.me?.avatarUrl ?? undefined,
        bio: res.data.me?.bio,
        coverUrl: res.data.me?.coverUrl,
        genderPronouns: res.data.me?.genderPronouns,
        options: {
          ...userData?.options,
        },
      });

      setIsLoading(false);
      handleClose();
    } catch (err) {
      setIsLoading(false);
      if ((err as Error).message === 'No token') {
        logoutAndRedirect();
      } else if ((err as Error).message === 'Refresh token invalid') {
        logoutAndRedirect('/sign-up?reason=session_expired');
      } else if (
        (err as Error).message &&
        (err as Error).message.includes('Uploaded image')
      ) {
        showErrorToastCustom(t('editProfileMenu.inputs.avatar.inappropriate'));
      } else {
        showErrorToastPredefined(undefined);
      }
    }
  }, [
    validateTextViaAPI,
    dataInEdit.username,
    dataInEdit.bio,
    dataInEdit.nickname,
    dataInEdit.genderPronouns,
    userIsCreator,
    validateUsernameViaAPI,
    coverUrlInEdit,
    userData?.coverUrl,
    userData?.avatarUrl,
    userData?.username,
    userData?.options,
    avatarUrlInEdit,
    showErrorToastPredefined,
    showErrorToastCustom,
    t,
    logoutAndRedirect,
    updateUserData,
    handleClose,
  ]);

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

    setCoverUrlInEdit(userData?.coverUrl ?? '');
    setZoomCoverImage(1);
    setMinZoomCoverImage(1);
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
        logoutAndRedirect();
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        logoutAndRedirect('/sign-up?reason=session_expired');
      }
    }
  }, [
    croppedAreaProfileImage,
    avatarUrlInEdit,
    handleSetStageToEditingGeneral,
    logoutAndRedirect,
  ]);

  useEffect(
    () => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // handleClose, - reason unknown
      // handleSetStageToEditingGeneral, - reason unknown
    ]
  );

  // Check if data was modified
  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      nickname: userData?.nickname ?? '',
      username: userData?.username ?? '',
      bio: userData?.bio ?? '',
      genderPronouns: userData?.genderPronouns
        ? getGenderPronouns(userData?.genderPronouns).value
        : undefined,
    };

    if (
      (!avatarUrlInEdit || isEqual(avatarUrlInEdit, userData?.avatarUrl)) &&
      dataInEdit.bio.trim() === initialData.bio &&
      dataInEdit.genderPronouns === initialData.genderPronouns &&
      dataInEdit.nickname.trim() === initialData.nickname &&
      dataInEdit.username.trim() === initialData.username &&
      isEqual(coverUrlInEdit, userData?.coverUrl)
    ) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [
    avatarUrlInEdit,
    dataInEdit,
    userData,
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
      if (!userData) {
        return true;
      }

      const initialValue = userData[typedKey] ?? '';
      if (value === initialValue) {
        return false;
      }

      return !validateInputText(value);
    });

    if (hasInvalidFields) {
      setIsDataValid(false);
      return;
    }

    if (nicknameError || usernameError || bioError) {
      setIsDataValid(false);
      return;
    }

    setIsDataValid(true);
  }, [nicknameError, usernameError, bioError, dataInEdit, userData]);

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
        {stage === 'edit-general' && (
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
            <ProfileGeneralContent data-body-scroll-lock-ignore>
              <SImageInputsWrapper>
                <ProfileCoverImage
                  pictureInEditUrl={coverUrlInEdit ?? ''}
                  disabled={isLoading}
                  handleSetPictureInEdit={handleSetProfileCoverImageInEdit}
                  handleUnsetPictureInEdit={handleUnsetPictureInEdit}
                />
                <ProfileImageInput
                  publicUrl={avatarUrlInEdit || userData?.avatarUrl!!}
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
                      nicknameError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['nickname']['errors']
                    }`
                  )}
                  isValid={!nicknameError}
                  onChange={(e) =>
                    handleUpdateDataInEdit('nickname', e.target.value)
                  }
                  onBlur={handleBlurNickname}
                  onFocus={handleFocusNickname}
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
                      usernameError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['username']['errors']
                    }`
                  )}
                  placeholder={t('editProfileMenu.inputs.username.placeholder')}
                  isValid={!usernameError}
                  onChange={(value: any) => {
                    handleUpdateDataInEdit('username', value as string);
                  }}
                  onBlur={handleBlurUsername}
                  onFocus={handleFocusUsername}
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
                      bioError as keyof I18nNamespaces['page-Profile']['editProfileMenu']['inputs']['bio']['errors']
                    }`
                  )}
                  isValid={!bioError}
                  onChange={(e) =>
                    handleUpdateDataInEdit('bio', e.target.value)
                  }
                  onFocus={handleFocusBio}
                  onBlur={handleBlurBio}
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
                    ((!userData?.bio && dataInEdit.bio === '') ||
                      dataInEdit.bio === userData?.bio)) ||
                  !isDataValid ||
                  isLoading
                }
                style={{
                  width: isMobile ? '100%' : 'initial',
                }}
                onClick={() => {
                  // If trimmable spaces were added, allow to click the button and close modal
                  if (!wasModified && dataInEdit.bio !== userData?.bio) {
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
        )}

        {stage === 'edit-profile-picture' && (
          <SEditPicture
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
            <PictureContent data-body-scroll-lock-ignore>
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
            </PictureContent>
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
              <ImageZoomSlider
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
          </SEditPicture>
        )}

        {stage === 'edit-profile-cover' && (
          <SEditPicture
            key='edit-profile-cover'
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { delay: 0.5 } }}
            exit={{ x: 300, opacity: 0, transition: { duration: 0 } }}
          >
            {isMobile ? (
              <SGoBackButtonMobile
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                {t('editProfileMenu.button.backToCover')}
              </SGoBackButtonMobile>
            ) : (
              <SGoBackButtonDesktop
                onClick={handleSetStageToEditingGeneralUnsetPicture}
              >
                <div> {t('editProfileMenu.button.backToCover')}</div>
                <InlineSvg
                  svg={CancelIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SGoBackButtonDesktop>
            )}
            <PictureContent>
              <ProfileCoverImageCropper
                crop={cropCoverImage}
                zoom={zoomCoverImage}
                minZoom={minZoomCoverImage}
                maxZoom={minZoomCoverImage + 2}
                profileCoverUrlInEdit={coverUrlInEdit}
                originalImageWidth={originalCoverImageWidth}
                disabled={updateCoverImageLoading}
                onCropChange={setCropCoverImage}
                onCropComplete={onCropCompleteCoverImage}
                onZoomChange={setZoomCoverImage}
              />
            </PictureContent>
            <SSliderWrapper>
              <Button
                iconOnly
                size='sm'
                view='transparent'
                disabled={
                  zoomCoverImage <= minZoomCoverImage || updateCoverImageLoading
                }
                onClick={handleZoomOutCoverImage}
              >
                <InlineSvg
                  svg={ZoomOutIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </Button>
              <ImageZoomSlider
                value={zoomCoverImage}
                min={minZoomCoverImage}
                max={minZoomCoverImage + 2}
                step={0.1}
                ariaLabel='Zoom'
                disabled={updateCoverImageLoading}
                onChange={(e) =>
                  setZoomCoverImage(
                    Math.max(Number(e.target.value), minZoomCoverImage)
                  )
                }
              />
              <Button
                iconOnly
                size='sm'
                view='transparent'
                disabled={
                  zoomCoverImage >= minZoomCoverImage + 2 ||
                  updateCoverImageLoading
                }
                onClick={handleZoomInCoverImage}
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
                disabled={updateCoverImageLoading}
                onClick={handleSetStageToEditingGeneralUnsetPicture}
                onClickCapture={() => {
                  Mixpanel.track('Click Cancel Cover Image Button', {
                    _stage: 'MyProfile',
                    _component: 'EditProfileMenu',
                  });
                }}
              >
                {t('editProfileMenu.button.cancel')}
              </Button>
              <Button
                withShadow
                disabled={updateCoverImageLoading}
                onClick={completeCoverImageCropAndSave}
                onClickCapture={() => {
                  Mixpanel.track('Click Save Cover Image Button', {
                    _stage: 'MyProfile',
                    _component: 'EditProfileMenu',
                  });
                }}
              >
                {t('editProfileMenu.button.save')}
              </Button>
            </SControlsWrapperPicture>
          </SEditPicture>
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

const PictureContent = styled.div`
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

const SEditPicture = styled(motion.div)`
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
