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
  sendVerificationNewEmail,
  confirmMyEmail,
} from '../../../api/endpoints/user';
import { useUserData } from '../../../contexts/userDataContext';

import Logo from '../../../public/images/svg/MobileLogo.svg';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

interface IEditEmailStepOneModal {
  onComplete: () => void;
}

const EditEmailStepOneModal = ({ onComplete }: IEditEmailStepOneModal) => {
  const theme = useTheme();
  const { t } = useTranslation('page-VerifyEmail');

  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { userData } = useUserData();

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [code, setCode] = useState(new Array(6).join('.').split('.'));
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeLoading = useRef(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [canResendAt, setCanResendAt] = useState<number>(0);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (!isMobile) {
        setIsInputFocused(true);
      }
    }, 400);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [isMobile]);

  const [isCodeSent, setIsCodeSent] = useState(false);

  const requestVerificationCode = useCallback(async () => {
    if (codeLoading.current) {
      return;
    }

    setIsCodeLoading(true);
    codeLoading.current = true;

    try {
      const sendVerificationCodePayload =
        new newnewapi.SendVerificationEmailRequest({
          emailAddress: userData?.email,
          useCase:
            newnewapi.SendVerificationEmailRequest.UseCase.CONFIRM_MY_EMAIL,
        });

      const { data, error } = await sendVerificationNewEmail(
        sendVerificationCodePayload
      );

      if (!data || error) {
        throw new Error(t('error.requestFailed'));
      }

      if (
        data.status ===
        newnewapi.SendVerificationEmailResponse.Status.EMAIL_INVALID
      ) {
        throw new Error(t('error.invalidEmail'));
      }

      if (
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
      ) {
        throw new Error(t('error.requestFailed'));
      }

      setCanResendAt(Date.now() + data.retryAfter * 1000);
      setCode(new Array(6).join('.').split('.'));
      setIsCodeSent(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCodeLoading(false);
      codeLoading.current = false;
    }
  }, [userData?.email, t]);

  const resendVerificationCode = async () => {
    Mixpanel.track('Resend Verification Code', {
      _stage: 'Settings',
    });

    await requestVerificationCode();
  };

  useEffect(() => {
    if (!isCodeSent) {
      requestVerificationCode();
    }
  }, [isCodeSent, requestVerificationCode]);

  const handleConfirmMyEmail = useCallback(
    async (verificationCode: string) => {
      try {
        Mixpanel.track('Confirm My Current Email', {
          _stage: 'Settings',
          _currentEmail: userData?.email,
        });

        setIsSubmitting(true);

        const confirmMyEmailPayload = new newnewapi.ConfirmMyEmailRequest({
          verificationCode,
        });

        const { data, error } = await confirmMyEmail(confirmMyEmailPayload);

        if (
          data?.status === newnewapi.ConfirmMyEmailResponse.Status.AUTH_FAILURE
        ) {
          setErrorMessage(t('error.invalidCode'));
          throw new Error('Invalid code');
        }

        if (
          data?.status !== newnewapi.ConfirmMyEmailResponse.Status.SUCCESS ||
          error
        ) {
          throw new Error(error?.message ?? 'Request failed');
        }

        onComplete();
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onComplete, t, userData?.email]
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
      <SHeadline variant={4}>{t('heading.mainHeading')}</SHeadline>
      <SText variant={2}>
        {`${t('heading.subHeading')} ${userData?.email}`}
      </SText>
      <VerificationCodeInput
        initialValue={code}
        length={6}
        disabled={isSubmitting || isCodeLoading}
        error={errorMessage ? true : undefined}
        onComplete={handleConfirmMyEmail}
        isInputFocused={isInputFocused}
        key={`input-focused-${isInputFocused}`}
      />
      <VerificationCodeResend
        canResendAt={canResendAt}
        show={!errorMessage && !isSubmitting && isCodeSent}
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

export default EditEmailStepOneModal;

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
  overflow-wrap: break-word;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-weight: 600;

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
