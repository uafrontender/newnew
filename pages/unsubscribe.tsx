import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import UnsubscribeMenu from '../components/organisms/UnsubscribeMenu';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { useAppSelector } from '../redux-store/store';

const Unsubscribe = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Unsubscribe');
  const authLayoutContext = useContext(AuthLayoutContext);
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user.loggedIn && user._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=comment&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
    } else {
      // TODO: Send a request to unsubscribe. Once.
    }
  }, [user.loggedIn, user._persist?.rehydrated, router]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
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
            duration: 1,
          },
        }}
      >
        <UnsubscribeMenu />
      </motion.div>
    </>
  );
};

(Unsubscribe as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default Unsubscribe;

export const getStaticProps: GetStaticProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['page-Unsubscribe'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};
