/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable react/no-danger */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import validator from 'validator';
import { debounce, isEqual } from 'lodash';
import { newnewapi } from 'newnew-api';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Headline from '../../atoms/Headline';
import OnboardingEmailInput from './OnboardingEmailInput';
import OnboardingBirthDateInput from './OnboardingBirthDateInput';
import OnboardingProfileImageInput from './OnboardingProfileImageInput';
import isImage from '../../../utils/isImage';
import OnboardingEditProfileImageModal from './OnboardingEditProfileImageModal';
import LoadingModal from '../LoadingModal';
import { getImageUploadUrl } from '../../../api/endpoints/upload';
import {
  becomeCreator, sendVerificationNewEmail, updateMe, validateUsernameTextField,
} from '../../../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect, setUserData } from '../../../redux-store/slices/userStateSlice';
import useUpdateEffect from '../../../utils/hooks/useUpdateEffect';
import GoBackButton from '../GoBackButton';
import Button from '../../atoms/Button';
import isBrowser from '../../../utils/isBrowser';
import OnboardingCountrySelect from './OnboardingCountrySelect';
import OnboardingSectionUsernameInput from './OnboardingSectionUsernameInput';
import OnboardingSectionNicknameInput from './OnboardingSectionNicknameInput';
import { validateText } from '../../../api/endpoints/infrastructure';

const maxDate = new Date();

const errorSwitch = (
  status: newnewapi.ValidateTextResponse.Status) => {
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
    default: {
      break;
    }
  }

  return errorMsg;
};

