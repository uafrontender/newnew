import React, { useEffect, useState, useCallback } from 'react';
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
import { useAppSelector } from '../../../redux-store/store';

import Logo from '../../../public/images/svg/mobile-logo.svg';
import { Mixpanel } from '../../../utils/mixpanel';

interface IEditEmailStepOneModal {
  onComplete: () => void;
}

const EditEmailStepOneModal = ({ onComplete }: IEditEmailStepOneModal) => {
  const theme = useTheme();
  const { t } = useTranslation('page-VerifyEmail');

  const user = useAppSelector((state) => state.user);

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [code, setCode] = useState(new Array(6).join('.').split('.'));
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      setIsInputFocused(true);
    }, 1400);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, []);

  const [isCodeSent, setIsCodeSent] = useState(false);

  const requestVerificationCode = useCallback(async () => {
    try {
      const sendVerificationCodePayload =
        new newnewapi.SendVerificationEmailRequest({
          emailAddress: user.userData?.email,
          useCase:
            newnewapi.SendVerificationEmailRequest.UseCase.CONFIRM_MY_EMAIL,
        });

      const { data, error } = await sendVerificationNewEmail(
        sendVerificationCodePayload
      );
      if (
        data?.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS ||
        error
      ) {
        throw new Error(error?.message ?? 'Request failed');
      }

      setIsCodeSent(true);
    } catch (err: any) {
      setTimerStartTime(null);
      console.error(err);
    }
  }, [user.userData?.email]);

  const resendVerificationCode = async () => {
    Mixpanel.track('Resend Verification Code', {
      _stage: 'Settings',
    });

    setIsCodeLoading(true);
    setTimerStartTime(Date.now());
    await requestVerificationCode();
    setIsCodeLoading(false);
    setCode(new Array(6).join('.').split('.'));
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
          _currentEmail: user.userData?.email,
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
    [onComplete, t, user.userData?.email]
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
        {`${t('heading.subHeading')} ${user.userData?.email}`}
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
      <SVerificationCodeResend
        expirationTime={60}
        onResendClick={resendVerificationCode}
        onTimerEnd={() => {
          setTimerStartTime(null);
        }}
        $invisible={!!errorMessage || !!isSubmitting}
        startTime={timerStartTime}
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
  max-width: 250px;
  margin-top: 4px;
  text-align: center;
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

const SVerificationCodeResend = styled(VerificationCodeResend)<{
  $invisible: boolean;
}>`
  visibility: ${({ $invisible }) => ($invisible ? 'hidden' : 'visible')};
  height: 0;
`;
