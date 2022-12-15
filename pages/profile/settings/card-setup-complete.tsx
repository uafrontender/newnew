/* eslint-disable camelcase */
import React, { ReactElement, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';

import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import { NextPageWithLayout } from '../../_app';

import assets from '../../../constants/assets';
import isBrowser from '../../../utils/isBrowser';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';

const CardSetupCompleteModal = dynamic(
  () => import('../../../components/organisms/settings/CardSetupCompleteModal')
);

interface ICardSetupComplete {
  setup_intent_client_secret: string;
  setup_intent: string;
}
const CardSetupComplete: NextPage<ICardSetupComplete> = ({
  setup_intent_client_secret,
  setup_intent,
}) => {
  const router = useRouter();
  const { t } = useTranslation('page-Profile');

  const clientSecret = useMemo(
    () => setup_intent_client_secret,
    [setup_intent_client_secret]
  );
  const setupIntentId = useMemo(() => setup_intent, [setup_intent]);

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { setup_intent_client_secret, setup_intent } = context.query;

  if (!setup_intent_client_secret || !setup_intent) {
    return {
      redirect: {
        destination: `${
          context.locale !== 'en-US' ? `/${context.locale}` : ''
        }/profile/settings`,
        permanent: false,
      },
    };
  }

  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Profile'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...(setup_intent_client_secret
        ? {
            setup_intent_client_secret,
          }
        : {}),
      ...(setup_intent
        ? {
            setup_intent,
          }
        : {}),
      ...translationContext,
    },
  };
};
