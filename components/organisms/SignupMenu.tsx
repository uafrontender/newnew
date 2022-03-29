// Temp disabled until backend is in place
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/dist/client/router';
import styled, { useTheme } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import isEmail from 'validator/lib/isEmail';
// import Skeleton from 'react-loading-skeleton';

// Redux
import { useAppSelector, useAppDispatch } from '../../redux-store/store';
import {
  setSignupEmailInput,
} from '../../redux-store/slices/userStateSlice';

// API
import { sendVerificationEmail, BASE_URL_AUTH } from '../../api/endpoints/auth';

// Reason for signing up type
import { SignupReason } from '../../pages/sign-up';

// Components
import AnimatedPresence from '../atoms/AnimatedPresence';
import InlineSvg from '../atoms/InlineSVG';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';
import GoBackButton from '../molecules/GoBackButton';
import TextWithLine from '../atoms/TextWithLine';
import SignInTextInput from '../atoms/SignInTextInput';
import EmailSignInButton from '../molecules/signup/EmailSignInButton';
import SignInButton from '../molecules/signup/SignInButton';

// Icons
import AlertIcon from '../../public/images/svg/icons/filled/Alert.svg';
import AppleIcon from '../../public/images/svg/auth/icon-apple.svg';
import GoogleIcon from '../../public/images/svg/auth/icon-google.svg';
import TwitterIcon from '../../public/images/svg/auth/icon-twitter.svg';
import FacebookIcon from '../../public/images/svg/auth/icon-facebook.svg';
import FacebookIconLight from '../../public/images/svg/auth/icon-facebook-light.svg';

// Utils
import isBrowser from '../../utils/isBrowser';
import { AuthLayoutContext } from '../templates/AuthLayout';

export interface ISignupMenu {
  reason?: SignupReason;
}

const SignupMenu: React.FunctionComponent<ISignupMenu> = ({ reason }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('sign-up');

  const authLayoutContext = useContext(AuthLayoutContext);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  // Email input
  const [emailInput, setEmailInput] = useState(signupEmailInput ?? '');
  const [emailInputValid, setEmailInputValid] = useState(false);

  // Loading of email submission
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // NB! We won't have 'already exists' errors, but will probably
  // need some case for banned users, etc.
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmitEmail = async () => {
    setIsSubmitLoading(true);
    setSubmitError('');
    try {
      const payload = new newnewapi.SendVerificationEmailRequest({
        emailAddress: emailInput,
        useCase: newnewapi.SendVerificationEmailRequest.UseCase.SIGN_UP_WITH_EMAIL,
      });

      const { data, error } = await sendVerificationEmail(payload);

      if (!data || error) throw new Error(error?.message ?? 'Request failed');

      dispatch(setSignupEmailInput(emailInput));
      setIsSubmitLoading(false);

      authLayoutContext.setShouldHeroUnmount(true);

      setTimeout(() => {
        router.push('/verify-email');
      }, 1000);

      // router.push('/verify-email');
    } catch (err: any) {
      setIsSubmitLoading(false);
      setSubmitError(err?.message ?? 'generic_error');
    }
  };

  const handleSignupRedirect = (url: string) => {
    if (isBrowser()) {
      window.location.href = url;
    }
  };

  // Check if email is valid
  useEffect(() => {
    if (emailInput.length > 0) {
      setEmailInputValid(isEmail(emailInput));
    }
  }, [emailInput, setEmailInputValid]);

  return (
    <SSignupMenu
      isLoading={isSubmitLoading}
      style={{
        ...(!isMobileOrTablet && authLayoutContext.shouldHeroUnmount ? {
          transform: 'translateX(-300px)',
          transition: '0.6s linear'
        } : {})
      }}
    >
      <SMenuWrapper>
        <SSignInBackButton
          defer={isMobile ? 250 : undefined}
          onClick={() => router.back()}
        >
          <span>{t('goBackBtn')}</span>
        </SSignInBackButton>
        <SHeadline
          variant={3}
        >
          {reason && reason !== 'session_expired' ? `${t('heading.sign_in_to')} ${t(`heading.reasons.${reason}`)}` : t('heading.sign_in')}
        </SHeadline>
        <SSubheading variant={2} weight={600}>
          { reason !== 'session_expired' ? t('heading.subheading') : t('heading.subheadingSessionExpired') }
        </SSubheading>
        <MSContentWrapper
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
          >
            <SignInButton
              noRipple
              svg={GoogleIcon}
              hoverBgColor={theme.colorsThemed.social.google.hover}
              pressedBgColor={theme.colorsThemed.social.google.pressed}
              onClick={() => handleSignupRedirect(`${BASE_URL_AUTH}/google`)}
            >
              {t('signupOptions.google')}
            </SignInButton>
          </motion.div>
          <motion.div
            variants={item}
          >
            <SignInButton
              noRipple
              svg={AppleIcon}
              hoverBgColor="#000"
              hoverContentColor="#FFF"
              pressedBgColor={theme.colorsThemed.social.apple.pressed}
              onClick={() => handleSignupRedirect(`${BASE_URL_AUTH}/apple`)}
            >
              {t('signupOptions.apple')}
            </SignInButton>
          </motion.div>
          <motion.div
            variants={item}
          >
            <SignInButton
              noRipple
              svg={theme.name === 'dark' ? FacebookIcon : FacebookIconLight}
              hoverSvg={FacebookIconLight}
              hoverBgColor={theme.colorsThemed.social.facebook.hover}
              pressedBgColor={theme.colorsThemed.social.facebook.pressed}
              onClick={() => handleSignupRedirect(`${BASE_URL_AUTH}/fb`)}
            >
              {t('signupOptions.facebook')}
            </SignInButton>
          </motion.div>
          <motion.div
            variants={item}
          >
            <SignInButton
              noRipple
              svg={TwitterIcon}
              hoverBgColor={theme.colorsThemed.social.twitter.hover}
              pressedBgColor={theme.colorsThemed.social.twitter.pressed}
              onClick={() => handleSignupRedirect(`${BASE_URL_AUTH}/twitter`)}
            >
              {t('signupOptions.twitter')}
            </SignInButton>
          </motion.div>
          <motion.div
            variants={item}
          >
            <TextWithLine
              lineColor={theme.colorsThemed.background.outlines1}
              innerSpan={<SContinueWithSpan>{t('signupOptions.or_continue_with')}</SContinueWithSpan>}
            />
          </motion.div>
          <SEmailSignInForm
            onSubmit={(e) => {
              e.preventDefault();
              if (!emailInputValid || isSubmitLoading || emailInput.length === 0) return;
              handleSubmitEmail();
            }}
          >
            <motion.div
              variants={item}
            >
              <SignInTextInput
                name="email"
                type="email"
                autoComplete="true"
                value={emailInput}
                isValid={emailInputValid}
                disabled={isSubmitLoading}
                onFocus={() => {
                  if (submitError) setSubmitError('');
                }}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t('signupOptions.email')}
                errorCaption={t('errors.email_invalid')}
              />
            </motion.div>
            {
              submitError ? (
                <AnimatedPresence
                  animateWhenInView={false}
                  animation="t-09"
                >
                  <SErrorDiv>
                    <InlineSvg
                      svg={AlertIcon}
                      width="16px"
                      height="16px"
                    />
                    { t(`errors.${submitError}`) }
                  </SErrorDiv>
                </AnimatedPresence>
              ) : null
            }
            <motion.div
              variants={item}
            >
              <EmailSignInButton
                type="submit"
                disabled={!emailInputValid || isSubmitLoading || emailInput.length === 0}
                onClick={() => {}}
              >
                <span>
                  {t('signupOptions.signInBtn')}
                </span>
              </EmailSignInButton>
            </motion.div>
          </SEmailSignInForm>
        </MSContentWrapper>
        <AnimatedPresence
          animateWhenInView={false}
          animation="t-01"
          delay={1.1}
        >
          <SLegalText>
            {t('legalDisclaimer.main_text')}
            <br />
            <Link href="/privacy-policy">
              <a href="/privacy-policy" target="_blank">{t('legalDisclaimer.privacy_policy')}</a>
            </Link>
            {', '}
            <Link href="/terms-and-conditions">
              <a href="/terms-and-conditions" target="_blank">{t('legalDisclaimer.terms')}</a>
            </Link>
            {' '}
            {t('legalDisclaimer.and')}
            {' '}
            <Link href="/community-guidelines">
              <a href="/community-guidelines" target="_blank">{t('legalDisclaimer.community_guidelines')}</a>
            </Link>
          </SLegalText>
        </AnimatedPresence>
      </SMenuWrapper>
    </SSignupMenu>
  );
};

