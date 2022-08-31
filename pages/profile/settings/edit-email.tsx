import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';

import { NextPageWithLayout } from '../../_app';
import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import isBrowser from '../../../utils/isBrowser';
import assets from '../../../constants/assets';
import { useAppSelector } from '../../../redux-store/store';

const EditEmailModal = dynamic(
  () => import('../../../components/molecules/settings/EditEmailModal')
);

const EditEmailPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { loggedIn, _persist } = useAppSelector((state: any) => state.user);

  useUpdateEffect(() => {
    if (!loggedIn && _persist?.rehydrated) {
      router.push('/');
    }
  }, [loggedIn, _persist?.rehydrated, router]);

  useEffect(() => {
    router.prefetch('/profile/settings');
  }, [router]);

  if (!isBrowser()) {
    return <div />;
  }

  return (
    <div>
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
      <EditEmailModal
        show
        onClose={() => {
          router.push('/profile/settings');
        }}
      />
    </div>
  );
};

export default EditEmailPage;

(EditEmailPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <MyProfileSettingsLayout>{page}</MyProfileSettingsLayout>
);

export async function getServerSideProps(context: {
  locale: string;
}): Promise<any> {
  const translationContext = await serverSideTranslations(context.locale, [
    'common',
    'page-Profile',
    'page-VerifyEmail',
  ]);

  // @ts-ignore
  if (!context?.req?.cookies?.accessToken) {
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
    },
  };
}
