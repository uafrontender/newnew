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
import { updateMe } from '../../../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect, setUserData } from '../../../redux-store/slices/userStateSlice';
import useUpdateEffect from '../../../utils/hooks/useUpdateEffect';
import GoBackButton from '../GoBackButton';
import Button from '../../atoms/Button';
import isBrowser from '../../../utils/isBrowser';
import OnboardingCountrySelect from './OnboardingCountrySelect';

const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

type TFieldsToBeUpdated = {
  email?: boolean;
  countryOfResidence: boolean;
  dateOfBirth?: boolean;
  image?: boolean;
};

interface IOnboardingSectionDetails {
  genericAvatarsUrls: string[];
  availableCountries: any[];
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

  // Email
  const [emailInEdit, setEmailInEdit] = useState(user.userData?.email ?? '');
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInEdit(e.target.value);
  };

  // CoR
  const countries = useMemo(() => (
    availableCountries.map((o, i) => ({
      name: o.en,
      value: o.value,
    }))
  ), [availableCountries]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0].value);

  // Birthdate

  // NB! temp
  const parsed: newnewapi.IDateComponents = {
    day: 1,
    month: 5,
    year: 1990,
  };

  const [dateInEdit, setDateInEdit] = useState<
    Date | undefined
  >(user?.userData?.dateOfBirth ? (
    new Date(
      user?.userData.dateOfBirth.year!!,
      user?.userData.dateOfBirth.month!!,
      user?.userData.dateOfBirth.day!!,
    )
  // ) : undefined}
  ) : (
    new Date(
      parsed.year!!,
      parsed.month!!,
      parsed.day!!,
    )
  ));
  const [isDateValid, setIsDateValid] = useState(
    // @ts-ignore
    (user?.userData?.dateOfBirth ? (
      // @ts-ignore
      user?.userData?.dateOfBirth instanceof Date
      // @ts-ignore
      && (user?.userData?.dateOfBirth as Date) < maxDate
    ) : false),
  );

  const handleDateInput = (value: Date) => {
    if (value === null) {
      setDateInEdit(undefined);
      return;
    }
    setDateInEdit(value);
  };
  const handleSetIsDateValid = useCallback((value: boolean) => {
    setIsDateValid(value);
  }, []);

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
    email: validator.isEmail(emailInEdit),
    countryOfResidence: true,
    dateOfBirth: isDateValid,
    image: imageInEdit ? true : false,
  });
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

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
    try {
      setLoadingModalOpen(true);

      if (fieldsToBeUpdated.image) {
        const imageUrlPayload = new newnewapi.GetImageUploadUrlRequest({
          filename: imageToSave?.name,
        });

        const res = await getImageUploadUrl(
          imageUrlPayload,
        );

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'An error occured');

        const uploadResponse = await fetch(
          res.data.uploadUrl,
          {
            method: 'PUT',
            body: imageToSave,
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
      }

      setLoadingModalOpen(false);
      // router.push('/');
      goToDashboard();
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);
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
    fieldsToBeUpdated,
    user.userData,
    imageToSave,
    dispatch,
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
  // Email
  useUpdateEffect(() => {
    if (
      emailInEdit !== user.userData?.email
      // || (emailInEdit !== user.userData?.email && !user.userData?.options?.isVerified)
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
      // @ts-ignore
      user.userData?.dateOfBirth && dateInEdit !== user.userData?.dateOfBirth
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
  }, [emailInEdit, setFieldsToBeUpdated]);
  // Image
  useUpdateEffect(() => {
    setFieldsToBeUpdated((curr) => {
      const working = { ...curr };
      working.image = true;
      return working;
    });
  }, [imageInEdit, setFieldsToBeUpdated]);

  // Validate fields
  useEffect(() => {
    setFieldsValid((curr) => {
      const working = { ...curr };
      working.email = validator.isEmail(emailInEdit);
      working.dateOfBirth = isDateValid;
      working.image = imageInEdit !== '';
      return working;
    });
  }, [
    emailInEdit,
    dateInEdit,
    isDateValid,
    imageInEdit,
    setFieldsValid,
  ]);

  // Test
  useEffect(() => {
    // console.log('FIELDS TO BE UPDATED: ');
    // console.log(JSON.stringify(fieldsToBeUpdated));
    // console.log('FIELDS VALIDITY: ');
    // console.log(JSON.stringify(fieldsValid));
  }, [
    fieldsToBeUpdated,
    fieldsValid,
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
          <SFormItemContainer>
            <OnboardingEmailInput
              value={emailInEdit}
              isValid={emailInEdit.length > 0 ? fieldsValid.email : true}
              labelCaption={t('DetailsSection.form.email.label')}
              placeholder={t('DetailsSection.form.email.placeholder')}
              cantChangeInfoCaption={t('DetailsSection.form.email.cantChangeInfoCaption')}
              // @ts-ignore
              // readOnly={!user.userData?.options?.isEmailVerified}
              // readOnly
              // Temp
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
              labelCaption={t('DetailsSection.form.DoB.label')}
              bottomCaption={t('DetailsSection.form.DoB.captions.twoTimesOnly')}
              handleSetIsDateValid={handleSetIsDateValid}
              onChange={handleDateInput}
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
            longArrow={!isTablet}
            onClick={() => router.back()}
          >
            { t('DetailsSection.backButton') }
          </GoBackButton>
        )}
        <Button
          view="primaryGrad"
          disabled={Object.values(fieldsValid).some((v) => v === false)}
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

const SFormItemContainer = styled.div`
  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    /* width: 284px; */
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 296px;
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
