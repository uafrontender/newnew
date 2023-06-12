import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';

import { NextPageWithLayout } from '../../_app';
import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import isBrowser from '../../../utils/isBrowser';
import assets from '../../../constants/assets';
import { useAppState } from '../../../contexts/appStateContext';

const EditEmailPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Profile');
  const { userLoggedIn } = useAppState();

  useUpdateEffect(() => {
    if (!userLoggedIn) {
      router.push('/');
    }
  }, [userLoggedIn, router]);

  useEffect(() => {
    router.push('/profile/settings');
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
    redirect: {
      permanent: false,
      destination: '/profile/settings',
    },
  };
}
