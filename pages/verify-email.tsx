/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import AuthLayout from '../components/templates/AuthLayout';
import CodeVerificationMenu from '../components/organisms/CodeVerificationMenu';

interface IVerifyEmail {

}

const VerifyEmail: NextPage<IVerifyEmail> = () => {
  const { t } = useTranslation('verify-email');

  const { loggedIn, signupEmailInput } = useAppSelector((state) => state.user);
  const router = useRouter();

  // Temporary commented out for development purposes
  /* useEffect(() => {
    if (loggedIn || !signupEmailInput) router.push('/');
  }, [loggedIn, signupEmailInput, router]); */

  return (
    <AuthLayout>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <CodeVerificationMenu />
    </AuthLayout>
  );
};

export default VerifyEmail;

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
