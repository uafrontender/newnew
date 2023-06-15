import React, { ReactElement, useCallback, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import CodeVerificationMenu from '../components/organisms/CodeVerificationMenu';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { SignupReason, signupReasons } from '../utils/signUpReasons';
import { useSignup } from '../contexts/signUpContext';

interface IVerifyEmail {
  reason?: SignupReason;
  redirectURL?: string;
  goal?: string;
}

const VerifyEmail: React.FC<IVerifyEmail> = ({ reason, redirectURL, goal }) => {
  const { t } = useTranslation('page-VerifyEmail');
  const router = useRouter();
  const authLayoutContext = useContext(AuthLayoutContext);
  const { signupEmailInput } = useSignup();

  useEffect(() => {
    if (!signupEmailInput) {
      router?.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = useCallback(() => {
    const parameters = {
      to: goal,
      reason,
      redirectUrl: redirectURL,
    };
    const queryString = Object.entries(parameters)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
      .join('&');

    const signUpPath = `/sign-up${queryString ? `?${queryString}` : ''}`;
    router.replace(signUpPath);
  }, [goal, reason, redirectURL, router]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <CodeVerificationMenu
        allowLeave={!signupEmailInput}
        redirectUserTo={goal === 'create' ? '/creator-onboarding' : undefined}
        onBack={handleBack}
      />
    </>
  );
};

(VerifyEmail as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default VerifyEmail;

export const getServerSideProps: GetServerSideProps<IVerifyEmail> = async (
  context
) => {
  const { to, reason, redirect } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-SignUp', 'page-VerifyEmail'],
    null,
    SUPPORTED_LANGUAGES
  );

  const redirectURL = redirect && !Array.isArray(redirect) ? redirect : '';
  const goal = to && !Array.isArray(to) ? to : '';

  if (
    reason &&
    !Array.isArray(reason) &&
    signupReasons.find((validT) => validT === reason)
  ) {
    return {
      props: {
        reason: reason as SignupReason,
        ...(redirectURL
          ? {
              redirectURL,
            }
          : {}),
        ...(goal
          ? {
              goal,
            }
          : {}),
        ...translationContext,
      },
    };
  }

  return {
    props: {
      ...(redirectURL
        ? {
            redirectURL,
          }
        : {}),
      ...(goal
        ? {
            goal,
          }
        : {}),
      ...translationContext,
    },
  };
};
