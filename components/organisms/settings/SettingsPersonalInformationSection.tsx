/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, {
  useEffect, useState,
} from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import validator from 'validator';
import { newnewapi } from 'newnew-api';

import Button from '../../atoms/Button';
import SettingsBirthDateInput from '../../molecules/profile/SettingsBirthDateInput';
import SettingsEmailInput from '../../molecules/profile/SettingsEmailInput';
import { sendVerificationNewEmail, updateMe } from '../../../api/endpoints/user';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { setUserData } from '../../../redux-store/slices/userStateSlice';
import useUpdateEffect from '../../../utils/hooks/useUpdateEffect';

const maxDate = new Date();

type TSettingsPersonalInformationSection = {
  currentEmail?: string;
  currentDate?: Date;
  // Layout
  isMobile: boolean;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
}
const SettingsPersonalInformationSection: React.FunctionComponent<TSettingsPersonalInformationSection> = ({
  currentEmail,
  currentDate,
  isMobile,
  handleSetActive,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation('profile');
  const user = useAppSelector((state) => state.user);

  const [wasModifed, setWasModified] = useState(false);

  const [emailInEdit, setEmailInEdit] = useState(currentEmail ?? '');
  const [emailError, setEmailError] = useState('');
  const [wasEmailModified, setWasEmailModified] = useState(false);

  const [dateInEdit, setDateInEdit] = useState(currentDate ?? undefined);
  const [dateError, setDateError] = useState('');
  const [wasDateModified, setWasDateModified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInEdit(e.target.value);
  };
  const handleDateInput = (value: Date) => {
    if (value === null) {
      setDateInEdit(undefined);
      return;
    }
    setDateInEdit(value);
  };

  const handleResetModifications = () => {
    setEmailInEdit(currentEmail ?? '');
    setDateInEdit(currentDate ?? undefined);
  };

  const handleSaveModifications = async () => {
    try {
      setIsLoading(true);

      if (wasDateModified) {
        const updateDatePayload = new newnewapi.UpdateMeRequest({
          dateOfBirth: {
            year: dateInEdit?.getFullYear(),
            month: dateInEdit?.getMonth()!! + 1,
            day: dateInEdit?.getDate(),
          },
        });

        const updateDateResponse = await updateMe(updateDatePayload);

        if (!updateDateResponse.data || updateDateResponse.error) {
          throw new Error('Date update error');
        }

        dispatch(setUserData({
          options: {
            ...user.userData?.options,
            birthDateUpdatesLeft: updateDateResponse.data.me?.options?.birthDateUpdatesLeft
          },
          dateOfBirth: {
            day: updateDateResponse.data.me?.dateOfBirth?.day,
            month: updateDateResponse.data.me?.dateOfBirth?.month,
            year: updateDateResponse.data.me?.dateOfBirth?.year,
          },
        }));
      }

      if (wasEmailModified) {
        const sendVerificationCodePayload = new newnewapi.SendVerificationEmailRequest({
          emailAddress: emailInEdit,
          useCase: newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
        });

        const res = await sendVerificationNewEmail(sendVerificationCodePayload);

        if (
          res.data?.status === newnewapi.SendVerificationEmailResponse.Status.SUCCESS
          && !res.error) {
          router.push(
            `/verify-new-email?email=${emailInEdit}&redirect=settings`,
          );
          return;
        // eslint-disable-next-line no-else-return
        } else {
          setEmailError('Taken');
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      if ((err as Error).message === 'Date update error') {
        setDateError('tooYoung');
      }
    }
  };

  useEffect(() => {
    if (emailInEdit.length > 0) {
      if (!validator.isEmail(emailInEdit)) {
        setEmailError('Invalid');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [emailInEdit]);

  useEffect(() => {
    if (emailInEdit !== currentEmail || dateInEdit?.getTime() !== currentDate?.getTime()) {
      setWasModified(true);
    } else {
      setWasModified(false);
    }
    if (emailInEdit !== currentEmail) {
      setWasEmailModified(true);
    } else {
      setWasEmailModified(false);
    }
    if (dateInEdit?.getTime() !== currentDate?.getTime()) {
      setWasDateModified(true);
    } else {
      setWasDateModified(false);
    }
  }, [
    emailInEdit, currentEmail,
    dateInEdit, currentDate,
    setWasModified,
  ]);

  useUpdateEffect(() => {
    if (currentEmail) {
      setEmailInEdit(currentEmail);
    }
  }, [currentEmail]);

  return (
    <SWrapper>
      <SInputsWrapper>
        <SettingsEmailInput
          value={emailInEdit}
          isValid={emailInEdit.length > 0 ? emailError === '' : true}
          labelCaption={t('Settings.sections.PersonalInformation.emailInput.label')}
          placeholder={t('Settings.sections.PersonalInformation.emailInput.placeholder')}
          // Temp
          errorCaption={
            emailError === 'Taken'
              ? t('Settings.sections.PersonalInformation.emailInput.errors.emailTaken')
              : t('Settings.sections.PersonalInformation.emailInput.errors.invalidEmail')
          }
          onChange={handleEmailInput}
          onFocus={() => handleSetActive()}
        />
        <SettingsBirthDateInput
          value={dateInEdit}
          maxDate={maxDate}
          locale={router.locale}
          disabled={user.userData?.options?.birthDateUpdatesLeft!! <= 0 || !user.userData?.options?.birthDateUpdatesLeft}
          submitError={dateError ? (
            t(`Settings.sections.PersonalInformation.birthDateInput.errors.${dateError}`)
          ) : undefined}
          handleResetSubmitError={() => setDateError('')}
          labelCaption={t('Settings.sections.PersonalInformation.birthDateInput.label')}
          bottomCaption={t('Settings.sections.PersonalInformation.birthDateInput.captions.cannotChange')}
          onChange={handleDateInput}
          handleSetActive={() => handleSetActive()}
        />
      </SInputsWrapper>
      <AnimatePresence>
        {wasModifed ? (
          <SControlsWrapper
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button
              view="primaryGrad"
              onClick={() => handleSaveModifications()}
              disabled={isLoading || emailError !== ''}
            >
              {t('Settings.sections.PersonalInformation.saveBtn')}
            </Button>
            <Button
              view="secondary"
              style={{
                ...(isMobile ? { order: -1 } : {}),
              }}
              onClick={() => handleResetModifications()}
            >
              {t('Settings.sections.PersonalInformation.cancelBtn')}
            </Button>
          </SControlsWrapper>
        ) : null}
      </AnimatePresence>
    </SWrapper>
  );
};

SettingsPersonalInformationSection.defaultProps = {
  currentEmail: undefined,
  currentDate: undefined,
};

export default SettingsPersonalInformationSection;

const SWrapper = styled.div`

`;

const SInputsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;

  gap: 16px;

  padding-bottom: 24px;
`;

const SControlsWrapper = styled(motion.div)`
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    justify-content: flex-start;
    gap: 24px;
  }

  button {
    margin-bottom: 24px;
  }
`;
