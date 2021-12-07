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

import Button from '../../atoms/Button';
import SettingsBirthDateInput from '../../molecules/profile/SettingsBirthDateInput';
import SettingsEmailInput from '../../molecules/profile/SettingsEmailInput';

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
  const router = useRouter();
  const { t } = useTranslation('profile');
  const [wasModifed, setWasModified] = useState(false);
  const [emailInEdit, setEmailInEdit] = useState(currentEmail ?? '');
  const [dateInEdit, setDateInEdit] = useState(currentDate ?? undefined);

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

  useEffect(() => {
    if (emailInEdit !== currentEmail || dateInEdit !== currentDate) {
      setWasModified(true);
    } else {
      setWasModified(false);
    }
  }, [
    emailInEdit, currentEmail,
    dateInEdit, currentDate,
    setWasModified,
  ]);

  return (
    <SWrapper>
      <SInputsWrapper>
        <SettingsEmailInput
          value={emailInEdit}
          isValid={emailInEdit.length > 0 ? validator.isEmail(emailInEdit) : true}
          labelCaption={t('Settings.sections.PersonalInformation.emailInput.label')}
          placeholder={t('Settings.sections.PersonalInformation.emailInput.placeholder')}
          // Temp
          errorCaption={t('Settings.sections.PersonalInformation.emailInput.errors.invalidEmail')}
          onChange={handleEmailInput}
          onFocus={() => handleSetActive()}
        />
        <SettingsBirthDateInput
          value={dateInEdit}
          locale={router.locale}
          disabled={false}
          labelCaption={t('Settings.sections.PersonalInformation.birthDateInput.label')}
          bottomCaption={t('Settings.sections.PersonalInformation.birthDateInput.captions.twoTimesOnly')}
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
