import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useCookies } from 'react-cookie';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import {
  setSignupEmailInput,
  setUserData,
  setUserLoggedIn,
} from '../../redux-store/slices/userStateSlice';

// API
import {
  sendVerificationEmail,
  signInWithEmail,
} from '../../api/endpoints/auth';

// Components
import Text from '../atoms/Text';
import Headline from '../atoms/Headline';
import GoBackButton from '../molecules/GoBackButton';
import VerificationCodeInput from '../atoms/VerificationCodeInput';
import VerificationCodeResend from '../atoms/VerificationCodeResend';
import ReCaptcha2 from '../atoms/ReCaptchaV2';
import AnimatedLogoEmailVerification from '../molecules/signup/AnimatedLogoEmailVerification';

// Utils
import AnimatedPresence from '../atoms/AnimatedPresence';
import { Mixpanel } from '../../utils/mixpanel';
import useRecaptcha from '../../utils/hooks/useRecaptcha';
import useErrorToasts from '../../utils/hooks/useErrorToasts';

export interface ICodeVerificationMenu {
  expirationTime: number;
  redirectUserTo?: string;
}

const CodeVerificationMenu: React.FunctionComponent<ICodeVerificationMenu> = ({
  expirationTime,
  redirectUserTo,
}) => {
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

  const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { showErrorToastPredefined } = useErrorToasts();

  // useCookies
  const [, setCookie] = useCookies();

  // isSuccess - no bottom sections
  const [isSuccess, setIsSuccess] = useState(false);

  // Code input
  const [submitError, setSubmitError] = useState<string>('');

  // Resend code
  const [codeInitial, setCodeInitial] = useState(
    new Array(6).join('.').split('.')
  );
  const [isResendCodeLoading, setIsResendCodeLoading] = useState(false);

  // Timer
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  const handleSignIn = useCallback(
    async (completeCode: string) => {
      try {
        Mixpanel.track('Verify email submitted', {
          _stage: 'Sign Up',
          _email: signupEmailInput,
          _verificationCode: completeCode,
        });
        setSubmitError('');

        const signInRequest = new newnewapi.EmailSignInRequest({
          emailAddress: signupEmailInput,
          verificationCode: completeCode,
        });

        const { data, error } = await signInWithEmail(signInRequest);

        if (
          !data ||
          data.status !== newnewapi.SignInResponse.Status.SUCCESS ||
          error
        )
          throw new Error(error?.message ?? 'Request failed');

        dispatch(
          setUserData({
            username: data.me?.username,
            nickname: data.me?.nickname,
            email: data.me?.email,
            avatarUrl: data.me?.avatarUrl,
            coverUrl: data.me?.coverUrl,
            userUuid: data.me?.userUuid,
            bio: data.me?.bio,
            dateOfBirth: data.me?.dateOfBirth,
            countryCode: data.me?.countryCode,
            options: {
              isActivityPrivate: data.me?.options?.isActivityPrivate,
              isCreator: data.me?.options?.isCreator,
              isVerified: data.me?.options?.isVerified,
              creatorStatus: data.me?.options?.creatorStatus,
            },
          })
        );

        // Set credential cookies
        if (data.credential?.expiresAt?.seconds) {
          setCookie('accessToken', data.credential?.accessToken, {
            expires: new Date(
              (data.credential.expiresAt.seconds as number) * 1000
            ),
            path: '/',
          });
        }

        setCookie('refreshToken', data.credential?.refreshToken, {
          // Expire in 10 years
          maxAge: 10 * 365 * 24 * 60 * 60,
          path: '/',
        });

        // Set logged in and
        dispatch(setUserLoggedIn(true));
        dispatch(setSignupEmailInput(''));

        setIsSuccess(true);

        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else if (data.me?.options?.isCreator) {
          router.push('/creator/dashboard');
        } else if (redirectUserTo) {
          router.push(redirectUserTo);
        } else {
          router.push('/');
        }
      } catch (err: any) {
        setSubmitError(err?.message ?? 'generic_error');
      }
    },
    [
      setSubmitError,
      setCookie,
      signupEmailInput,
      dispatch,
      router,
      redirectUserTo,
    ]
  );

  const recaptchaRef = useRef(null);

  const {
    onChangeRecaptchaV2,
    isRecaptchaV2Required,
    submitWithRecaptchaProtection: signInWithRecaptchaProtection,
    isSubmitting: isSignInWithEmailLoading,
    errorMessage: recaptchaErrorMessage,
  } = useRecaptcha(handleSignIn, recaptchaRef);

  useEffect(() => {
    if (recaptchaErrorMessage) {
      showErrorToastPredefined(recaptchaErrorMessage);
    }
  }, [recaptchaErrorMessage, showErrorToastPredefined]);

  const handleResendCode = async () => {
    setIsResendCodeLoading(true);
    setSubmitError('');
    setTimerStartTime(Date.now());
    try {
      Mixpanel.track('Resend code', {
        _stage: 'Sign Up',
        email: signupEmailInput,
      });
      const payload = new newnewapi.SendVerificationEmailRequest({
        emailAddress: signupEmailInput,
        useCase:
          newnewapi.SendVerificationEmailRequest.UseCase.SIGN_UP_WITH_EMAIL,
      });

      const { data, error } = await sendVerificationEmail(payload);

      if (!data || error) throw new Error(error?.message ?? 'Request failed');

      setIsResendCodeLoading(false);
      setCodeInitial(new Array(6).join('.').split('.'));
    } catch (err: any) {
      setTimerStartTime(null);
      setIsResendCodeLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
    }
  };

  const handleTryAgain = () => {
    setSubmitError('');
    setCodeInitial(new Array(6).join('.').split('.'));
  };

  const onCodeComplete = useCallback(
    (args: any) => {
      if (!signupEmailInput) return;

      signInWithRecaptchaProtection(args);
    },
    [signInWithRecaptchaProtection, signupEmailInput]
  );

  return (
    <>
      {!isMobileOrTablet && (
        <SBackButtonDesktop
          longArrow={!isMobileOrTablet}
          onClick={() => {
            Mixpanel.track('Go Back Clicked', {
              _stage: 'Sign Up',
            });
            router.back();
          }}
        >
          {!isMobileOrTablet ? t('backButton') : ''}
        </SBackButtonDesktop>
      )}
      <SCodeVerificationMenu
        onClick={() => {
          if (submitError) {
            handleTryAgain();
          }
        }}
      >
        <SBackButton
          defer={isMobileOrTablet ? 250 : undefined}
          onClick={() => {
            Mixpanel.track('Go Back Clicked', {
              _stage: 'Sign Up',
            });
            router.back();
          }}
        />
        <AnimatedLogoEmailVerification
          isLoading={isSignInWithEmailLoading || isResendCodeLoading}
        />
        <SHeadline variant={3}>{t('heading.mainHeading')}</SHeadline>
        <SSubheading variant={2} weight={600}>
          {signupEmailInput.length > 0 ? (
            <>
              {t('heading.subHeading')}
              <br />
              {signupEmailInput.toLowerCase()}
            </>
          ) : null}
        </SSubheading>
        <VerificationCodeInput
          id='verification-input'
          initialValue={codeInitial}
          length={6}
          disabled={
            isSignInWithEmailLoading || isResendCodeLoading || isSuccess
          }
          error={submitError ? true : undefined}
          onComplete={onCodeComplete}
        />
        <SVerificationCodeResend
          expirationTime={expirationTime}
          onResendClick={handleResendCode}
          onTimerEnd={() => {
            setTimerStartTime(null);
          }}
          $invisible={!!submitError || !!isSignInWithEmailLoading}
          startTime={timerStartTime}
        />
        {!isSignInWithEmailLoading &&
        !isResendCodeLoading &&
        submitError &&
        !isSuccess ? (
          <AnimatedPresence animateWhenInView={false} animation='t-09'>
            <SErrorDiv>{t('error.invalidCode')}</SErrorDiv>
          </AnimatedPresence>
        ) : null}
        {isRecaptchaV2Required && (
          <ReCaptcha2 ref={recaptchaRef} onChange={onChangeRecaptchaV2} />
        )}
      </SCodeVerificationMenu>
    </>
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

  transition: width height 0.3s ease-in-out;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.laptopL} {
    /* top: calc(50% - 224px); */
    left: calc(50% - 304px);
    margin-top: calc(50vh - 224px);

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

const SVerificationCodeResend = styled(VerificationCodeResend)<{
  $invisible: boolean;
}>`
  visibility: ${({ $invisible }) => ($invisible ? 'hidden' : 'visible')};
  height: 0;
`;
