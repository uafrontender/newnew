import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Router, { useRouter } from 'next/router';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import validator from 'validator';
import isEqual from 'lodash/isEqual';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { useUserData } from '../../../contexts/userDataContext';

import Headline from '../../atoms/Headline';
import OnboardingInput from './OnboardingInput';
import OnboardingBirthDateInput from './OnboardingBirthDateInput';
import OnboardingProfileImageInput from './OnboardingProfileImageInput';
import isImage from '../../../utils/isImage';

import { getImageUploadUrl } from '../../../api/endpoints/upload';
import {
  acceptCreatorTerms,
  becomeCreator,
  sendVerificationNewEmail,
  updateMe,
  validateUsernameTextField,
} from '../../../api/endpoints/user';
import useUpdateEffect from '../../../utils/hooks/useUpdateEffect';
import Button from '../../atoms/Button';
import isBrowser from '../../../utils/isBrowser';
import OnboardingCountrySelect from './OnboardingCountrySelect';
import OnboardingSectionUsernameInput from './OnboardingUsernameInput';
import OnboardingSectionNicknameInput from './OnboardingNicknameInput';
import { validateText } from '../../../api/endpoints/infrastructure';
import resizeImage from '../../../utils/resizeImage';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../../../utils/hooks/useErrorToasts';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { NAME_LENGTH_LIMIT } from '../../../utils/consts';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';
import OnboardingEditProfileImageModal from './OnboardingEditProfileImageModal';
import isStringEmpty from '../../../utils/isStringEmpty';

const LoadingModal = dynamic(() => import('../LoadingModal'));
const CheckboxWithALink = dynamic(() => import('./CheckboxWithALink'));
const GoBackButton = dynamic(() => import('../GoBackButton'));
const TermsOfServiceModal = dynamic(() => import('./TermsOfServiceModal'));

const maxDate = new Date();

const errorSwitch = (status: newnewapi.ValidateTextResponse.Status) => {
  switch (status) {
    case newnewapi.ValidateTextResponse.Status.TOO_LONG:
      return 'tooLong';
    case newnewapi.ValidateTextResponse.Status.TOO_SHORT:
      return 'tooShort';
    case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE:
      return 'inappropriate';
    case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION:
      return 'linksForbidden';
    default:
      return 'generic';
  }
};

const errorSwitchUsername = (
  status: newnewapi.ValidateUsernameResponse.Status
) => {
  switch (status) {
    case newnewapi.ValidateUsernameResponse.Status.TOO_LONG:
      return 'tooLong';
    case newnewapi.ValidateUsernameResponse.Status.TOO_SHORT:
      return 'tooShort';
    case newnewapi.ValidateUsernameResponse.Status.INVALID_CHARACTER:
      return 'invalidChar';
    case newnewapi.ValidateUsernameResponse.Status.INAPPROPRIATE:
      return 'inappropriate';
    case newnewapi.ValidateUsernameResponse.Status.USERNAME_TAKEN:
      return 'taken';
    default:
      return 'generic';
  }
};

type TFieldsToBeUpdated = {
  firstName?: boolean;
  lastName?: boolean;
  username?: boolean;
  nickname?: boolean;
  email?: boolean;
  countryOfResidence: boolean;
  dateOfBirth?: boolean;
  image?: boolean;
};

interface IOnboardingSectionDetails {
  isAvatarCustom: boolean;
  availableCountries: newnewapi.Country[];
}

const OnboardingSectionDetails: React.FunctionComponent<
  IOnboardingSectionDetails
