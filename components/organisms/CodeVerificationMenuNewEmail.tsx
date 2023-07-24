import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

// API
import {
  setMyEmail,
  sendVerificationNewEmail,
  becomeCreator,
} from '../../api/endpoints/user';

// Components
import Text from '../atoms/Text';
import Headline from '../atoms/Headline';
import GoBackButton from '../molecules/GoBackButton';
import VerificationCodeInput from '../atoms/VerificationCodeInput';
import AnimatedLogoEmailVerification from '../molecules/signup/AnimatedLogoEmailVerification';

// Utils
import useLeavePageConfirm from '../../utils/hooks/useLeavePageConfirm';
import { useAppState } from '../../contexts/appStateContext';
import VerificationCodeResend from '../atoms/VerificationCodeResend';
import { useUserData } from '../../contexts/userDataContext';

const AnimatedPresence = dynamic(() => import('../atoms/AnimatedPresence'));

export interface ICodeVerificationMenuNewEmail {
  newEmail: string;
  canResendIn: number;
  redirect: 'settings' | 'dashboard';
  allowLeave: boolean;
}

const CodeVerificationMenuNewEmail: React.FunctionComponent<
  ICodeVerificationMenuNewEmail
> = ({ newEmail, canResendIn, redirect, allowLeave }) => {
  const router = useRouter();
  const { t } = useTranslation('page-VerifyEmail');
  const { updateUserData } = useUserData();

  const { resizeMode, handleUserLoggedIn } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // isSuccess - no bottom sections
  const [isSuccess, setIsSuccess] = useState(false);

  // Code input
  const [isSignInWithEmailLoading, setIsSignInWithEmailLoading] =
    useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Resend code
  const [codeInitial, setCodeInitial] = useState(
    new Array(6).join('.').split('.')
  );
  const [isResendCodeLoading, setIsResendCodeLoading] = useState(false);

  // Timer
  const [timerHidden, setTimerHidden] = useState(false);
  const [canResendAt, setCanResendAt] = useState<number>(
    Date.now() + canResendIn * 1000
  );

  useLeavePageConfirm(!isSuccess && !allowLeave, t('leaveAlert'), []);

  const onCodeComplete = useCallback(
    async (completeCode: string) => {
      if (!newEmail) return;
      try {
        setSubmitError('');
        setTimerHidden(true);
        setIsSignInWithEmailLoading(true);

        const signInRequest = new newnewapi.SetMyEmailRequest({
          emailAddress: newEmail,
          verificationCode: completeCode,
        });

        const { data, error } = await setMyEmail(signInRequest);

        if (
          error ||
          !data ||
          data.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS
        ) {
          throw new Error(error?.message ?? 'Request failed');
        }

        if (redirect === 'settings') {
          updateUserData({
            email: newEmail,
          });
        }

        if (redirect === 'dashboard') {
          const becomeCreatorPayload = new newnewapi.EmptyRequest({});

          const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

          if (!becomeCreatorRes?.data || becomeCreatorRes.error) {
            throw new Error('Become creator failed');
          }

          updateUserData({
            email: newEmail,
            options: {
              isActivityPrivate:
                becomeCreatorRes.data.me?.options?.isActivityPrivate,
              isCreator: becomeCreatorRes.data.me?.options?.isCreator,
              isVerified: becomeCreatorRes.data.me?.options?.isVerified,
              creatorStatus: becomeCreatorRes.data.me?.options?.creatorStatus,
            },
          });

          handleUserLoggedIn(
            becomeCreatorRes.data.me?.options?.isCreator ?? false
          );
        }

        setIsSignInWithEmailLoading(false);
        setIsSuccess(true);

        if (redirect === 'settings') {
          router.push('/profile/settings');
        } else {
          router.push('/creator/dashboard?askPushNotificationPermission=true');
        }
      } catch (err: any) {
        setIsSignInWithEmailLoading(false);
        setSubmitError(err?.message ?? 'generic_error');
        setTimerHidden(false);
      }
    },
    [
      newEmail,
      redirect,
      router,
      setIsSignInWithEmailLoading,
      setSubmitError,
      handleUserLoggedIn,
      updateUserData,
    ]
  );

  const handleResendCode = async () => {
    setIsResendCodeLoading(true);
    setSubmitError('');
    try {
      const payload = new newnewapi.SendVerificationEmailRequest({
        emailAddress: newEmail,
        useCase: newnewapi.SendVerificationEmailRequest.UseCase.SET_MY_EMAIL,
      });

      const { data, error } = await sendVerificationNewEmail(payload);

      // TODO: Add translations
      if (!data || error) {
        throw new Error('Request failed');
      }

      if (
        data.status ===
        newnewapi.SendVerificationEmailResponse.Status.EMAIL_INVALID
      ) {
        throw new Error(t('error.invalidEmail'));
      }

      if (
        data.status ===
        newnewapi.SendVerificationEmailResponse.Status.EMAIL_TAKEN
      ) {
        throw new Error(t('error.emailTaken'));
      }

      if (
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
        data.status !==
          newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
      ) {
        throw new Error('Request failed');
      }

      setIsResendCodeLoading(false);
      setCodeInitial(new Array(6).join('.').split('.'));
      setCanResendAt(Date.now() + data.retryAfter * 1000);
    } catch (err: any) {
      setIsResendCodeLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
    }
  };

  const handleTryAgain = () => {
    setSubmitError('');
    setCodeInitial(new Array(6).join('.').split('.'));
  };

  return (
    <>
      {!isMobileOrTablet && (
        <SBackButtonDesktop
          longArrow={!isMobileOrTablet}
          onClick={() => router.back()}
        >
          {!isMobileOrTablet ? t('backButton') : ''}
        </SBackButtonDesktop>
      )}
      <SCodeVerificationMenuNewEmail
        onClick={() => {
          if (submitError) {
            handleTryAgain();
          }
        }}
      >
        <SBackButton
          defer={isMobileOrTablet ? 250 : undefined}
          onClick={() => router.back()}
        />
        <AnimatedLogoEmailVerification
          isLoading={isSignInWithEmailLoading || isResendCodeLoading}
        />
        <SHeadline variant={3}>{t('heading.mainHeading')}</SHeadline>
        <SSubheading variant={2} weight={600}>
          {t('heading.subHeading')}
          <br />
          {/* NB! Temp */}
          {newEmail.toLowerCase()}
        </SSubheading>
        <VerificationCodeInput
          initialValue={codeInitial}
          length={6}
          disabled={isSignInWithEmailLoading || isResendCodeLoading}
          error={submitError ? true : undefined}
          onComplete={onCodeComplete}
        />
        <VerificationCodeResend
          canResendAt={canResendAt}
          show={
            !timerHidden && !submitError && !isResendCodeLoading && !isSuccess
          }
          onResendClick={handleResendCode}
        />
        {!isSignInWithEmailLoading &&
        !isResendCodeLoading &&
        submitError &&
        !isSuccess ? (
          <AnimatedPresence animateWhenInView={false} animation='t-09'>
            {/* TODO: error text should probably be changed */}
            <SErrorDiv>{t('error.invalidCode')}</SErrorDiv>
          </AnimatedPresence>
        ) : null}
      </SCodeVerificationMenuNewEmail>
    </>
  );
};

