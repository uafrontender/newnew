import React, { useState, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import validator from 'validator';
import { newnewapi } from 'newnew-api';

import InlineSvg from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import SettingEmailInput from '../profile/SettingsEmailInput';
import Button from '../../atoms/Button';

import { sendVerificationNewEmail } from '../../../api/endpoints/user';

import Logo from '../../../public/images/svg/mobile-logo.svg';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';

interface IEditEmailStepTwoModal {
  onComplete: (email: string) => void;
}

const EditEmailStepTwoModal = ({ onComplete }: IEditEmailStepTwoModal) => {
  const { t } = useTranslation('page-Profile');
  const { t: tVerify } = useTranslation('page-VerifyEmail');
  const { showErrorToastPredefined } = useErrorToasts();
  const theme = useTheme();

  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleSetNewEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);

    if (validator.isEmail(e.target.value)) {
      setIsValid(true);
      setNewEmailError('');
    } else {
      setIsValid(false);
      setNewEmailError(
        t(
          'Settings.sections.personalInformation.emailInput.errors.invalidEmail'
        )
      );
    }
  };

  const requestVerificationCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        Mixpanel.track('Set New Email', {
          _stage: 'Settings',
          _newEmail: newEmail,
        });

        setIsLoading(true);
        const sendVerificationCodePayload =
          new newnewapi.SendVerificationEmailRequest({
            emailAddress: newEmail,
            useCase:
              newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
          });

        const { data, error } = await sendVerificationNewEmail(
          sendVerificationCodePayload
        );

        if (
          data?.status ===
          newnewapi.SendVerificationEmailResponse.Status.EMAIL_TAKEN
        ) {
          setNewEmailError(tVerify('error.emailTaken'));
          setIsValid(false);

          throw new Error('Email taken');
        }

        if (
          data?.status ===
          newnewapi.SendVerificationEmailResponse.Status
            .NOT_CONFIRMED_EXISTING_EMAIL
        ) {
          setNewEmailError(tVerify('error.notConfirmedEmail'));
          setIsValid(false);

          throw new Error('Existing email is not Not confirmed');
        }

        if (
          data?.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS
        ) {
          showErrorToastPredefined(undefined);
          throw new Error(error?.message ?? 'Request failed');
        }

        onComplete(newEmail);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [newEmail, onComplete, tVerify, showErrorToastPredefined]
  );

  return (
    <>
      <SLogo
        svg={Logo}
        fill={theme.colorsThemed.accent.blue}
        width='60px'
        height='40px'
      />
      <SHeadline variant={4}>
        {t('Settings.sections.personalInformation.emailInput.whatsNew')}
      </SHeadline>
      <SForm onSubmit={requestVerificationCode}>
        <SInputWrapper>
          <SettingEmailInput
            labelCaption={t(
              'Settings.sections.personalInformation.emailInput.label'
            )}
            placeholder={t(
              'Settings.sections.personalInformation.emailInput.placeholder'
            )}
            isValid={isValid}
            errorCaption={newEmailError}
            onChange={handleSetNewEmail}
            value={newEmail}
            disabled={isLoading}
          />
        </SInputWrapper>
        <SButton
          type='submit'
          disabled={!newEmail || !!newEmailError}
          loading={isLoading}
        >
          {t('Settings.sections.personalInformation.emailInput.confirmEmail')}
        </SButton>
      </SForm>
    </>
  );
};

export default EditEmailStepTwoModal;

const SHeadline = styled(Headline)`
  text-align: center;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.laptopM} {
    margin-bottom: 40px;
  }
`;

const SForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SInputWrapper = styled.div`
  height: 70px;
`;

const SButton = styled(Button)`
  margin-top: 23px;
`;

const SLogo = styled(InlineSvg)`
  margin-bottom: 35px;
`;
