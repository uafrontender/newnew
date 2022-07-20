import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';

import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import { NextPageWithLayout } from '../../_app';
import StripeElements from '../../../HOC/StripeElements';

import assets from '../../../constants/assets';

const CardSetupCompleteModal = dynamic(
  () => import('../../../components/organisms/settings/CardSetupCompleteModal')
);

const CardSetupComplete: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('modal-Post');

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
      <StripeElements>
        <CardSetupCompleteModal show closeModal={closeModal} />
      </StripeElements>
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
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Profile',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};
