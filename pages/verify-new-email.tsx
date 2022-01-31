/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import AuthLayout from '../components/templates/AuthLayout';
import CodeVerificationMenuNewEmail from '../components/organisms/CodeVerificationMenuNewEmail';

interface IVerifyNewEmail {
}

const VerifyNewEmail: NextPage<IVerifyNewEmail> = () => {
  const { t } = useTranslation('verify-email');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  const { email, redirect } = router.query;

  // Redirect if the user is not logged in
  useEffect(() => {
    if (!loggedIn) router.push('/');
  }, [
    loggedIn,
    router,
  ]);

  if (!email || !redirect) {
    return (
      <>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <CodeVerificationMenuNewEmail
        newEmail={email as string}
        redirect={redirect as 'settings' | 'dashboard'}
        expirationTime={10}
      />
    </>
  );
};

(VerifyNewEmail as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout>
      { page }
    </AuthLayout>
  );
};

export default VerifyNewEmail;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['verify-email'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
