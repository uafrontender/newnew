/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { useUpdateEffect } from 'react-use';
import { motion } from 'framer-motion';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import AuthLayout, { AuthLayoutContext } from '../components/templates/AuthLayout';
import CodeVerificationMenu from '../components/organisms/CodeVerificationMenu';

interface IVerifyEmail {

}

const VerifyEmail: NextPage<IVerifyEmail> = () => {
  const { t } = useTranslation('verify-email');

  const { loggedIn, signupEmailInput } = useAppSelector((state) => state.user);
  const router = useRouter();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const authLayoutContext = useContext(AuthLayoutContext);

  // Redirect if the user is logged in
  // useEffect(() => {
  //   if (loggedIn) router.push('/');
  // }, [loggedIn, router]);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <motion.div
        initial={{
          x: 500,
          y: 0,
          opacity: 0,
        }}
        animate={{
          x: 0,
          y: 0,
          opacity: 1,
          transition: {
            duration: 1
          }
        }}
        >
        <CodeVerificationMenu
          expirationTime={60}
        />
      </motion.div>
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
    ['sign-up', 'verify-email'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
