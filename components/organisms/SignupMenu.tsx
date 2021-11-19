// Temp disabled until backend is in place
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import isEmail from 'validator/lib/isEmail';

// Redux
import { useAppSelector, useAppDispatch } from '../../redux-store/store';
import {
  setCredentialsData, setSignupEmailInput, setUserData, setUserLoggedIn,
} from '../../redux-store/slices/userStateSlice';

// API
import { sendVerificationEmail, BASE_URL_AUTH } from '../../api/endpoints/auth';

// Utils
import sleep from '../../utils/sleep';
import dateToTimestamp from '../../utils/dateToTimestamp';

// Reason for signing up type
import { SignupReason } from '../../pages/sign-up';

// Components
import InlineSvg from '../atoms/InlineSVG';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';
import GoBackButton from '../molecules/GoBackButton';
import TextWithLine from '../atoms/TextWithLine';
import SignInTextInput from '../atoms/SignInTextInput';
import Button from '../atoms/Button';
import SignInButton from '../molecules/signup/SignInButton';

// Icons
import AlertIcon from '../../public/images/svg/icons/filled/Alert.svg';
import AppleIcon from '../../public/images/svg/auth/icon-apple.svg';
import GoogleIcon from '../../public/images/svg/auth/icon-google.svg';
import TwitterIcon from '../../public/images/svg/auth/icon-twitter.svg';
import FacebookIcon from '../../public/images/svg/auth/icon-facebook.svg';
import FacebookIconLight from '../../public/images/svg/auth/icon-facebook-light.svg';
import isBrowser from '../../utils/isBrowser';
import { T1 } from '../atoms/AnimationsText';

export interface ISignupMenu {
  reason?: SignupReason
}

const SignupMenu: React.FunctionComponent<ISignupMenu> = ({ reason }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('sign-up');

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

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
      // Temp commented out for dev purposes
      /* const payload = new newnewapi.SendVerificationEmailRequest({
        emailAddress: emailInput,
      });

      const { data, error } = await sendVerificationEmail(payload);

      if (!data || error) throw new Error(error?.message ?? 'Request failed'); */

      dispatch(setSignupEmailInput(emailInput));
      setIsSubmitLoading(false);

      router.push('/verify-email');
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

  // NB! Testing only
  const handleLogInTest = useCallback(() => {
    const mockResponse = new newnewapi.SignInResponse({
      me: {
        username: 'johndoe12345',
        displayName: 'John',
        email: 'johndoe@test.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
        userUuid: '123123',
        options: {
          isCreator: false,
        },
      },
      credential: {
        accessToken: '12345',
        refreshToken: '12345',
        expiresAt: dateToTimestamp(new Date()),
      },
      status: 1,
    });

    dispatch(setUserData(mockResponse.me));

    dispatch(setCredentialsData({
      accessToken: mockResponse.credential?.accessToken,
      refreshToken: mockResponse.credential?.refreshToken,
      expiresAt: mockResponse.credential?.expiresAt?.seconds,
    }));

    dispatch(setUserLoggedIn(true));

    router.push('/', undefined, { shallow: true });
  }, [dispatch, router]);

  // Check if email is valid
  useEffect(() => {
    if (emailInput.length > 0) {
      setEmailInputValid(isEmail(emailInput));
    }
  }, [emailInput, setEmailInputValid]);

  return (
    <SSignupMenu
      isLoading={isSubmitLoading}
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
          {reason ? `${t('heading.sign_in_to')} ${t(`heading.reasons.${reason}`)}` : t('heading.sign_in')}
        </SHeadline>
        <SSubheading variant={2} weight={600}>
          {t('heading.subheading')}
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
              lineColor={theme.colorsThemed.text.secondary}
              innerSpan={<SContinueWithSpan>{t('signupOptions.or_continue_with')}</SContinueWithSpan>}
            />
          </motion.div>
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
              <SErrorDiv>
                <InlineSvg
                  svg={AlertIcon}
                  width="16px"
                  height="16px"
                />
                { t(`errors.${submitError}`) }
              </SErrorDiv>
            ) : null
          }
          <motion.div
            variants={item}
          >
            <Button
              noRipple
              disabled={!emailInputValid || isSubmitLoading || emailInput.length === 0}
              onClick={() => handleSubmitEmail()}
            >
              <span>
                {t('signupOptions.signInBtn')}
              </span>
            </Button>
          </motion.div>
        </MSContentWrapper>
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
      staggerChildren: 0.35,
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

  width: 100%;
  height: fit-content;

  padding: 8px;

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};

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

  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 12px;
    margin-bottom: 8px;

    text-align: left;

    font-size: 36px;
    line-height: 44px;
  }

  ${({ theme }) => theme.media.laptopL} {
    margin-top: 140px;

    font-size: 32px;
    line-height: 40px;
  }
`;

const SSubheading = styled(Text)`
  display: none;

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    display: block;
    margin-bottom: 24px;

    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptopL} {
    line-height: 24px;
  }
`;

const SContinueWithSpan = styled.span`
  width: fit-content;
  padding-left: 8px;
  padding-right: 8px;

  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
  }
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
  }
`;

const SLegalText = styled(Text)`
  margin-top: 24px;
  padding-bottom: 32px;

  text-align: center;

  font-weight: 500;
  font-size: 12px;
  line-height: 16px;


  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  opacity: 0;
  animation: ${T1};
  animation-duration: .2s;
  animation-delay: 3s;
  animation-fill-mode: forwards;

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.quaternary};

    &:hover, &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: .2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
    font-size: 14px;
    line-height: 20px;
  }
`;