export default SignupMenu;

// Staggering animation
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const SSignupMenu = styled.div<{ isLoading?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  height: 100%;
  width: 100%;

  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'default')};

  ${({ theme }) => theme.media.tablet} {
    width: 50%
  }

  ${({ theme }) => theme.media.laptopL} {
    width: 45%;
  }
`;

const SMenuWrapper = styled.div`
  position: relative;

  height: 100%;
  width: 100%;

  padding: 16px;

  /* No select for whole menu */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  & > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    button {
      width: 100%;
    }
    input {
      width: 100%;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: 360px;

    & > div {
      gap: 16px;
    }
  }
`;

const MSContentWrapper = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    width: 100%;
  }
  input {
    width: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    gap: 16px;
  }
`;

const SSignInBackButton = styled(GoBackButton)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;

  width: 100%;
  height: fit-content;

  padding: 8px;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  span {
    display: none;
  }

  &:active {
    & div > svg {
      transform: scale(0.8);

      transition: .2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;

    width: fit-content;

    margin-top: 142px;
    padding: 0;

    span {
      display: initial;
    }

    &:active {
      & div > svg {
        transform: initial;

        transition: initial;
      }
    }
  }

  ${({ theme }) => theme.media.laptopL} {
    display: none;
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 108px;
  margin-bottom: 24px;

  font-size: 22px;
  line-height: 30px;

  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 12px;
    margin-bottom: 8px;

    text-align: left;

    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-top: 140px;

    font-size: 32px;
    line-height: 40px;
  }
`;

const SSubheading = styled(Text)`
  display: none !important;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-weight: 600;
  font-style: normal;

  ${({ theme }) => theme.media.tablet} {
    display: block !important;
    margin-bottom: 24px;

    font-size: 16px;
    line-height: 24px;
  }
`;

const SContinueWithSpan = styled.span`
  width: fit-content;
  padding-left: 8px;
  padding-right: 8px;

  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
`;

const SEmailSignInForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;

const SLegalText = styled(Text)`
  margin-top: 24px;
  padding-bottom: 32px;

  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;


  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover, &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: .2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;
