import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import AuthLayout from '../components/templates/AuthLayout';
import SignupMenu from '../components/organisms/SignupMenu';

// Sign up reasons
export const signupReasons = ['comment', 'bid'] as const;
export type SignupReason = typeof signupReasons[number];

interface ISignup {
  reason?: SignupReason;
}

const Signup: NextPage<ISignup> = ({
  reason,
}) => {
  const { t } = useTranslation('sign-up');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (loggedIn) router.push('/');
  }, [loggedIn, router]);

  return (
    <AuthLayout>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <SignupMenu
        reason={reason ?? undefined}
      />
    </AuthLayout>
  );
};

export default Signup;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { reason } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['sign-up'],
  );

  if (reason && !Array.isArray(reason) && signupReasons.find((validT) => validT === reason)) {
    return {
      props: {
        reason: reason as SignupReason,
        ...translationContext,
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
};