> = ({ isAvatarCustom, availableCountries }) => {
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { t } = useTranslation('page-CreatorOnboarding');
  const { userData, updateUserData, setCreatorDataLoaded } = useUserData();
  const { resizeMode, handleBecameCreator, logoutAndRedirect } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  // Firstname
  const [firstNameInEdit, setFirstnameInEdit] = useState('');
  const [firstNameError, setFirstnameError] = useState('');
  const handleFirstnameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || e.target.value.length < 2) {
      setFirstnameError('tooShort');
    } else if (e.target.value.length > NAME_LENGTH_LIMIT) {
      setFirstnameError('tooLong');
    } else if (e.target.value.trim() !== e.target.value) {
      setFirstnameError('sideSpacesForbidden');
    } else {
      setFirstnameError('');
    }

    if (isStringEmpty(e.target.value)) {
      setFirstnameInEdit('');
    } else {
      setFirstnameInEdit(e.target.value);
    }
  };

  const [lastNameInEdit, setLastnameInEdit] = useState('');
  const [lastNameError, setLastnameError] = useState('');
  const handleLastnameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || e.target.value.length < 2) {
      setLastnameError('tooShort');
    } else if (e.target.value.length > NAME_LENGTH_LIMIT) {
      setLastnameError('tooLong');
    } else if (e.target.value.trim() !== e.target.value) {
      setLastnameError('sideSpacesForbidden');
    } else {
      setLastnameError('');
    }

    if (isStringEmpty(e.target.value)) {
      setLastnameInEdit('');
    } else {
      setLastnameInEdit(e.target.value);
    }
  };

  // Username
  const [usernameInEdit, setUsernameInEdit] = useState(
    userData?.username ?? ''
  );
  const [usernameError, setUsernameError] = useState('');
  const handleUpdateUsername = (value: string) => {
    const newValue = value.replace('@', '');
    setUsernameInEdit(newValue);
  };

  // Nickname
  const [nicknameInEdit, setNicknameInEdit] = useState(
    userData?.nickname ?? ''
  );
  const [nicknameError, setNicknameError] = useState('');
  const handleUpdateNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isStringEmpty(e.target.value)) {
      setNicknameInEdit('');
    } else {
      setNicknameInEdit(e.target.value);
    }
  };

  const [minZoomProfileImage, setMinZoomProfileImage] = useState(1);

  // API validations
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const validateUsernameAbortControllerRef = useRef<
    AbortController | undefined
  >();
  const validateUsernameViaAPI = useCallback(
    async (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setIsAPIValidateLoading(true);
      if (validateUsernameAbortControllerRef.current) {
        validateUsernameAbortControllerRef.current?.abort();
      }
      validateUsernameAbortControllerRef.current = new AbortController();
      try {
        let text = e.target.value;

        if (text.length === 0) {
          setUsernameError('');
          return;
        }

        text = text.replace('@', '');

        // skip validation if username is equal to current username
        if (text === userData?.username) {
          setUsernameError('');

          return;
        }

        const payload = new newnewapi.ValidateUsernameRequest({
          username: text,
        });

        const res = await validateUsernameTextField(
          payload,
          validateUsernameAbortControllerRef?.current?.signal
        );

        if (!res.data?.status) {
          throw new Error('An error occurred');
        }

        if (res.data?.status !== newnewapi.ValidateUsernameResponse.Status.OK) {
          setUsernameError(errorSwitchUsername(res.data?.status));
        } else {
          setUsernameError('');
        }

        setIsAPIValidateLoading(false);
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
      }
    },
    [userData?.username, setUsernameError, logoutAndRedirect]
  );

  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateNicknameViaAPI = useCallback(
    async (e: React.FocusEvent<HTMLInputElement, Element>) => {
      if (e.target.value.trim() !== e.target.value) {
        setNicknameError('sideSpacesForbidden');
        return;
      }

      if (e.target.value.length > NAME_LENGTH_LIMIT) {
        setNicknameError('tooLong');
        return;
      }

      const text = e.target.value?.trim();
      if (!text) {
        setNicknameError('');
        return;
      }

      if (validateTextAbortControllerRef.current) {
        validateTextAbortControllerRef.current?.abort();
      }
      validateTextAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind: newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
          text,
        });

        const res = await validateText(
          payload,
          validateTextAbortControllerRef?.current?.signal
        );

        if (!res.data?.status) {
          throw new Error('An error occurred');
        }

        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setNicknameError(errorSwitch(res.data?.status));
        } else {
          setNicknameError('');
        }

        setIsAPIValidateLoading(false);
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
      }
    },
    [setNicknameError, logoutAndRedirect]
  );

  // Email
  const [emailInEdit, setEmailInEdit] = useState(userData?.email ?? '');
  const [emailError, setEmailError] = useState<
    'invalidEmail' | 'emailTaken' | 'requestFailed' | undefined
  >(undefined);
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (emailError) {
      setEmailError(undefined);
    }
    setEmailInEdit(e.target.value);
  };

  // CoR
  const countries = useMemo(
    () => availableCountries.map((o) => o.code),
    [availableCountries]
  );
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // Birthdate
  const [dateInEdit, setDateInEdit] = useState<newnewapi.IDateComponents>(
    userData?.dateOfBirth
      ? userData?.dateOfBirth
      : {
          day: undefined,
          month: undefined,
          year: undefined,
        }
  );
  const [dateError, setDateError] = useState('');

  const handleDateInput = (value: newnewapi.IDateComponents) => {
    setDateInEdit(value);
  };

  // Profile image
  const [imageToSave, setImageToSave] = useState<File | null>(null);
  const [cropMenuOpen, setCropMenuOpen] = useState(false);
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
  const [originalProfileImageWidth, setOriginalProfileImageWidth] = useState(0);
  // Determine whether or not the profile image is generic
  const [imageInEdit, setImageInEdit] = useState(
    userData?.avatarUrl && isAvatarCustom ? userData?.avatarUrl : ''
  );

  // Terms of service
  const [agreedToTos, setAgreedToTos] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  // Save new data
  const [fieldsToBeUpdated, setFieldsToBeUpdated] =
    useState<TFieldsToBeUpdated>({
      ...(!emailInEdit
        ? // || (emailInEdit && !userData?.options?.isEmailVerified)
          { email: true }
        : {}),
      countryOfResidence: true,
      ...(!dateInEdit
        ? {
            dateOfBirth: true,
          }
        : {}),
      ...(!imageInEdit
        ? {
            image: true,
          }
        : {}),
    });

  const [fieldsValid, setFieldsValid] = useState({
    firstName: false,
    lastName: false,
    username: usernameInEdit.length > 0,
    nickname: nicknameInEdit.length > 0,
    email: validator.isEmail(emailInEdit),
    countryOfResidence: true,
    dateOfBirth:
      Object.values(dateInEdit).length === 3
        ? !Object.values(dateInEdit).some((v) => v === undefined)
        : false,
    image: !!imageInEdit,
    agreedToTos: true,
  });
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

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

          // eslint-disable-next-line react/no-this-in-sfc
          setOriginalProfileImageWidth(properlySizedImage.width);
          const minZoom =
            Math.max(properlySizedImage.height, properlySizedImage.width) /
            Math.min(properlySizedImage.height, properlySizedImage.width);

          setMinZoomProfileImage(minZoom);

          setAvatarUrlInEdit(properlySizedImage.url as string);
          setCropMenuOpen(true);
        }
      });
    }
  };

  const handleSaveChangesAndGoToDashboard = useCallback(async () => {
    if (isAPIValidateLoading) {
      return;
    }
    let newAvatarUrl;
    try {
      Mixpanel.track('Submit Onboarding Details', {
        _stage: 'Onboarding',
        _component: 'OnboardingSectionDetails',
      });

      setLoadingModalOpen(true);

      if (fieldsToBeUpdated.image) {
        const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
          filename: imageToSave?.name,
        });

        const imgUploadRes = await getImageUploadUrl(imageUrlPayload);

        if (!imgUploadRes?.data || imgUploadRes.error) {
          throw new Error(imgUploadRes?.error?.message ?? 'Upload error');
        }

        const uploadResponse = await fetch(imgUploadRes.data.uploadUrl, {
          method: 'PUT',
          body: imageToSave,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        newAvatarUrl = imgUploadRes.data.publicUrl;
      }

      const updateMePayload = new newnewapi.UpdateMeRequest({
        countryCode: selectedCountry,
        isForOnboarding: true,
        ...(fieldsToBeUpdated.firstName
          ? {
              firstName: firstNameInEdit.trim(),
            }
          : {}),
        ...(fieldsToBeUpdated.lastName
          ? {
              lastName: lastNameInEdit.trim(),
            }
          : {}),
        ...(fieldsToBeUpdated.username
          ? {
              username: usernameInEdit.trim(),
            }
          : {}),
        ...(fieldsToBeUpdated.nickname
          ? {
              nickname: nicknameInEdit.trim(),
            }
          : {}),
        ...(fieldsToBeUpdated.dateOfBirth &&
        !isEqual(userData?.dateOfBirth, fieldsToBeUpdated.dateOfBirth)
          ? {
              dateOfBirth: dateInEdit,
            }
          : {}),
        ...(newAvatarUrl
          ? {
              avatarUrl: newAvatarUrl,
            }
          : {}),
      });

      const updateMeRes = await updateMe(updateMePayload);
      if (!updateMeRes?.data || updateMeRes.error) {
        throw new Error(updateMeRes?.error?.message || 'Request failed');
      }

      updateUserData({
        username: updateMeRes.data.me?.username ?? undefined,
        nickname: updateMeRes.data.me?.nickname ?? undefined,
        avatarUrl: updateMeRes.data.me?.avatarUrl ?? undefined,
        countryCode: updateMeRes.data.me?.countryCode ?? undefined,
        dateOfBirth: updateMeRes.data.me?.dateOfBirth ?? undefined,
      });

      if (fieldsToBeUpdated.email) {
        const sendVerificationCodePayload =
          new newnewapi.SendVerificationEmailRequest({
            emailAddress: emailInEdit,
            useCase:
              newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
          });

        const res = await sendVerificationNewEmail(sendVerificationCodePayload);

        if (!res?.data || res.error) {
          throw new Error('Request failed');
        }

        if (
          res.data.status ===
          newnewapi.SendVerificationEmailResponse.Status.EMAIL_INVALID
        ) {
          throw new Error('Incorrect email');
        }

        if (
          res.data.status ===
          newnewapi.SendVerificationEmailResponse.Status.EMAIL_TAKEN
        ) {
          throw new Error('Email already taken');
        }

        if (
          res.data.status !==
            newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
          res.data.status !==
            newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
        ) {
          throw new Error('Request failed');
        }

        const newEmailValue = encodeURIComponent(emailInEdit);
        Router.push(
          `/verify-new-email?email=${newEmailValue}&retryAfter=${res.data.retryAfter}&redirect=dashboard`
        );
      } else {
        const becomeCreatorPayload = new newnewapi.EmptyRequest({});

        const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

        if (!becomeCreatorRes?.data || becomeCreatorRes.error) {
          throw new Error('Become creator failed');
        }

        updateUserData({
          options: {
            isActivityPrivate:
              becomeCreatorRes.data.me?.options?.isActivityPrivate,
            isCreator: becomeCreatorRes.data.me?.options?.isCreator,
            isVerified: becomeCreatorRes.data.me?.options?.isVerified,
            creatorStatus: becomeCreatorRes.data.me?.options?.creatorStatus,
          },
        });

        if (becomeCreatorRes.data.me?.options?.isCreator) {
          handleBecameCreator();
        }

        const acceptTermsPayload = new newnewapi.EmptyRequest({});

        const res = await acceptCreatorTerms(acceptTermsPayload);

        if (res.error) {
          throw new Error(res.error?.message || 'Request failed');
        }

        setCreatorDataLoaded(true);
        Router.push('/creator/dashboard?askPushNotificationPermission=true');
      }
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);

      if (
        (err as Error).message &&
        (err as Error).message === 'Incorrect email'
      ) {
        setEmailError('invalidEmail');
      } else if (
        (err as Error).message &&
        (err as Error).message === 'Email already taken'
      ) {
        setEmailError('emailTaken');
      }
      if (
        (err as Error).message &&
        (err as Error).message === 'Request failed'
      ) {
        setEmailError('requestFailed');
      } else if (
        (err as Error).message &&
        (err as Error).message.includes('Uploaded image')
      ) {
        showErrorToastCustom(
          t('detailsSection.form.profilePicture.errors.inappropriate')
        );
      } else if (
        ((err as Error).message &&
          (err as Error).message === 'Age is under allowed age') ||
        ((err as Error).message &&
          (err as Error).message?.toLowerCase().includes('age'))
      ) {
        setDateError('tooYoung');
      } else {
        showErrorToastPredefined(undefined);
      }

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
    fieldsToBeUpdated,
    dateInEdit,
    selectedCountry,
    firstNameInEdit,
    lastNameInEdit,
    nicknameInEdit,
    usernameInEdit,
    emailInEdit,
    userData,
    imageToSave,
    isAPIValidateLoading,
    setLoadingModalOpen,
    handleBecameCreator,
    updateUserData,
    setCreatorDataLoaded,
    logoutAndRedirect,
    showErrorToastCustom,
    showErrorToastPredefined,
    t,
  ]);

  // Update image to be saved
  useEffect(() => {
    if (imageToSave) {
      const imageUrl = URL.createObjectURL(imageToSave);
      setImageInEdit(imageUrl);
    }
  }, [imageToSave]);

  // Update what fields should be updated
  // Firstname
  useUpdateEffect(() => {
    if (firstNameInEdit !== userData?.firstName) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.firstName = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.firstName = false;
        return working;
      });
    }
  }, [firstNameInEdit, setFieldsToBeUpdated]);

  // Lastname
  useUpdateEffect(() => {
    if (lastNameInEdit !== userData?.lastName) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.lastName = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.lastName = false;
        return working;
      });
    }
  }, [lastNameInEdit, setFieldsToBeUpdated]);

  // Username
  useUpdateEffect(() => {
    if (usernameInEdit !== userData?.username) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.username = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.username = false;
        return working;
      });
    }
  }, [usernameInEdit, setFieldsToBeUpdated]);
  // Nickname
  useUpdateEffect(() => {
    if (nicknameInEdit !== userData?.nickname) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.nickname = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.nickname = false;
        return working;
      });
    }
  }, [nicknameInEdit, setFieldsToBeUpdated]);
  // Email
  useUpdateEffect(() => {
    if (emailInEdit !== userData?.email) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.email = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.email = false;
        return working;
      });
    }
  }, [emailInEdit, setFieldsToBeUpdated]);
  // Date of birth
  useUpdateEffect(() => {
    if (!isEqual(userData?.dateOfBirth, dateInEdit)) {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.dateOfBirth = true;
        return working;
      });
    } else {
      setFieldsToBeUpdated((curr) => {
        const working = curr;
        working.dateOfBirth = false;
        return working;
      });
    }
  }, [dateInEdit, setFieldsToBeUpdated]);
  // Image
  useUpdateEffect(() => {
    if (imageInEdit !== userData?.avatarUrl) {
      setFieldsToBeUpdated((curr) => {
        const working = { ...curr };
        working.image = true;
        return working;
      });
    }
  }, [imageInEdit, setFieldsToBeUpdated]);

  // Validate fields
  useEffect(() => {
    setFieldsValid((curr) => {
      const working = { ...curr };

      working.firstName = firstNameInEdit.trim().length > 1 && !firstNameError;
      working.lastName = lastNameInEdit.trim().length > 1 && !lastNameError;
      working.username = usernameInEdit.trim().length > 0 && !usernameError;
      working.nickname = nicknameInEdit.trim().length > 0 && !nicknameError;
      working.email = validator.isEmail(emailInEdit) && !emailError;
      working.dateOfBirth = !Object.values(dateInEdit).some(
        (v) => v === undefined
      );
      working.image = imageInEdit !== '';
      working.agreedToTos = agreedToTos;
      return working;
    });
  }, [
    firstNameInEdit,
    firstNameError,
    lastNameInEdit,
    lastNameError,
    usernameInEdit,
    usernameError,
    nicknameInEdit,
    nicknameError,
    emailInEdit,
    emailError,
    dateInEdit,
    imageInEdit,
    agreedToTos,
    setFieldsValid,
  ]);

  return (
    <>
      <SContainer isMobile={isMobile}>
        <SHeading variant={5}>{t('detailsSection.heading')}</SHeading>
        <STopContainer>
          <SFieldPairContainer>
            <OnboardingInput
              id='settings_first_name_input'
              type='text'
              value={firstNameInEdit}
              placeholder={t('detailsSection.form.firstName.placeholder')}
              onChange={handleFirstnameInput}
              errorCaption={t(
                `detailsSection.form.firstName.errors.${firstNameError}` as any
              )}
              isValid={firstNameError === ''}
            />
            <OnboardingInput
              id='settings_last_name_input'
              type='text'
              value={lastNameInEdit}
              placeholder={t('detailsSection.form.lastName.placeholder')}
              onChange={handleLastnameInput}
              errorCaption={t(
                `detailsSection.form.lastName.errors.${lastNameError}` as any
              )}
              isValid={lastNameError === ''}
            />
          </SFieldPairContainer>
          <SFieldPairContainer>
            <OnboardingSectionUsernameInput
              type='text'
              value={usernameInEdit}
              disabled={loadingModalOpen}
              popupCaption={
                <UsernamePopupList
                  points={[
                    {
                      text: t('detailsSection.form.username.points.1'),
                      isValid: usernameInEdit
                        ? usernameInEdit.length >= 2 &&
                          usernameInEdit.length <= 25
                        : false,
                    },
                    {
                      text: t('detailsSection.form.username.points.2'),
                      isValid: usernameInEdit
                        ? validator.isLowercase(usernameInEdit)
                        : false,
                    },
                    {
                      text: t('detailsSection.form.username.points.3'),
                      isValid: usernameInEdit
                        ? validator.isAlphanumeric(usernameInEdit)
                        : false,
                    },
                  ]}
                />
              }
              frequencyCaption={t(
                'detailsSection.form.username.frequencyCaption'
              )}
              errorCaption={t(
                `detailsSection.form.username.errors.${usernameError}` as any
              )}
              placeholder={t('detailsSection.form.username.placeholder')}
              isValid={usernameError === ''}
              onChange={handleUpdateUsername}
              onBlur={validateUsernameViaAPI}
              onFocus={() => setUsernameError('')}
            />
            <OnboardingSectionNicknameInput
              type='text'
              value={nicknameInEdit}
              disabled={loadingModalOpen}
              placeholder={t('detailsSection.form.nickname.placeholder')}
              errorCaption={t(
                `detailsSection.form.nickname.errors.${nicknameError}` as any
              )}
              isValid={nicknameError === ''}
              onChange={handleUpdateNickname}
              onBlur={validateNicknameViaAPI}
              onFocus={() => setNicknameError('')}
            />
          </SFieldPairContainer>
          <SFieldPairContainer marginBottom={34}>
            <OnboardingInput
              id='settings_email_input'
              type='email'
              value={emailInEdit}
              isValid={emailInEdit.length > 0 ? fieldsValid.email : true}
              isTaken={emailError === 'emailTaken'}
              placeholder={t('detailsSection.form.email.placeholder')}
              cantChangeInfoCaption={t(
                'detailsSection.form.email.cantChangeInfoCaption'
              )}
              errorCaption={
                emailError
                  ? t(`detailsSection.form.email.errors.${emailError}`)
                  : undefined
              }
              onChange={handleEmailInput}
              readOnly={!!userData?.email}
            />
            <OnboardingCountrySelect
              width='100%'
              selected={selectedCountry}
              options={countries}
              locale={router.locale}
              onSelect={(val) => setSelectedCountry(val)}
              closeOnSelect
            />
          </SFieldPairContainer>
          <OnboardingBirthDateInput
            value={dateInEdit}
            maxDate={maxDate}
            locale={router.locale}
            disabled={
              userData?.dateOfBirth
                ? Object.values(userData?.dateOfBirth).every(
                    (dateOfBirthEl) => !!dateOfBirthEl
                  )
                : false
            }
            isValid={dateError === ''}
            onChange={handleDateInput}
            handleResetIsValid={() => setDateError('')}
          />
        </STopContainer>
        {!isMobile && !isTablet && <SSeparator />}
        <SPhotoContainer>
          <OnboardingProfileImageInput
            id='avatar-input'
            imageInEditUrl={imageInEdit}
            handleChangeImageInEdit={handleSetProfilePictureInEdit}
          />
        </SPhotoContainer>
        {(isMobile || isTablet) && (
          <CheckboxWithALink
            label={t('detailsSection.agreedToTosCheckbox')}
            linkText={t('detailsSection.linkText')}
            value={agreedToTos}
            onLinkClicked={() => setTermsVisible(true)}
            onToggled={() => setAgreedToTos(!agreedToTos)}
          />
        )}
      </SContainer>
      <SControlsDiv>
        {!isMobile && (
          <BackButtonSection>
            <GoBackButton
              longArrow
              onClick={() => {
                Mixpanel.track('Navigation Item Clicked', {
                  _stage: 'Onboarding',
                  _button: 'Back button',
                  _component: 'OnboardingSectionDetails',
                });
                goBackOrRedirect('/');
              }}
            >
              {t('detailsSection.button.back')}
            </GoBackButton>
          </BackButtonSection>
        )}
        <ControlsSection>
          {!isMobile && !isTablet && (
            <CheckboxWithALink
              id='tos-checkbox'
              label={t('detailsSection.agreedToTosCheckbox')}
              linkText={t('detailsSection.linkText')}
              value={agreedToTos}
              onLinkClicked={() => setTermsVisible(true)}
              onToggled={() => setAgreedToTos(!agreedToTos)}
            />
          )}
          <SButton
            id='submit-button'
            view='primaryGrad'
            disabled={Object.values(fieldsValid).some((v) => v === false)}
            style={{
              width: isMobile ? '100%' : 'initial',
              ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
            }}
            onClick={() => handleSaveChangesAndGoToDashboard()}
          >
            {t('detailsSection.button.submit')}
          </SButton>
        </ControlsSection>
      </SControlsDiv>
      {cropMenuOpen && (
        <OnboardingEditProfileImageModal
          isOpen={cropMenuOpen}
          avatarUrlInEdit={avatarUrlInEdit}
          originalProfileImageWidth={originalProfileImageWidth}
          minZoom={minZoomProfileImage}
          handleSetImageToSave={(val) => setImageToSave(val)}
          setAvatarUrlInEdit={(val: string) => setAvatarUrlInEdit(val)}
          onClose={() => {
            setCropMenuOpen(false);

            if (isBrowser()) {
              window.history.replaceState(null, '');
            }
          }}
        />
      )}
      {/* Upload loading Modal */}
      {loadingModalOpen && (
        <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      )}
      {termsVisible && (
        <TermsOfServiceModal
          isOpen={termsVisible}
          zIndex={15}
          onClose={() => setTermsVisible(false)}
        />
      )}
    </>
  );
};