const errorSwitchUsername = (
  status: newnewapi.ValidateUsernameResponse.Status) => {
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

type TFieldsToBeUpdated = {
  username?: boolean;
  nickname?: boolean;
  email?: boolean;
  countryOfResidence: boolean;
  dateOfBirth?: boolean;
  image?: boolean;
};

interface IOnboardingSectionDetails {
  genericAvatarsUrls: string[];
  availableCountries: newnewapi.Country[];
  goToDashboard: () => void;
}

const OnboardingSectionDetails: React.FunctionComponent<IOnboardingSectionDetails> = ({
  genericAvatarsUrls,
  availableCountries,
  goToDashboard,
}) => {
  const router = useRouter();
  const { t } = useTranslation('creator-onboarding');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  // Username
  const [usernameInEdit, setUsernameInEdit] = useState(user.userData?.username ?? '');
  const [usernameError, setUsernameError] = useState('');
  const handleUpdateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInEdit(e.target.value);

    validateUsernameViaAPIDebounced(
      e.target.value,
    );
  };

  // Nickname
  const [nicknameInEdit, setNicknameInEdit] = useState(user.userData?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const handleUpdateNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNicknameInEdit(e.target.value);

    validateNicknameViaAPIDebounced(
      e.target.value,
    );
  };

  // API validations
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const validateUsernameViaAPI = useCallback(async (
    text: string,
  ) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateUsernameRequest({
        username: text,
      });

      const res = await validateUsernameTextField(
        payload,
      );

      if (!res.data?.status) throw new Error('An error occured');
      if (res.data?.status !== newnewapi.ValidateUsernameResponse.Status.OK) {
        setUsernameError(errorSwitchUsername(res.data?.status!!));
      } else {
        setUsernameError('');
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
        dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
      }
    }
  }, [setUsernameError, dispatch]);

  const validateUsernameViaAPIDebounced = useMemo(() => debounce((
    text: string,
  ) => {
    validateUsernameViaAPI(text);
  }, 250),
  [validateUsernameViaAPI]);

  const validateNicknameViaAPI = useCallback(async (
    text: string,
  ) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        kind: newnewapi.ValidateTextRequest.Kind.USER_NICKNAME,
        text,
      });

      const res = await validateText(
        payload,
      );

      if (!res.data?.status) throw new Error('An error occured');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setNicknameError(errorSwitch(res.data?.status!!));
      } else {
        setNicknameError('');
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
        dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
      }
    }
  }, [setNicknameError, dispatch]);

  const validateNicknameViaAPIDebounced = useMemo(() => debounce((
    text: string,
  ) => {
    validateNicknameViaAPI(text);
  }, 250),
  [validateNicknameViaAPI]);

  // Email
  const [emailInEdit, setEmailInEdit] = useState(user.userData?.email ?? '');
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInEdit(e.target.value);
  };

  // CoR
  const countries = useMemo(() => (
    availableCountries.map((o, i) => ({
      name: o.name,
      value: o.code,
    }))
  ), [availableCountries]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0].value);

  // Birthdate
  const [dateInEdit, setDateInEdit] = useState<newnewapi.IDateComponents
    >(user?.userData?.dateOfBirth ? user?.userData?.dateOfBirth : {
      day: undefined,
      month: undefined,
      year: undefined,
    });
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
    user.userData?.avatarUrl && !genericAvatarsUrls.includes(user.userData?.avatarUrl) ? (
      user.userData?.avatarUrl
    ) : '',
  );

  // Save new data
  const [fieldsToBeUpdated, setFieldsToBeUpdated] = useState<TFieldsToBeUpdated>({
    ...(
      (
        !emailInEdit
        // || (emailInEdit && !user.userData?.options?.isEmailVerified)
      ) ? { email: true } : {}
    ),
    countryOfResidence: true,
    ...(!dateInEdit ? {
      dateOfBirth: true,
    } : {}),
    ...(!imageInEdit ? {
      image: true,
    } : {}),
  });
  const [fieldsValid, setFieldsValid] = useState({
    username: usernameInEdit.length > 0,
    nickname: nicknameInEdit.length > 0,
    email: validator.isEmail(emailInEdit),
    countryOfResidence: true,
    dateOfBirth: !Object.values(dateInEdit).find((o) => o === undefined),
    image: imageInEdit ? true : false,
  });
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

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

          img.src = reader.result as string;

          // eslint-disable-next-line func-names
          img.addEventListener('load', function () {
            // eslint-disable-next-line react/no-this-in-sfc
            setOriginalProfileImageWidth(this.width);
            setCropMenuOpen(true);
            if (isBrowser()) {
              window.history.pushState(
                {
                  stage: 'edit-profile-picture',
                },
                '',
              );
            }
          });
        }
      });
    }
  };

  const handleSaveChangesAndGoToDashboard = useCallback(async () => {
    if (isAPIValidateLoading) return;
    let newAvatarUrl;
    try {
      setLoadingModalOpen(true);

      console.log(fieldsToBeUpdated);

      if (fieldsToBeUpdated.image) {
        const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
          filename: imageToSave?.name,
        });

        const imgUploadRes = await getImageUploadUrl(
          imageUrlPayload,
        );

        if (!imgUploadRes.data || imgUploadRes.error) throw new Error(imgUploadRes.error?.message ?? 'An error occured');

        const uploadResponse = await fetch(
          imgUploadRes.data.uploadUrl,
          {
            method: 'PUT',
            body: imageToSave,
            headers: {
              'Content-Type': 'image/png',
            },
          },
        );

        if (!uploadResponse.ok) throw new Error('Upload failed');

        newAvatarUrl = imgUploadRes.data.publicUrl;
      }

      const updateMePayload = new newnewapi.UpdateMeRequest({
        countryCode: selectedCountry,
        ...(fieldsToBeUpdated.username ? {
          username: usernameInEdit,
        } : {}),
        ...(fieldsToBeUpdated.nickname ? {
          nickname: nicknameInEdit,
        } : {}),
        ...(fieldsToBeUpdated.dateOfBirth ? {
          dateOfBirth: dateInEdit,
        } : {}),
        ...(newAvatarUrl ? {
          avatarUrl: newAvatarUrl,
        } : {}),
      });

      console.log(updateMePayload);

      const updateMeRes = await updateMe(
        updateMePayload,
      );

      if (!updateMeRes.data || updateMeRes.error) throw new Error(updateMeRes.error?.message ?? 'Request failed');

      // Update Redux state
      dispatch(setUserData({
        ...user.userData,
        avatarUrl: updateMeRes.data.me?.avatarUrl,
        countryCode: updateMeRes.data.me?.countryCode,
        dateOfBirth: updateMeRes.data.me?.dateOfBirth,
      }));

      // make actual call

      if (fieldsToBeUpdated.email) {
        console.log('Email was modified :)');

        const sendVerificationCodePayload = new newnewapi.SendVerificationEmailRequest({
          emailAddress: emailInEdit,
          useCase: newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
        });

        const res = await sendVerificationNewEmail(sendVerificationCodePayload);

        if (
          res.data?.status === newnewapi.SendVerificationEmailResponse.Status.SUCCESS
          && !res.error) {
          router.push(
            `/verify-new-email?email=${emailInEdit}&redirect=dashboard`,
          );
          return;
        // eslint-disable-next-line no-else-return
        }
        throw new Error('Email taken');
      } else {
        const becomeCreatorPayload = new newnewapi.EmptyRequest({});

        const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

        console.log(becomeCreatorRes);

        if (
          !becomeCreatorRes.data
          || becomeCreatorRes.error
        ) throw new Error('Become creator failed');

        dispatch(setUserData({
          options: {
            isActivityPrivate: becomeCreatorRes.data.me?.options?.isActivityPrivate,
            isCreator: becomeCreatorRes.data.me?.options?.isCreator,
            isVerified: becomeCreatorRes.data.me?.options?.isVerified,
            creatorStatus: becomeCreatorRes.data.me?.options?.creatorStatus,
          },
        }));

        goToDashboard();
      }
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);

      // if ((err as Error).message === 'Too young') {
      if ((err as Error).message) {
        setDateError('tooYoung');
      }

      if ((err as Error).message === 'No token') {
        dispatch(logoutUserClearCookiesAndRedirect());
      }
      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fieldsToBeUpdated,
    dateInEdit,
    selectedCountry,
    emailInEdit,
    user.userData,
    imageToSave,
    dispatch,
    isAPIValidateLoading,
    goToDashboard,
    setLoadingModalOpen,
  ]);

  // Update image to be saved
  useEffect(() => {
    if (imageToSave) {
      const imageUrl = URL.createObjectURL(imageToSave);
      setImageInEdit(imageUrl);
    }
  }, [imageToSave]);

  // Update what fields should be updated
  // Username
  useUpdateEffect(() => {
    if (
      usernameInEdit !== user.userData?.username
    ) {
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
    if (
      nicknameInEdit !== user.userData?.nickname
    ) {
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
    if (
      emailInEdit !== user.userData?.email
    ) {
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
    if (
      !isEqual(user.userData?.dateOfBirth, dateInEdit)
    ) {
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
    if (imageInEdit !== user.userData?.avatarUrl) {
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
      working.username = usernameInEdit.length > 0 && !usernameError;
      working.nickname = nicknameInEdit.length > 0 && !nicknameError;
      working.email = validator.isEmail(emailInEdit);
      working.dateOfBirth = !Object.values(dateInEdit).find((o) => o === undefined);
      working.image = imageInEdit !== '';
      return working;
    });
  }, [
    usernameInEdit,
    usernameError,
    nicknameInEdit,
    nicknameError,
    emailInEdit,
    dateInEdit,
    imageInEdit,
    setFieldsValid,
  ]);

  return (
    <>
      <SContainer>
        <SHeading
          variant={5}
        >
          {t('DetailsSection.heading')}
        </SHeading>
        <STopContainer>
          <SUsernameNicknameContainer>
            <OnboardingSectionUsernameInput
              type="text"
              value={usernameInEdit}
              disabled={loadingModalOpen}
              popupCaption={(
                <UsernamePopupList
                  points={[
                    {
                      text: t('DetailsSection.form.username.points.1'),
                      isValid: usernameInEdit ? (
                        usernameInEdit.length >= 8 && usernameInEdit.length <= 15
                      ) : false,
                    },
                    {
                      text: t('DetailsSection.form.username.points.2'),
                      isValid: usernameInEdit ? (
                        validator.isLowercase(usernameInEdit)
                      ) : false,
                    },
                    {
                      text: t('DetailsSection.form.username.points.3'),
                      isValid: usernameInEdit ? (
                        validator.isAlphanumeric(usernameInEdit)
                      ) : false,
                    },
                  ]}
                />
              )}
              labelCaption={t('DetailsSection.form.username.labelCaption')}
              frequencyCaption={t('DetailsSection.form.username.frequencyCaption')}
              errorCaption={t(`DetailsSection.form.username.errors.${usernameError}`)}
              placeholder={t('DetailsSection.form.username.placeholder')}
              isValid={usernameError === ''}
              onChange={handleUpdateUsername}
            />
            <OnboardingSectionNicknameInput
              type="text"
              value={nicknameInEdit}
              disabled={loadingModalOpen}
              placeholder={t('DetailsSection.form.nickname.placeholder')}
              labelCaption={t('DetailsSection.form.nickname.labelCaption')}
              errorCaption={t(`DetailsSection.form.nickname.errors.${nicknameError}`)}
              isValid={nicknameError === ''}
              onChange={handleUpdateNickname}
            />
          </SUsernameNicknameContainer>
          <SFormItemContainer>
            <OnboardingEmailInput
              value={emailInEdit}
              isValid={emailInEdit.length > 0 ? fieldsValid.email : true}
              labelCaption={t('DetailsSection.form.email.label')}
              placeholder={t('DetailsSection.form.email.placeholder')}
              cantChangeInfoCaption={t('DetailsSection.form.email.cantChangeInfoCaption')}
              errorCaption={t('DetailsSection.form.email.errors.invalidEmail')}
              onChange={handleEmailInput}
            />
          </SFormItemContainer>
          <OnboardingCountrySelect<string>
            label={countries[countries.findIndex((o) => o.value === selectedCountry)].name}
            width="100%"
            selected={selectedCountry}
            options={countries}
            onSelect={(val) => setSelectedCountry(val)}
            closeOnSelect
          />
          <SFormItemContainer>
            <OnboardingBirthDateInput
              value={dateInEdit}
              maxDate={maxDate}
              locale={router.locale}
              disabled={false}
              isValid={dateError === ''}
              labelCaption={t('DetailsSection.form.DoB.label')}
              bottomCaption={t('DetailsSection.form.DoB.captions.twoTimesOnly')}
              errorCaption={t('DetailsSection.form.DoB.errors.tooYoung')}
              onChange={handleDateInput}
              handleResetIsValid={() => setDateError('')}
            />
          </SFormItemContainer>
        </STopContainer>
        {!isTablet && (
          <SSeparator />
        )}
        <STopContainer>
          <OnboardingProfileImageInput
            imageInEditUrl={imageInEdit}
            handleChangeImageInEdit={handleSetProfilePictureInEdit}
          />
        </STopContainer>
      </SContainer>
      <SControlsDiv>
        {!isMobile && (
          <GoBackButton
            longArrow
            onClick={() => router.back()}
          >
            { t('DetailsSection.backButton') }
          </GoBackButton>
        )}
        <Button
          view="primaryGrad"
          disabled={Object.values(fieldsValid).some((v) => v === false)}
          style={{
            width: isMobile ? '100%' : 'initial',
            ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
          }}
          onClick={() => handleSaveChangesAndGoToDashboard()}
        >
          {isMobile ? (
            t('DetailsSection.submitMobile')
          ) : t('DetailsSection.submitDesktop') }
        </Button>
      </SControlsDiv>
      <OnboardingEditProfileImageModal
        isOpen={cropMenuOpen}
        avatarUrlInEdit={avatarUrlInEdit}
        originalProfileImageWidth={originalProfileImageWidth}
        handleSetImageToSave={(val) => setImageToSave(val)}
        setAvatarUrlInEdit={(val: string) => setAvatarUrlInEdit(val)}
        onClose={() => {
          setCropMenuOpen(false);
          // window.history.back();
          if (isBrowser()) {
            window.history.replaceState(
              null,
              '',
            );
          }
        }}
      />
      {/* Upload loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </>
  );
};

export default OnboardingSectionDetails;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

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
    padding-right: 104px;

    margin-bottom: 190px;
  }
`;

const SHeading = styled(Headline)`
  padding-right: 32px;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 40px;
  }
`;

const STopContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
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

const SUsernameNicknameContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    flex-direction: row;
    gap: 16px;
  }
`;

const SFormItemContainer = styled.div`
  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    /* width: 284px; */
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    /* width: 296px; */
  }
`;

const SLabel = styled.label`
  display: block;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-bottom: 6px;
`;

const SSeparator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  margin-bottom: 16px;
`;

const SControlsDiv = styled.div`
  position: fixed;
  bottom: 32px;
  left: 16px;
  width: calc(100% - 32px);

  display: flex;
  justify-content: space-between;


  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;

    padding-left: 152px;
    padding-right: 152px;

    width: 100%;

    button {
      width: 170px;
      height: 48px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    padding-left: 0;
    padding-right: 104px;
  }
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
