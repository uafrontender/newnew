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
import CodeVerificationMenu from '../components/organisms/CodeVerificationMenu';

interface IVerifyEmail {

}

const VerifyEmail: NextPage<IVerifyEmail> = () => {
  const { t } = useTranslation('verify-email');

  const { loggedIn, signupEmailInput } = useAppSelector((state) => state.user);
  const router = useRouter();

  // Redirect if the user is logged in
  // useEffect(() => {
  //   if (loggedIn) router.push('/');
  // }, [loggedIn, router]);

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <CodeVerificationMenu
        expirationTime={60}
      />
    </>
  );
};

(VerifyEmail as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout>
      { page }
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
