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
  setMyEmail,
  sendVerificationNewEmail,
} from '../../../api/endpoints/user';
import { setUserData } from '../../../redux-store/slices/userStateSlice';

import Logo from '../../../public/images/svg/mobile-logo.svg';
import { useAppDispatch } from '../../../redux-store/store';

interface IEditEmailStepThreeModal {
  onComplete: () => void;
  newEmail: string;
}

const EditEmailStepThreeModal = ({
  onComplete,
  newEmail,
}: IEditEmailStepThreeModal) => {
  const { t } = useTranslation('page-Profile');
  const { t: tVerifyEmail } = useTranslation('page-VerifyEmail');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [code, setCode] = useState(new Array(6).join('.').split('.'));
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isTimerEnded, setIsTimerEnded] = useState(false);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      setIsInputFocused(true);
    }, 1400);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, []);

  const resendVerificationCode = useCallback(async () => {
    try {
      setIsCodeLoading(true);
      const sendVerificationCodePayload =
        new newnewapi.SendVerificationEmailRequest({
          emailAddress: newEmail,
          useCase: newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
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

      setIsCodeLoading(false);
      setIsTimerEnded(false);
      setCode(new Array(6).join('.').split('.'));
    } catch (err) {
      setIsCodeLoading(false);
      console.error(err);
    }
  }, [newEmail]);

  const handleSetMyEmail = useCallback(
    async (verificationCode: string) => {
      try {
        setIsSubmitting(true);

        const setMyEmailPayload = new newnewapi.SetMyEmailRequest({
          emailAddress: newEmail,
          verificationCode,
        });

        const { data, error } = await setMyEmail(setMyEmailPayload);

        if (
          data?.status === newnewapi.ConfirmMyEmailResponse.Status.AUTH_FAILURE
        ) {
          setErrorMessage(tVerifyEmail('error.invalidCode'));
          throw new Error('Invalid code');
        }

        if (
          data?.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS ||
          error
        ) {
          throw new Error(error?.message ?? 'Request failed');
        }

        dispatch(
          setUserData({
            email: data?.me?.email,
          })
        );
        onComplete();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onComplete, newEmail, dispatch, tVerifyEmail]
  );

  const handleTryAgain = () => {
    setErrorMessage('');
    setCode(new Array(6).join('.').split('.'));
    setIsTimerEnded(false);
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
      <Headline variant={4}>
        {t('Settings.sections.personalInformation.emailInput.verifyNewEmail')}
      </Headline>
      <SText variant={2}>
        {`${tVerifyEmail('heading.subHeading')} ${newEmail}`}
      </SText>
      <VerificationCodeInput
        initialValue={code}
        length={6}
        disabled={isSubmitting || isCodeLoading || isTimerEnded}
        error={errorMessage ? true : undefined}
        onComplete={handleSetMyEmail}
        isInputFocused={isInputFocused}
        key={`input-focused-${isInputFocused}`}
      />
      {!isCodeLoading && (
        <SVerificationCodeResend
          expirationTime={60}
          onResendClick={resendVerificationCode}
          onTimerEnd={() => {
            setIsTimerEnded(true);
          }}
          $invisible={!!errorMessage || !!isSubmitting}
        />
      )}
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