export default OnboardingSectionDetails;

const SContainer = styled.div<{
  isMobile: boolean;
}>`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: ${({ isMobile }) => (isMobile ? '0px' : '88px')};

  z-index: 2;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    padding-left: 152px;
    padding-right: 152px;
    margin-bottom: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;

    padding-left: 0;
    padding-right: 0;
    margin-bottom: 130px;
  }
`;

const SHeading = styled(Headline)`
  padding-right: 32px;

  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 48px;
  }
`;

const STopContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 32px 24px 45px 24px;
    border-radius: 16px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    background-color: initial;
    padding: initial;
    border-radius: initial;
    margin-bottom: initial;
  }
`;

const SFieldPairContainer = styled.div<{ marginBottom?: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;

  gap: 42px;
  margin-bottom: ${({ marginBottom }) =>
    marginBottom !== undefined ? `${marginBottom}px` : '42px;'};

  ${({ theme }) => theme.media.laptop} {
    flex-direction: row;
    gap: 16px;
  }
`;

const SSeparator = styled.div`
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
  margin-top: 32px;
  margin-bottom: 32px;
`;

const SPhotoContainer = styled.div`
  margin-top: 38px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 0px;
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    background-color: initial;
    padding: initial;
    border-radius: initial;
    margin-bottom: initial;
  }
`;

const SControlsDiv = styled.div`
  /* position: fixed; */
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 16px;
  width: calc(100% - 32px);

  display: flex;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.media.mobile} {
    padding-bottom: 16px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;

    padding-left: 152px;
    padding-bottom: 24px;

    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-left: 0;
  }
`;

const BackButtonSection = styled('div')`
  display: flex;

  ${({ theme }) => theme.media.tablet} {
    margin-left: 12px;
  }
`;

const ControlsSection = styled('div')`
  display: flex;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  height: 56px;

  ${({ theme }) => theme.media.tablet} {
    width: 170px;
    height: 48px;
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
