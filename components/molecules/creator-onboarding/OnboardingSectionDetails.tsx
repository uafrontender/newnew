/* eslint-disable react/no-danger */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import validator from 'validator';

import { useAppSelector } from '../../../redux-store/store';

import Headline from '../../atoms/Headline';
import DropdownSelect from '../../atoms/DropdownSelect';
import OnboardingEmailInput from './OnboardingEmailInput';
import OnboardingBirthDateInput from './OnboardingBirthDateInput';
import OnboardingProfileImageInput from './OnboardingProfileImageInput';
import isImage from '../../../utils/isImage';
import OnboardingEditProfileImageModal from './OnboardingEditProfileImageModal';

type CountryOption = {
  value: string;
  en: string;
}

const countriesMock: CountryOption[] = [
  {
    value: 'US',
    en: 'United States',
  },
  {
    value: 'Canada',
    en: 'Canada',
  },
];

interface IOnboardingSectionDetails {
  goToDashboard: () => void;
}

const OnboardingSectionDetails: React.FunctionComponent<IOnboardingSectionDetails> = ({
  goToDashboard,
}) => {
  const router = useRouter();
  const { t } = useTranslation('creator-onboarding');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Email
  const [emailInEdit, setEmailInEdit] = useState(user.userData?.email ?? '');
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInEdit(e.target.value);
  };

  // CoR
  const countries = useMemo(() => (
    countriesMock.map((o, i) => ({
      name: o.en,
      value: o.value,
    }))
  ), []);
  const [selectedCountry, setSelectedCountry] = useState(countries[0].value);

  // Birthdate
  // @ts-ignore
  const [dateInEdit, setDateInEdit] = useState(user?.userData?.dateOfBirth ?? undefined);
  const handleDateInput = (value: Date) => {
    if (value === null) {
      setDateInEdit(undefined);
      return;
    }
    setDateInEdit(value);
  };

  // Profile image
  const [cropMenuOpen, setCropMenuOpen] = useState(false);
  const [avatarUrlInEdit, setAvatarUrlInEdit] = useState('');
  const [originalProfileImageWidth, setOriginalProfileImageWidth] = useState(0);

  const [imageToSave, setImageToSave] = useState(null);
  const [imageInEdit, setImageInEdit] = useState(user.userData?.avatarUrl ?? '');

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
          });
        }
      });
    }
  };

  return (
    <>
      <SContainer>
        <SHeading
          variant={5}
        >
          {t('DetailsSection.heading')}
        </SHeading>
        <SFormItemContainer>
          <OnboardingEmailInput
            value={emailInEdit}
            isValid={emailInEdit.length > 0 ? validator.isEmail(emailInEdit) : true}
            labelCaption={t('DetailsSection.form.email.label')}
            placeholder={t('DetailsSection.form.email.placeholder')}
            // Temp
            errorCaption={t('DetailsSection.form.email.errors.invalidEmail')}
            onChange={handleEmailInput}
          />
        </SFormItemContainer>
        <SFormItemContainer>
          <SLabel>
            {t('DetailsSection.form.CoR.label')}
          </SLabel>
          <DropdownSelect<string>
            label={countries[countries.findIndex((o) => o.value === selectedCountry)].name}
            width="100%"
            selected={selectedCountry}
            options={countries}
            onSelect={(val) => setSelectedCountry(val)}
            closeOnSelect
          />
        </SFormItemContainer>
        <SFormItemContainer>
          <OnboardingBirthDateInput
            value={dateInEdit}
            locale={router.locale}
            disabled={false}
            labelCaption={t('DetailsSection.form.DoB.label')}
            bottomCaption={t('DetailsSection.form.DoB.captions.twoTimesOnly')}
            onChange={handleDateInput}
          />
        </SFormItemContainer>
        <SSeparator />
        <OnboardingProfileImageInput
          imageInEditUrl={imageInEdit}
          handleChangeImageInEdit={handleSetProfilePictureInEdit}
        />
      </SContainer>
      <OnboardingEditProfileImageModal
        isOpen={cropMenuOpen}
        avatarUrlInEdit={avatarUrlInEdit}
        originalProfileImageWidth={originalProfileImageWidth}
        setAvatarUrlInEdit={(val: string) => setAvatarUrlInEdit(val)}
        onClose={() => setCropMenuOpen(false)}
      />
    </>
  );
};

export default OnboardingSectionDetails;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    height: calc(100vh - 102px - 88px - 24px);
    overflow-y: scroll;

    padding-left: 152px;
    padding-right: 152px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: calc(100vh - 118px - 88px - 24px);

    padding-left: 0;
    padding-right: 104px;
  }
`;

const SHeading = styled(Headline)`
  padding-right: 32px;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 40px;
  }
`;

const SFormItemContainer = styled.div`
  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
  }

  ${({ theme }) => theme.media.tablet} {
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
