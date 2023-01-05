import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setUserData } from '../../redux-store/slices/userStateSlice';

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
import secondsToString from '../../utils/secondsToHMS';
import isBrowser from '../../utils/isBrowser';

const AnimatedPresence = dynamic(() => import('../atoms/AnimatedPresence'));

export interface ICodeVerificationMenuNewEmail {
  expirationTime: number;
  newEmail: string;
  redirect: 'settings' | 'dashboard';
}

const CodeVerificationMenuNewEmail: React.FunctionComponent<
  ICodeVerificationMenuNewEmail
> = ({ expirationTime, newEmail, redirect }) => {
  const router = useRouter();
  const { t } = useTranslation('page-VerifyEmail');

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

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
  const [timerSeconds, setTimerSeconds] = useState(expirationTime);
  const [timerActive, setTimerActive] = useState(false);
  const [timerHidden, setTimerHidden] = useState(false);
  const interval = useRef<number>();

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
          data?.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS ||
          error
        )
          throw new Error(error?.message ?? 'Request failed');

        setTimerActive(false);

        if (redirect === 'settings') {
          dispatch(
            setUserData({
              email: newEmail,
            })
          );
        }

        if (redirect === 'dashboard') {
          const becomeCreatorPayload = new newnewapi.EmptyRequest({});

          const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

          if (!becomeCreatorRes.data || becomeCreatorRes.error)
            throw new Error('Become creator failed');

          dispatch(
            setUserData({
              email: newEmail,
              options: {
                isActivityPrivate:
                  becomeCreatorRes.data.me?.options?.isActivityPrivate,
                isCreator: becomeCreatorRes.data.me?.options?.isCreator,
                isVerified: becomeCreatorRes.data.me?.options?.isVerified,
                creatorStatus: becomeCreatorRes.data.me?.options?.creatorStatus,
              },
            })
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
        setTimerActive(true);
        setTimerHidden(false);
      }
    },
    [
      setIsSignInWithEmailLoading,
      setSubmitError,
      setTimerActive,
      newEmail,
      redirect,
      dispatch,
      router,
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

      if (
        data?.status !==
          newnewapi.SendVerificationEmailResponse.Status.SUCCESS ||
        error
      )
        throw new Error(error?.message ?? 'Request failed');

      setIsResendCodeLoading(false);
      setCodeInitial(new Array(6).join('.').split('.'));
      setTimerSeconds(expirationTime);
      setTimerActive(true);
    } catch (err: any) {
      setIsResendCodeLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
    }
  };

  const handleTryAgain = () => {
    setSubmitError('');
    setCodeInitial(new Array(6).join('.').split('.'));
    setTimerActive(true);
  };

  useEffect(() => {
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (timerSeconds < 1) {
      setTimerActive(false);
      setSubmitError('');
      setCodeInitial(new Array(6).join('.').split('.'));
    }
  }, [timerSeconds, setTimerActive, setSubmitError, setCodeInitial]);

  useEffect(() => {
    if (isBrowser()) {
      if (timerActive) {
        interval.current = window.setInterval(() => {
          setTimerSeconds((seconds) => seconds - 1);
        }, 1000);
      } else if (!timerActive) {
        clearInterval(interval.current);
      }
    }
    return () => clearInterval(interval.current);
  }, [timerActive, timerSeconds]);

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
          disabled={
            isSignInWithEmailLoading || isResendCodeLoading || timerSeconds < 1
          }
          error={submitError ? true : undefined}
          onComplete={onCodeComplete}
        />
        {timerActive && !timerHidden && !submitError && !isSuccess ? (
          <STimeoutDiv isAlertColor={timerSeconds < 11}>
            {secondsToString(timerSeconds, 'm:s')}
          </STimeoutDiv>
        ) : (
          !submitError &&
          !isSignInWithEmailLoading &&
          !isResendCodeLoading && (
            <AnimatedPresence
              animateWhenInView={false}
              animation='t-01'
              delay={0.3}
            >
              <STimeExpired>
                {t('expired.noCodeReceived')}{' '}
                <button type='button' onClick={() => handleResendCode()}>
                  {t('expired.resendButtonText')}
                </button>
              </STimeExpired>
            </AnimatedPresence>
          )
        )}
        {!isSignInWithEmailLoading &&
        !isResendCodeLoading &&
        submitError &&
        !isSuccess ? (
          <AnimatedPresence animateWhenInView={false} animation='t-09'>
            <SErrorDiv>{t('error.invalidCode')}</SErrorDiv>
          </AnimatedPresence>
        ) : null}
      </SCodeVerificationMenuNewEmail>
    </>
  );
};

CodeVerificationMenuNewEmail.defaultProps = {
  expirationTime: 60,
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

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

interface ISTimeoutDiv {
  isAlertColor: boolean;
}

const STimeoutDiv = styled.div<ISTimeoutDiv>`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  // NB! Temp
  color: ${({ isAlertColor, theme }) => {
    if (isAlertColor) return theme.colorsThemed.accent.error;
    return theme.colorsThemed.text.tertiary;
  }};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const STimeExpired = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  button {
    background-color: transparent;
    border: transparent;

    font-size: inherit;
    font-weight: 500;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    cursor: pointer;

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
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
