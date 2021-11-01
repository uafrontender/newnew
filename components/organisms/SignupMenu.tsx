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
import InlineSvg from '../atoms/InlineSVG';
import TextInput from '../atoms/TextInput';
import BasicButton from '../atoms/BasicButton';
import TextWithLine from '../atoms/TextWithLine';
import SignInButton from '../molecules/SignInButton';

// Icons
// import BackButtonIcon from '../../public/icon-back-temp.svg';
import BackButtonIcon from '../../public/icon-back-temp2.svg';
import ArrowDownIcon from '../../public/icon-arrow-down.svg';
import ArrowDownIconLight from '../../public/icon-arrow-down-light.svg';
import AppleIcon from '../../public/icon-apple.svg';
import GoogleIcon from '../../public/icon-google.svg';
import TwitterIcon from '../../public/icon-twitter.svg';
import FacebookIcon from '../../public/icon-facebook.svg';
import FacebookIconLight from '../../public/icon-facebook-light.svg';

export interface ISignupMenu {
  reason?: SignupReason
}

const SSignupMenu = styled.div<{ isLoading?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  height: 100%;
  width: 100%;

  /* Temporary */
  /* background-color: #F2F2F2; */


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

  h1 {
    margin-top: 140px;
    margin-bottom: 24px;

    text-align: center;

    font-style: normal;
    font-weight: bold;
    font-size: 32px;
    line-height: 40px;
  }

  h4 {
    display: none;
  }

  & > div {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  p {
    margin-top: 24px;
    padding-bottom: 32px;

    text-align: center;

    font-weight: 600;
    font-size: 12px;
    line-height: 16px;

    color: ${({ theme }) => (theme.name === 'light' ? '#949DB7' : 'rgba(115, 117, 140, 0.7)')};

    a {
      text-decoration: none;
      color: ${({ theme }) => (theme.name === 'light' ? theme.colorsThemed.onSurface : 'rgba(115, 117, 140, 1)')}
    }
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: 360px;

    h1 {
      margin-top: 12px;

      text-align: left;
      margin-bottom: 8px;
    }

    h4 {
      display: block;
      margin-bottom: 24px;
    }

    & > div {
      gap: 16px;
    }

    p {
      text-align: left;
      font-size: 14px;
      line-height: 20px;
    }
  }

  ${({ theme }) => theme.media.laptopL} {
    h1 {
      margin-top: 20vh;
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
    position: static;

    margin-top: 20vh;
    padding: 0;

    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptopL} {
    display: none;
  }
`;

const SContinueWithSpan = styled.span`
  width: fit-content;
  padding-left: 16px;
  padding-right: 16px;

  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => (theme.name === 'light' ? '#949DB7' : 'rgba(115, 117, 140, 0.7)')};
  background-color: ${({ theme }) => theme.colorsThemed.appBgColor};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
  }
`;

const SErrorDiv = styled.div`
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.alertRed};

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
  }
`;

const SignupMenu: React.FunctionComponent<ISignupMenu> = ({ reason }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('sign-up');

  const { signupEmailInput } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  // Show more options
  const [bottomSectionOpen, setBottomSectionOpen] = useState(false);

  // Email inut
  const [emailInput, setEmailInput] = useState(signupEmailInput ?? '');
  // Validity of input
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
        <SBackButton
          onClick={() => router.back()}
        >
          <InlineSvg
            svg={BackButtonIcon}
            width="24px"
            height="24px"
          />
          {t('goBackBtn')}
        </SBackButton>
        <h1>
          {reason ? `${t('heading.sign_in_to')} ${t(`heading.reasons.${reason}`)}` : t('heading.sign_in')}
        </h1>
        <h4>
          {t('heading.subheading')}
        </h4>
        <div>
          <SignInButton
            svg={GoogleIcon}
            onClick={() => {}}
          >
            {t('signupOptions.google')}
          </SignInButton>
          <SignInButton
            svg={AppleIcon}
            hoverBgColor="#000"
            hoverContentColor="#FFF"
            onClick={() => {}}
          >
            {t('signupOptions.apple')}
          </SignInButton>
          <SignInButton
            svg={theme.name === 'dark' ? FacebookIcon : FacebookIconLight}
            onClick={() => {}}
          >
            {t('signupOptions.facebook')}
          </SignInButton>
          {
            !bottomSectionOpen ? (
              <SignInButton
                title="Show more options"
                svg={theme.name === 'dark' ? ArrowDownIconLight : ArrowDownIcon}
                hoverBgColor={theme.name === 'dark' ? '#000' : undefined}
                hoverContentColor={theme.name === 'dark' ? '#FFF' : undefined}
                onClick={() => setBottomSectionOpen(true)}
              >
                {t('signupOptions.moreOptionsBtn')}
              </SignInButton>
            ) : (
              <>
                <SignInButton
                  svg={TwitterIcon}
                  onClick={() => {}}
                >
                  {t('signupOptions.twitter')}
                </SignInButton>
                <TextWithLine
                  lineColor={theme.name === 'light' ? '#949DB7' : 'rgba(115, 117, 140, 0.7)'}
                  innerSpan={<SContinueWithSpan>{t('signupOptions.or_continue_with')}</SContinueWithSpan>}
                />
                {
                  submitError ? <SErrorDiv>{ t(`errors.${submitError}`) }</SErrorDiv> : null
                }
                <TextInput
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
                <BasicButton
                  disabled={!emailInputValid || isSubmitLoading}
                  onClick={() => handleSubmitEmail()}
                >
                  {t('signupOptions.signInBtn')}
                </BasicButton>
              </>
            )
          }
        </div>
        <p>
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
        </p>
      </SMenuWrapper>
    </SSignupMenu>
  );
};

export default SignupMenu;
