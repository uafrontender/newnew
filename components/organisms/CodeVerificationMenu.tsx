/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

// API
import { signInWithEmail } from '../../api/endpoints/auth';

// Components
// import BasicButton from '../atoms/BasicButton';
import InlineSvg from '../atoms/InlineSVG';
import VerficationCodeInput from '../atoms/VerificationCodeInput';

// Icons
// import BackButtonIcon from '../../public/icon-back-temp.svg';
import BackButtonIcon from '../../public/icon-back-temp2.svg';
import NewnewLogoBlue from '../../public/newnew-logo-blue.svg';
import { setSignupEmailInput } from '../../redux-store/slices/userStateSlice';
import isBroswer from '../../utils/isBrowser';
import secondsToString from '../../utils/secondsToHMS';
import sleep from '../../utils/sleep';

export interface ICodeVerificationMenu {

}

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


  transition: .3s ease-in-out;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* Logo */
  & > div:nth-child(2)  {
    margin-top: 164px;
  }

  h1 {
    margin-top: 36px;

    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
  }

  h4 {
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;

    color: ${({ theme }) => theme.colors.baseLight700};
  }

  ${({ theme }) => theme.media.tablet} {
    /* Logo */

    & > div:nth-child(2) {
      margin-top: 288px;
    }

    h1 {
      font-size: 36px;
      line-height: 44px;
    }

    h4 {
      font-size: 16px;
      line-height: 20px;
    }
  }

  ${({ theme }) => theme.media.laptopL} {
    top: calc(50% - 224px);
    left: calc(50% - 304px);

    width: 608px;
    height: 448px;

    border-radius: ${({ theme }) => theme.borderRadius.xxxLarge};
    border-style: 1px transparent solid;

    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};

    /* Logo */
    & > div:nth-child(2) {
      margin-top: 74px;
    }
  }
`;

const SBackButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: fit-content;
  height: fit-content;
  padding: 8px;

  color: ${({ theme }) => theme.colorsThemed.onSurface};
  background-color: transparent;
  border: transparent;

  cursor: pointer;

  & path {
    fill: ${({ theme }) => theme.colorsThemed.onSurface};
  }

  ${({ theme }) => theme.media.tablet} {
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptopL} {
    display: none;
  }
`;

interface ISTimeoutDiv {
  isAlertColor: boolean;
}

const STimeoutDiv = styled.div<ISTimeoutDiv>`
  color: ${({ isAlertColor, theme }) => {
    if (isAlertColor) return theme.colorsThemed.accent.error;
    return theme.colorsThemed.onSurface;
  }};
`;

const STimeExpired = styled.div`

  button {
    background-color: transparent;
    border: transparent;

    color: ${({ theme }) => theme.colors.brand2700};

    font-size: inherit;
    font-weight: bold;

    cursor: pointer;
  }
`;

const SErrorDiv = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colorsThemed.accent.error};
`;

const CodeVerificationMenu: React.FunctionComponent<ICodeVerificationMenu> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('verify-email');

  const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  // Code input
  const [isSigninWithEmailLoading, setIsSigninWithEmailLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Resend code
  const [codeInitial, setCodeInital] = useState(new Array(6).join('.').split('.'));
  const [isResendCodeLoading, setIsResendCodeLoading] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const interval = useRef<number>();

  const onCodeComplete = useCallback(async (completeCode: string) => {
    try {
      setTimerActive(false);
      setSubmitError('');
      setIsSigninWithEmailLoading(true);

      await sleep(2000);

      const signInRequest = new newnewapi.EmailSignInRequest({
        emailAddress: signupEmailInput,
        verificationCode: completeCode,
      });

      const { data, error } = await signInWithEmail(signInRequest);

      if (!data || !error) throw new Error(error?.message ?? 'Request failed');

      // Clean up email state, sign in the user with the response & redirect home
      dispatch(setSignupEmailInput(''));

      setIsSigninWithEmailLoading(false);
      router.push('/');
    } catch (err: any) {
      setIsSigninWithEmailLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
      setTimerActive(true);
    }
  },
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
      setTimerSeconds(60);
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
  ]);

  useEffect(() => {
    if (isBroswer()) {
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
      onClick={() => {
        if (submitError) {
          handleTryAgain();
        }
      }}
    >
      <SBackButton
        onClick={() => router.back()}
      >
        <InlineSvg
          svg={BackButtonIcon}
          width="24px"
          height="24px"
        />
        <span>
          {t('goBackBtn')}
        </span>
      </SBackButton>
      <InlineSvg
        svg={NewnewLogoBlue}
        width="64px"
        height="64px"
      />
      <h1>
        { t('heading.heading') }
      </h1>
      <h4>
        {t('heading.subheading')}
        {' '}
        {/* NB! Temp */}
        {signupEmailInput.length > 0 ? signupEmailInput : 'email@email.com'}
      </h4>
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
          )
        )
      }
      {
        !isSigninWithEmailLoading && !isResendCodeLoading && submitError ? (
          <SErrorDiv>
            { t('errors.invalidCode') }
          </SErrorDiv>
        ) : null
      }
      {
        isSigninWithEmailLoading || isResendCodeLoading ? (
          <div>
            Spinner placeholder
          </div>
        ) : null
      }
    </SCodeVerificationMenu>
  );
};

export default CodeVerificationMenu;
