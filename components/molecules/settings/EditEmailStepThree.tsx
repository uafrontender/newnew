import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import InlineSvg from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import Text from '../../atoms/Text';
import VerificationCodeInput from '../../atoms/VerificationCodeInput';
import VerificationCodeResend from '../../atoms/VerificationCodeResend';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import {
  setMyEmail,
  sendVerificationNewEmail,
} from '../../../api/endpoints/user';

import Logo from '../../../public/images/svg/MobileLogo.svg';
import { Mixpanel } from '../../../utils/mixpanel';
import { useUserData } from '../../../contexts/userDataContext';

interface IEditEmailStepThreeModal {
  newEmail: string;
  retryAfter: number;
  onComplete: () => void;
}

const EditEmailStepThreeModal = ({
  onComplete,
  retryAfter,
  newEmail,
}: IEditEmailStepThreeModal) => {
  const { t } = useTranslation('page-Profile');
  const { t: tVerifyEmail } = useTranslation('page-VerifyEmail');
  const theme = useTheme();
  const { updateUserData } = useUserData();

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [code, setCode] = useState(new Array(6).join('.').split('.'));
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeLoading = useRef(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  const [canResendAt, setCanResendAt] = useState<number>(
    Date.now() + retryAfter * 1000
  );

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      setIsInputFocused(true);
    }, 1400);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, []);

  const resendVerificationCode = useCallback(async () => {
    if (codeLoading.current) {
      return;
    }

    try {
      Mixpanel.track('Resend Verification Code For New Email', {
        _stage: 'Settings',
        _newEmail: newEmail,
      });

      setIsCodeLoading(true);
      codeLoading.current = true;
      const sendVerificationCodePayload =
        new newnewapi.SendVerificationEmailRequest({
          emailAddress: newEmail,
          useCase: newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
        });

      const { data, error } = await sendVerificationNewEmail(
        sendVerificationCodePayload
      );

      // TODO: Add translations
      if (!data || error) {
        throw new Error('Request failed');
      }

      if (
        data.status ===
        newnewapi.SendVerificationEmailResponse.Status.EMAIL_INVALID
      ) {
        throw new Error(tVerifyEmail('error.invalidEmail'));
      }

      if (
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
      ) {
        throw new Error('Request failed');
      }

      setCanResendAt(Date.now() + data.retryAfter * 1000);
      setCode(new Array(6).join('.').split('.'));
    } catch (err) {
      // TODO: We should probably have an error message below input here

      console.error(err);
    } finally {
      setIsCodeLoading(false);
      codeLoading.current = false;
    }
  }, [newEmail, tVerifyEmail]);

  const handleSetMyEmail = useCallback(
    async (verificationCode: string) => {
      try {
        Mixpanel.track('Confirm New Email', {
          _stage: 'Settings',
          _newEmail: newEmail,
        });

        setIsSubmitting(true);

        const setMyEmailPayload = new newnewapi.SetMyEmailRequest({
          emailAddress: newEmail,
          verificationCode,
        });

        const { data, error } = await setMyEmail(setMyEmailPayload);

        if (error || !data) {
          throw new Error(error?.message ?? 'Request failed');
        }

        if (
          data.status === newnewapi.ConfirmMyEmailResponse.Status.AUTH_FAILURE
        ) {
          setErrorMessage(tVerifyEmail('error.invalidCode'));
          throw new Error('Invalid code');
        }

        if (data.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS) {
          throw new Error('Request failed');
        }

        updateUserData({
          email: data?.me?.email,
        });
        onComplete();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [newEmail, updateUserData, onComplete, tVerifyEmail]
  );

  const handleTryAgain = () => {
    setErrorMessage('');
    setCode(new Array(6).join('.').split('.'));
  };

  return (
    <SWrapper
      onClick={() => {
        if (errorMessage) {
          handleTryAgain();
        }
      }}
    >
      <SLogo
        svg={Logo}
        fill={theme.colorsThemed.accent.blue}
        width='60px'
        height='40px'
      />
      <SHeadline variant={4}>
        {t('Settings.sections.personalInformation.emailInput.verifyNewEmail')}
      </SHeadline>
      <SText variant={2}>
        {`${tVerifyEmail('heading.subHeading')} ${newEmail}`}
      </SText>
      <VerificationCodeInput
        initialValue={code}
        length={6}
        disabled={isSubmitting || isCodeLoading}
        error={errorMessage ? true : undefined}
        onComplete={handleSetMyEmail}
        isInputFocused={isInputFocused}
        key={`input-focused-${isInputFocused}`}
      />
      <VerificationCodeResend
        canResendAt={canResendAt}
        show={!errorMessage && !isSubmitting}
        onResendClick={resendVerificationCode}
      />
      {errorMessage && (
        <AnimatedPresence animateWhenInView={false} animation='t-09'>
          <SErrorDiv variant={2}>{errorMessage}</SErrorDiv>
        </AnimatedPresence>
      )}
    </SWrapper>
  );
};

export default EditEmailStepThreeModal;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SLogo = styled(InlineSvg)`
  margin-bottom: 35px;
`;

const SHeadline = styled(Headline)`
  text-align: center;
`;

const SText = styled(Text)`
  max-width: 320px;
  margin-top: 4px;
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-weight: 600;
  overflow-wrap: break-word;

  ${({ theme }) => theme.media.laptopL} {
    margin-top: 8px;
  }
`;

const SErrorDiv = styled(Text)`
  font-weight: bold;

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.accent.error};

  ${({ theme }) => theme.media.tablet} {
    line-height: 20px;
  }
`;
