/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setSignupEmailInput, setUserLoggedIn } from '../../redux-store/slices/userStateSlice';

// API
import { signInWithEmail } from '../../api/endpoints/auth';

// Components
import Text from '../atoms/Text';
import Headline from '../atoms/Headline';
import GoBackButton from '../molecules/GoBackButton';
import VerficationCodeInput from '../atoms/VerificationCodeInput';
import AnimatedLogoEmailVerification from '../molecules/signup/AnimatedLogoEmailVerification';

// Utils
import secondsToString from '../../utils/secondsToHMS';
import isBrowser from '../../utils/isBrowser';
import sleep from '../../utils/sleep';
import AnimatedPresence from '../atoms/AnimatedPresence';

export interface ICodeVerificationMenu {
  expirationTime: number;
}

const CodeVerificationMenu: React.FunctionComponent<ICodeVerificationMenu> = ({
  expirationTime,
}) => {
  const router = useRouter();
  const { t } = useTranslation('verify-email');

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  // Code input
  const [isSigninWithEmailLoading, setIsSigninWithEmailLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Resend code
  const [codeInitial, setCodeInital] = useState(new Array(6).join('.').split('.'));
  const [isResendCodeLoading, setIsResendCodeLoading] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(expirationTime);
  const [timerActive, setTimerActive] = useState(false);
  const interval = useRef<number>();

  const onCodeComplete = useCallback(async (completeCode: string) => {
    try {
      setTimerActive(false);
      setSubmitError('');
      setIsSigninWithEmailLoading(true);

      // NB! Temp
      await sleep(2000);

      if (completeCode !== '123456') throw new Error('Request failed');

      /* const signInRequest = new newnewapi.EmailSignInRequest({
        emailAddress: signupEmailInput,
        verificationCode: completeCode,
      });

      const { data, error } = await signInWithEmail(signInRequest);

      if (!data || !error) throw new Error(error?.message ?? 'Request failed'); */

      // Clean up email state, sign in the user with the response & redirect home
      setTimerActive(false);

      setIsSigninWithEmailLoading(false);

      dispatch(setSignupEmailInput(''));
      dispatch(setUserLoggedIn(true));

      router.push('/');
    } catch (err: any) {
      setIsSigninWithEmailLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
      setTimerActive(true);
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [
    setIsSigninWithEmailLoading,
    setSubmitError,
    signupEmailInput,
    setTimerActive,
    dispatch,
    router,
  ]);

  const handleResendCode = async () => {
    setIsResendCodeLoading(true);
    setSubmitError('');
    try {
      // Temp commented out for dev purposes
      /* const payload = new newnewapi.SendVerificationEmailRequest({
        emailAddress: signupEmailInput,
      });

      const { data, error } = await sendVerificationEmail(payload);

      if (!data || error) throw new Error(error?.message ?? 'Request failed'); */

      setIsResendCodeLoading(false);
      setCodeInital(new Array(6).join('.').split('.'));
      setTimerSeconds(expirationTime);
      setTimerActive(true);
    } catch (err: any) {
      setIsResendCodeLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
    }
  };

  const handleTryAgain = () => {
    setSubmitError('');
    setCodeInital(new Array(6).join('.').split('.'));
    setTimerActive(true);
  };

  useEffect(() => {
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (timerSeconds < 1) {
      setTimerActive(false);
      setSubmitError('');
      setCodeInital(new Array(6).join('.').split('.'));
    }
  }, [
    timerSeconds,
    setTimerActive,
    setSubmitError,
    setCodeInital,
  ]);

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
    <SCodeVerificationMenu
      onClick={(e) => {
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
        isLoading={isSigninWithEmailLoading || isResendCodeLoading}
      />
      <SHeadline
        variant={3}
      >
        { t('heading.heading') }
      </SHeadline>
      <SSubheading variant={2} weight={600}>
        {t('heading.subheading')}
        <br />
        {/* NB! Temp */}
        {signupEmailInput.length > 0 ? signupEmailInput : 'email@email.com'}
      </SSubheading>
      <VerficationCodeInput
        initialValue={codeInitial}
        length={6}
        disabled={isSigninWithEmailLoading || isResendCodeLoading || (timerSeconds < 1)}
        error={submitError ? true : undefined}
        onComplete={onCodeComplete}
      />
      {
        timerActive && !submitError ? (
          <STimeoutDiv
            isAlertColor={timerSeconds < 11}
          >
            { secondsToString(timerSeconds, 'm:s') }
          </STimeoutDiv>
        ) : (
          !submitError
          && !isSigninWithEmailLoading
          && !isResendCodeLoading && (
          <AnimatedPresence
            animateWhenInView={false}
            animation="t-01"
            delay={0.3}
          >
            <STimeExpired>
              { t('timeExpired.not_receieved') }
              {' '}
              <button
                type="button"
                onClick={() => handleResendCode()}
              >
                { t('timeExpired.resendBtn') }
              </button>
            </STimeExpired>
          </AnimatedPresence>
          )
        )
      }
      {
        !isSigninWithEmailLoading && !isResendCodeLoading && submitError ? (
          <AnimatedPresence
            animateWhenInView={false}
            animation="t-09"
          >
            <SErrorDiv>
              { t('errors.invalidCode') }
            </SErrorDiv>
          </AnimatedPresence>
        ) : null
      }
    </SCodeVerificationMenu>
  );
};

CodeVerificationMenu.defaultProps = {
  expirationTime: 60,
};

export default CodeVerificationMenu;

const SCodeVerificationMenu = styled.div`
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

  transition: width height .3s ease-in-out;

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

    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};
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

      transition: .2s ease-in-out;
    }
  }


  ${({ theme }) => theme.media.tablet} {
    width: fit-content;
  }

  ${({ theme }) => theme.media.laptopL} {
    display: none;
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

    &:hover, &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: .2s ease;
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
