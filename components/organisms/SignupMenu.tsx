import React, { useCallback, useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/dist/client/router';
import styled, { useTheme } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'next-i18next';
// import Skeleton from 'react-loading-skeleton';

// API
import { sendVerificationEmail, BASE_URL_AUTH } from '../../api/endpoints/auth';

// Reason for signing up type
import { SignupReason } from '../../utils/signUpReasons';

// Components
import AnimatedPresence from '../atoms/AnimatedPresence';
import Headline from '../atoms/Headline';
import Text from '../atoms/Text';
import GoBackButton from '../molecules/GoBackButton';
import TextWithLine from '../atoms/TextWithLine';
import SignInButton from '../molecules/signup/SignInButton';

// Icons
import AppleIcon from '../../public/images/svg/auth/icon-apple.svg';
import GoogleIcon from '../../public/images/svg/auth/icon-google.svg';
import TwitterIcon from '../../public/images/svg/auth/icon-twitter.svg';
import FacebookIcon from '../../public/images/svg/auth/icon-facebook.svg';
import FacebookIconLight from '../../public/images/svg/auth/icon-facebook-light.svg';

// Utils
import isBrowser from '../../utils/isBrowser';
import { AuthLayoutContext } from '../templates/AuthLayout';
import isSafari from '../../utils/isSafari';
import { Mixpanel } from '../../utils/mixpanel';
import { I18nNamespaces } from '../../@types/i18next';
import { loadStateLS, removeStateLS } from '../../utils/localStorage';
import { useAppState } from '../../contexts/appStateContext';
import { useGetAppConstants } from '../../contexts/appConstantsContext';
import EmailSignInForm from '../molecules/signup/EmailSignInForm';
import useGoBackOrRedirect from '../../utils/useGoBackOrRedirect';
import { useSignup } from '../../contexts/signUpContext';

export interface ISignupMenu {
  goal?: string;
  reason?: SignupReason;
  redirectURL?: string;
}

const SignupMenu: React.FunctionComponent<ISignupMenu> = ({
  goal,
  reason,
  redirectURL,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { t } = useTranslation('page-SignUp');
  const { appConstants } = useGetAppConstants();
  const availableSocialProviders = useMemo<{
    google: boolean;
    fb: boolean;
    twitter: boolean;
    apple: boolean;
  }>(() => {
    if (!appConstants?.availableAuthProviders) {
      return {
        google: true,
        fb: true,
        twitter: true,
        apple: true,
      };
    }
    return {
      google: appConstants?.availableAuthProviders.includes(
        newnewapi.GetAppConstantsResponse.AuthProvider.GOOGLE
      ),
      fb: appConstants?.availableAuthProviders.includes(
        newnewapi.GetAppConstantsResponse.AuthProvider.FB
      ),
      twitter: appConstants?.availableAuthProviders.includes(
        newnewapi.GetAppConstantsResponse.AuthProvider.TWITTER
      ),
      apple: appConstants?.availableAuthProviders.includes(
        newnewapi.GetAppConstantsResponse.AuthProvider.APPLE
      ),
    };
  }, [appConstants?.availableAuthProviders]);

  const authLayoutContext = useContext(AuthLayoutContext);

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  // const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const { setSignupEmailInput, setSignupTimerValue } = useSignup();

  const [textWidth, setTextWidth] = useState<number | undefined>();

  const handleTextWidthChange = useCallback((newTextWidth: number) => {
    setTextWidth((curr) => Math.max(curr || 0, newTextWidth));
  }, []);

  const handleSubmitEmail = async (emailInput: string) => {
    const localHasSoldBundles = loadStateLS('creatorHasSoldBundles') as boolean;

    if (localHasSoldBundles) {
      removeStateLS('creatorHasSoldBundles');
    }

    const payload = new newnewapi.SendVerificationEmailRequest({
      emailAddress: emailInput,
      useCase:
        newnewapi.SendVerificationEmailRequest.UseCase.SIGN_UP_WITH_EMAIL,
      ...(redirectURL
        ? {
            redirectUrl: redirectURL,
          }
        : {}),
    });

    const { data, error } = await sendVerificationEmail(payload);

    if (!data || error) {
      throw new Error(error?.message ?? 'Request failed');
    }

    if (
      data.status !== newnewapi.SendVerificationEmailResponse.Status.SUCCESS &&
      data.status !==
        newnewapi.SendVerificationEmailResponse.Status.SHOULD_RETRY_AFTER
    ) {
      // TODO: Add texts for individual error statuses
      throw new Error('Request failed');
    }

    setSignupEmailInput(emailInput);
    setSignupTimerValue(data.retryAfter);

    authLayoutContext.setShouldHeroUnmount(true);

    const parameters = {
      to: goal,
      reason,
      redirectUrl: redirectURL,
    };

    const queryString = Object.entries(parameters)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
      .join('&');

    const verificationPath = `/verify-email${
      queryString ? `?${queryString}` : ''
    }`;

    if (!isSafari()) {
      setTimeout(() => {
        router.replace(verificationPath);
      }, 1000);
    } else {
      router.replace(verificationPath);
    }
  };

  const handleSignupRedirect = (url: string) => {
    if (isBrowser()) {
      window.location.href = url;
    }
  };

  // eslint-disable-next-line no-nested-ternary
  const redirectUrlParam = redirectURL
    ? `?redirect_url=${encodeURIComponent(redirectURL)}`
    : goal === 'create'
    ? `?redirect_url=${process.env.NEXT_PUBLIC_APP_URL}/creator-onboarding`
    : '';

  return (
    <SSignupMenu
    // style={{
    //   ...(!isMobileOrTablet && authLayoutContext.shouldHeroUnmount ? {
    //     transform: 'translateX(-1000px)',
    //     transition: '0.6s linear'
    //   } : {})
    // }}
    >
      <SMenuWrapper>
        <SSignInBackButton
          defer={isMobile ? 250 : undefined}
          onClick={() => {
            Mixpanel.track('Back Button Clicked', {
              _stage: 'Sign Up',
            });
            goBackOrRedirect('/');
          }}
        >
          <span>{t('button.back')}</span>
        </SSignInBackButton>
        <SHeadline variant={3}>
          {reason && reason !== 'session_expired'
            ? `${t('heading.sign-in-to')} ${t(
                `heading.reason.${
                  reason as keyof I18nNamespaces['page-SignUp']['heading']['reason']
                }`
              )}`
            : t('heading.sign-in')}
        </SHeadline>
        <SSubheading variant={2} weight={600}>
          {reason !== 'session_expired'
            ? t('heading.subheading')
            : t('heading.subheadingSessionExpired')}
        </SSubheading>
        <MSContentWrapper variants={container} initial='hidden' animate='show'>
          {appConstants?.availableAuthProviders ? (
            <>
              {availableSocialProviders.google && (
                <motion.div variants={item}>
                  <SignInButton
                    noRipple
                    svg={GoogleIcon}
                    hoverBgColor={theme.colorsThemed.social.google.hover}
                    pressedBgColor={theme.colorsThemed.social.google.pressed}
                    textWidth={textWidth}
                    setTextWidth={handleTextWidthChange}
                    onClick={() => {
                      Mixpanel.track('Sign In With Google Clicked', {
                        _stage: 'Sign Up',
                      });
                      handleSignupRedirect(
                        `${BASE_URL_AUTH}/google${redirectUrlParam}`
                      );
                    }}
                  >
                    {t('signUpOptions.google')}
                  </SignInButton>
                </motion.div>
              )}
              {availableSocialProviders.apple && (
                <motion.div variants={item}>
                  <SignInButton
                    noRipple
                    svg={AppleIcon}
                    hoverBgColor='#000'
                    hoverContentColor='#FFF'
                    pressedBgColor={theme.colorsThemed.social.apple.pressed}
                    textWidth={textWidth}
                    setTextWidth={handleTextWidthChange}
                    onClick={() => {
                      Mixpanel.track('Sign In With Apple Clicked', {
                        _stage: 'Sign Up',
                      });
                      handleSignupRedirect(
                        `${BASE_URL_AUTH}/apple${redirectUrlParam}`
                      );
                    }}
                  >
                    {t('signUpOptions.apple')}
                  </SignInButton>
                </motion.div>
              )}
              {availableSocialProviders.fb && (
                <motion.div variants={item}>
                  <SignInButton
                    noRipple
                    svg={
                      theme.name === 'dark' ? FacebookIcon : FacebookIconLight
                    }
                    hoverSvg={FacebookIconLight}
                    hoverBgColor={theme.colorsThemed.social.facebook.hover}
                    pressedBgColor={theme.colorsThemed.social.facebook.pressed}
                    textWidth={textWidth}
                    setTextWidth={handleTextWidthChange}
                    onClick={() => {
                      Mixpanel.track('Sign In With Facebook Clicked', {
                        _stage: 'Sign Up',
                      });
                      handleSignupRedirect(
                        `${BASE_URL_AUTH}/fb${redirectUrlParam}`
                      );
                    }}
                  >
                    {t('signUpOptions.facebook')}
                  </SignInButton>
                </motion.div>
              )}
              {availableSocialProviders.twitter && (
                <motion.div variants={item}>
                  <SignInButton
                    noRipple
                    svg={TwitterIcon}
                    hoverBgColor={theme.colorsThemed.social.twitter.hover}
                    pressedBgColor={theme.colorsThemed.social.twitter.pressed}
                    textWidth={textWidth}
                    setTextWidth={handleTextWidthChange}
                    onClick={() => {
                      Mixpanel.track('Sign In With Twitter Clicked', {
                        _stage: 'Sign Up',
                      });
                      handleSignupRedirect(
                        `${BASE_URL_AUTH}/twitter${redirectUrlParam}`
                      );
                    }}
                  >
                    {t('signUpOptions.twitter')}
                  </SignInButton>
                </motion.div>
              )}
            </>
          ) : null}
          <motion.div variants={item}>
            <TextWithLine
              lineColor={theme.colorsThemed.background.outlines1}
              innerSpan={
                <SContinueWithSpan>
                  {t('signUpOptions.orContinueWith')}
                </SContinueWithSpan>
              }
            />
          </motion.div>
          <EmailSignInForm
            onSubmit={handleSubmitEmail}
            animationVariants={item}
          />
        </MSContentWrapper>
        <AnimatedPresence
          animateWhenInView={false}
          animation='t-01'
          delay={1.1}
        >
          <SLegalText>
            {t('legalDisclaimer.mainText')}
            <br />
            <Link href='https://privacy.newnew.co'>
              <a
                href='https://privacy.newnew.co'
                target='_blank'
                rel='noreferrer'
                onClickCapture={() =>
                  Mixpanel.track('Privacy Link Clicked', {
                    _stage: 'Sign Up',
                  })
                }
              >
                {t('legalDisclaimer.privacyPolicy')}
              </a>
            </Link>
            <Link href='https://terms.newnew.co'>
              <a
                href='https://terms.newnew.co'
                target='_blank'
                rel='noreferrer'
                onClickCapture={() =>
                  Mixpanel.track('Terms Link Clicked', {
                    _stage: 'Sign Up',
                  })
                }
              >
                {t('legalDisclaimer.terms')}
              </a>
            </Link>{' '}
            {t('legalDisclaimer.and')}{' '}
            <Link href='https://communityguidelines.newnew.co'>
              <a
                href='https://communityguidelines.newnew.co'
                target='_blank'
                rel='noreferrer'
                onClickCapture={() =>
                  Mixpanel.track('Community Guidelines Link Clicked', {
                    _stage: 'Sign Up',
                  })
                }
              >
                {t('legalDisclaimer.communityGuidelines')}
              </a>
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
      duration: 1,
    },
  },
};

const SSignupMenu = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  height: 100%;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 50%;
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

      transition: 0.2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;

    width: fit-content;

    margin-top: 62px;
    margin-bottom: 80px;
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
    margin-top: 80px;

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

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;
