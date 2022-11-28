import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';

import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import { NextPageWithLayout } from '../../_app';

import assets from '../../../constants/assets';
import isBrowser from '../../../utils/isBrowser';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';

const CardSetupCompleteModal = dynamic(
  () => import('../../../components/organisms/settings/CardSetupCompleteModal')
);

const CardSetupComplete: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Profile');

  const clientSecret = router.query.setup_intent_client_secret as string;
  const setupIntentId = router.query.setup_intent as string;

  useEffect(() => {
    router.prefetch('/profile/settings');
  }, [router]);

  const closeModal = () => {
    router.replace('/profile/settings');
  };

  return (
    <>
      <Head>
        <title>{t('Settings.meta.title')}</title>
        <meta name='description' content={t('Settings.meta.description')} />
        <meta property='og:title' content={t('Settings.meta.title')} />
        <meta
          property='og:description'
          content={t('Settings.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {isBrowser() && (
        <CardSetupCompleteModal
          show
          closeModal={closeModal}
          clientSecret={clientSecret}
          setupIntentId={setupIntentId}
        />
      )}
    </>
  );
};
export default CardSetupComplete;

(CardSetupComplete as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <MyProfileSettingsLayout>{page}</MyProfileSettingsLayout>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Profile'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};
