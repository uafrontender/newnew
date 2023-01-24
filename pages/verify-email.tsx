/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import CodeVerificationMenu from '../components/organisms/CodeVerificationMenu';
import assets from '../constants/assets';
import { useAppSelector } from '../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../constants/general';

interface IVerifyEmail {
  goal?: string;
}

const VerifyEmail: React.FC<IVerifyEmail> = ({ goal }) => {
  const { t } = useTranslation('page-VerifyEmail');
  const router = useRouter();
  const authLayoutContext = useContext(AuthLayoutContext);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { signupEmailInput } = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  // Redirect if the user is logged in
  // useEffect(() => {
  //   if (loggedIn) router.push('/');
  // }, [loggedIn, router]);

  useEffect(() => {
    if (!signupEmailInput) {
      router?.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <motion.div
        initial={{
          x: isMobile ? 0 : 500,
          y: 0,
          opacity: 0,
        }}
        animate={{
          x: 0,
          y: 0,
          opacity: 1,
          transition: {
            duration: isMobile ? 1.7 : 1,
          },
        }}
      >
        <CodeVerificationMenu
          expirationTime={60}
          redirectUserTo={goal === 'create' ? '/creator-onboarding' : undefined}
        />
      </motion.div>
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
  const { to } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-SignUp', 'page-VerifyEmail'],
    null,
    SUPPORTED_LANGUAGES
  );

  const goal = to && !Array.isArray(to) ? to : '';

  return {
    props: {
      ...(goal
        ? {
            goal,
          }
        : {}),
      ...translationContext,
    },
  };
};
