import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffectOnce } from 'react-use';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import UnsubscribeMenu from '../components/organisms/UnsubscribeMenu';
import { SUPPORTED_LANGUAGES } from '../constants/general';

const Unsubscribe = () => {
  const { t } = useTranslation('page-Unsubscribe');
  const authLayoutContext = useContext(AuthLayoutContext);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffectOnce(() => {
    // TODO: Send a request
  });

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

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['page-Unsubscribe'],
    null,
    SUPPORTED_LANGUAGES
  );
  // eslint-disable-next-line camelcase
  const { token } = context.query;

  return {
    props: {
      ...translationContext,
      ...(token
        ? {
            token,
          }
        : {}),
    },
  };
};
