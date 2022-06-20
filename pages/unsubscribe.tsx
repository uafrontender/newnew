import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import UnsubscribeMenu from '../components/organisms/UnsubscribeMenu';

const Unsubscribe = () => {
  const { t } = useTranslation('page-Unsubscribe');
  const authLayoutContext = useContext(AuthLayoutContext);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export async function getStaticProps(context: {
  locale: string;
}): Promise<any> {
  const translationContext = await serverSideTranslations(context.locale, [
    'page-Unsubscribe',
  ]);

  // TODO: get token from a magic link query parameters
  // TODO: send a request to BE API responsible for unsubscribing a user using a token
  // TODO: get a response and only then render a UI showing a success message

  return {
    props: {
      ...translationContext,
    },
  };
}
