import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { NextPage, NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { NextPageWithLayout } from './_app';
import AuthLayout, {
  AuthLayoutContext,
} from '../components/templates/AuthLayout';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { unsubscribeFromEmailNotifications } from '../api/endpoints/notification';
import { useAppSelector } from '../redux-store/store';

import useErrorToasts from '../utils/hooks/useErrorToasts';

const UnsubscribeMenu = dynamic(
  () => import('../components/organisms/UnsubscribeMenu')
);
interface IBundlesPage {
  token: string;
}

const Unsubscribe: NextPage<IBundlesPage> = ({ token }) => {
  const router = useRouter();
  const { t } = useTranslation('page-Unsubscribe');
  const authLayoutContext = useContext(AuthLayoutContext);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const { showErrorToastCustom } = useErrorToasts();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const handleConfirm = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleUnsubscribe = useCallback(async () => {
    if (unsubscribed) {
      return;
    }

    try {
      const payload = new newnewapi.UnsubscribeFromEmailNotificationsRequest({
        token,
      });

      const res = await unsubscribeFromEmailNotifications(payload);
      if (!res.data || res.error) {
        throw new Error(t('error.requestFailed'));
      }
      setUnsubscribed(true);
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
      // TODO: Show a screen with instruction?
    }
  }, [unsubscribed, token, showErrorToastCustom, t]);

  useEffect(() => {
    authLayoutContext.setShouldHeroUnmount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A Delay allows to cancel first request when the second full re-render happens
  useEffect(() => {
    const timer = setTimeout(() => {
      handleUnsubscribe();
    }, 100);

    return () => clearTimeout(timer);
  }, [handleUnsubscribe]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <motion.div
        initial={{
          x: isMobile ? 0 : 500,
          y: 1,
          opacity: 0,
        }}
        animate={{
          x: 0,
          // With 0 it bumps up the content in the end
          y: 1,
          opacity: 1,
          transition: {
            duration: isMobile ? 1.7 : 1,
          },
        }}
      >
        <UnsubscribeMenu onConfirm={handleConfirm} />
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

  const { token } = context.query;

  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

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
