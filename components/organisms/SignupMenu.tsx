// Temp disabled until backend is in place
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import isEmail from 'validator/lib/isEmail';

// Redux
import { useAppSelector, useAppDispatch } from '../../redux-store/store';
import { setSignupEmailInput } from '../../redux-store/slices/userStateSlice';

// API
import { sendVerificationEmail } from '../../api/endpoints/auth';

// Reason for signing up type
import { SignupReason } from '../../pages/sign-up';

// Components
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';
import SignInBackButton from '../molecules/signup/SignInBackButton';
import TextWithLine from '../atoms/TextWithLine';
import SignInTextInput from '../atoms/SignInTextInput';
import GradientButton from '../atoms/GradientButton';
import SignInButton from '../molecules/signup/SignInButton';

// Icons
import AppleIcon from '../../public/images/svg/auth/icon-apple.svg';
import GoogleIcon from '../../public/images/svg/auth/icon-google.svg';
import TwitterIcon from '../../public/images/svg/auth/icon-twitter.svg';
import FacebookIcon from '../../public/images/svg/auth/icon-facebook.svg';
import FacebookIconLight from '../../public/images/svg/auth/icon-facebook-light.svg';
import AppleSignInButton from '../molecules/signup/AppleSignInBtn';

export interface ISignupMenu {
  reason?: SignupReason
}

const SignupMenu: React.FunctionComponent<ISignupMenu> = ({ reason }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('sign-up');

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
          onClick={() => router.back()}
        >
          {t('goBackBtn')}
        </SSignInBackButton>
        <SHeadline
          variant={3}
        >
          {reason ? `${t('heading.sign_in_to')} ${t(`heading.reasons.${reason}`)}` : t('heading.sign_in')}
        </SHeadline>
        <SSubheading variant={2} weight={600}>
          {t('heading.subheading')}
        </SSubheading>
        <div>
          <SignInButton
            svg={GoogleIcon}
            hoverBgColor={theme.colors.social.google}
            onClick={() => {}}
          >
            {t('signupOptions.google')}
          </SignInButton>
          {/* <SignInButton
            svg={AppleIcon}
            hoverBgColor="#000"
            hoverContentColor="#FFF"
            onClick={() => {}}
          >
            {t('signupOptions.apple')}
          </SignInButton> */}
          <AppleSignInButton
            label={t('signupOptions.apple')}
          />
          <SignInButton
            svg={theme.name === 'dark' ? FacebookIcon : FacebookIconLight}
            hoverSvg={FacebookIconLight}
            hoverBgColor={theme.colors.social.facebook}
            onClick={() => {}}
          >
            {t('signupOptions.facebook')}
          </SignInButton>
          <SignInButton
            svg={TwitterIcon}
            hoverBgColor={theme.colors.social.twitter}
            onClick={() => {}}
          >
            {t('signupOptions.twitter')}
          </SignInButton>
          <TextWithLine
            lineColor={theme.colorsThemed.text.secondary}
            innerSpan={<SContinueWithSpan>{t('signupOptions.or_continue_with')}</SContinueWithSpan>}
          />
          {
            submitError ? <SErrorDiv>{ t(`errors.${submitError}`) }</SErrorDiv> : null
          }
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
          />
          <GradientButton
            disabled={!emailInputValid || isSubmitLoading}
            onClick={() => handleSubmitEmail()}
          >
            {t('signupOptions.signInBtn')}
          </GradientButton>
        </div>
        <SLegalText>
          {t('legalDisclaimer.main_text')}
          <br />
          <Link href="/">
            <a href="/" target="_blank">{t('legalDisclaimer.privacy_policy_terms')}</a>
          </Link>
          {' '}
          {t('legalDisclaimer.and')}
          {' '}
          <Link href="/">
            <a href="/" target="_blank">{t('legalDisclaimer.community_guidelines')}</a>
          </Link>
        </SLegalText>
      </SMenuWrapper>
    </SSignupMenu>
  );
};

export default SignupMenu;

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
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: 360px;

    & > div {
      gap: 16px;
    }
  }
`;

const SSignInBackButton = styled(SignInBackButton)`
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: fit-content;

  padding: 8px;

  background-color: ${({ theme }) => theme.colorsThemed.appBgColor};

  ${({ theme }) => theme.media.tablet} {
    position: static;

    width: fit-content;

    margin-top: 142px;
    padding: 0;
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
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

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

  // NB! Temp
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  a {
    text-decoration: none;
    font-weight: 600;
    // NB! Temp
    color: ${({ theme }) => (theme.name === 'light' ? 'rgba(115, 117, 140, 1)' : 'rgba(115, 117, 140, 1)')}
  }

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
    font-size: 14px;
    line-height: 20px;
  }
`;