CodeVerificationMenuNewEmail.defaultProps = {
  canResendIn: 0,
};

export default CodeVerificationMenuNewEmail;

const SCodeVerificationMenuNewEmail = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  height: 100%;
  width: 100%;

  text-align: center;

  transition: width height 0.3s ease-in-out;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.laptopL} {
    top: calc(50% - 224px);
    left: calc(50% - 304px);

    width: 608px;
    height: 448px;

    border-radius: ${({ theme }) => theme.borderRadius.xxxLarge};
    border-style: 1px transparent solid;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SBackButton = styled(GoBackButton)`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: fit-content;

  padding: 8px;

  &:active {
    & div > svg {
      transform: scale(0.8);

      transition: 0.2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    width: fit-content;
  }

  ${({ theme }) => theme.media.laptopL} {
    display: none;
  }
`;

const SBackButtonDesktop = styled(GoBackButton)`
  display: none;
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: fit-content;

  padding: 8px;

  &:active {
    & div > svg {
      transform: scale(0.8);

      transition: 0.2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.laptopL} {
    display: flex;

    top: 90px;
    left: 104px;

    justify-content: center;
    align-items: center;

    width: fit-content;
    height: 36px;
    padding: 0;

    div {
      margin-right: 0;
    }
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 24px;

  text-align: center;
  font-size: 22px;
  line-height: 30px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptopL} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SSubheading = styled(Text)`
  margin-top: 8px;

  font-size: 14px;
  line-height: 20px;
  overflow-wrap: break-word;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SErrorDiv = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.accent.error};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptopL} {
    line-height: 24px;
  }
`;
