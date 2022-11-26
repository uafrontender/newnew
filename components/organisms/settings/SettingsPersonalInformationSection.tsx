/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Button from '../../atoms/Button';
import SettingsBirthDateInput from '../../molecules/profile/SettingsBirthDateInput';
import SettingsEmail from '../../molecules/profile/SettingsEmail';
import EditEmailModal from '../../molecules/settings/EditEmailModal';

import { updateMe } from '../../../api/endpoints/user';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { setUserData } from '../../../redux-store/slices/userStateSlice';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const maxDate = new Date();

type TSettingsPersonalInformationSection = {
  currentEmail?: string;
  currentDate?: Date;
  // Layout
  isMobile: boolean;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};
const SettingsPersonalInformationSection: React.FunctionComponent<
  TSettingsPersonalInformationSection
> = ({ currentEmail, currentDate, isMobile, handleSetActive }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();

  const user = useAppSelector((state) => state.user);
  const { editEmail } = router.query;

  const [dateInEdit, setDateInEdit] = useState(currentDate ?? undefined);
  const [dateError, setDateError] = useState('');
  const [wasDateModified, setWasDateModified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleDateInput = (value: Date) => {
    if (value === null) {
      setDateInEdit(undefined);
      return;
    }
    setDateInEdit(
      new Date(value.getFullYear(), value.getMonth(), value.getDate())
    );
  };

  const handleResetModifications = () => {
    setDateInEdit(currentDate ?? undefined);
    setDateError('');
  };

  const handleSaveModifications = async () => {
    try {
      setIsLoading(true);

      if (
        wasDateModified &&
        dateInEdit &&
        dateInEdit.getMonth() &&
        dateInEdit.getFullYear() &&
        dateInEdit.getDate()
      ) {
        const updateDatePayload = new newnewapi.UpdateMeRequest({
          dateOfBirth: {
            year: dateInEdit.getFullYear(),
            month: dateInEdit.getMonth() + 1,
            day: dateInEdit.getDate(),
          },
        });

        const updateDateResponse = await updateMe(updateDatePayload);

        if (!updateDateResponse.data || updateDateResponse.error) {
          throw new Error('Date update error');
        }

        dispatch(
          setUserData({
            options: {
              ...user.userData?.options,
              birthDateUpdatesLeft:
                updateDateResponse.data.me?.options?.birthDateUpdatesLeft,
            },
            dateOfBirth: {
              day: updateDateResponse.data.me?.dateOfBirth?.day,
              month: updateDateResponse.data.me?.dateOfBirth?.month,
              year: updateDateResponse.data.me?.dateOfBirth?.year,
            },
          })
        );
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      // TODO: fix error handling, there are other errors!
      if ((err as Error).message === 'Date update error') {
        setDateError('tooYoung');
      } else {
        showErrorToastPredefined(undefined);
      }
    }
  };

  useEffect(() => {
    if (dateInEdit?.getTime() !== currentDate?.getTime()) {
      setWasDateModified(true);
    } else {
      setWasDateModified(false);
    }
  }, [dateInEdit, currentDate]);

  return (
    <SWrapper>
      <SInputsWrapper>
        <SettingsEmail
          value={currentEmail}
          labelCaption={t(
            'Settings.sections.personalInformation.emailInput.label'
          )}
          placeholder={t(
            'Settings.sections.personalInformation.emailInput.placeholder'
          )}
          onEditButtonClick={() => {
            router.push(
              '/profile/settings?editEmail=true',
              '/profile/settings/edit-email'
            );
          }}
        />
        <EditEmailModal
          show={!!editEmail}
          onClose={() => {
            router.replace('/profile/settings');
          }}
        />
        <SettingsBirthDateInput
          value={dateInEdit}
          maxDate={maxDate}
          locale={router.locale}
          disabled={
            !user.userData?.options?.birthDateUpdatesLeft ||
            user.userData.options.birthDateUpdatesLeft <= 0
          }
          submitError={
            dateError
              ? t(
                  `Settings.sections.personalInformation.birthDateInput.errors.${dateError}`
                )
              : undefined
          }
          handleResetSubmitError={() => setDateError('')}
          labelCaption={t(
            'Settings.sections.personalInformation.birthDateInput.label'
          )}
          bottomCaption={t(
            'Settings.sections.personalInformation.birthDateInput.captions.cannotChange'
          )}
          onChange={handleDateInput}
          handleSetActive={() => handleSetActive()}
        />
      </SInputsWrapper>
      <AnimatePresence>
        {wasDateModified ? (
          <SControlsWrapper
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button
              view='primaryGrad'
              onClick={() => handleSaveModifications()}
              disabled={isLoading}
            >
              {t('Settings.sections.personalInformation.button.save')}
            </Button>
            <Button
              view='secondary'
              style={{
                ...(isMobile ? { order: -1 } : {}),
              }}
              onClick={() => handleResetModifications()}
            >
              {t('Settings.sections.personalInformation.button.cancel')}
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

const SWrapper = styled.div``;

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
