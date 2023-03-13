import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useUpdateEffect } from 'react-use';
import { useRouter } from 'next/router';

import Content from '../../components/organisms/creator/Dashboard';

import { NextPageWithLayout } from '../_app';
import assets from '../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import DashboardLayout from '../../components/templates/DashboardLayout';
import ChatContainer from '../../components/organisms/direct-messages/ChatContainer';
import { useGetChats } from '../../contexts/chatContext';
import { useAppSelector } from '../../redux-store/store';

export const Dashboard = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Creator');
  const { mobileChatOpened } = useGetChats();
  const { userData } = useAppSelector((state) => state.user);

  useUpdateEffect(() => {
    if (!userData?.options?.isCreator) {
      router.replace('/');
    }
  }, [userData?.options?.isCreator]);

  return (
    <>
      <Head>
        <title>{t('dashboard.meta.title')}</title>
        <meta name='description' content={t('dashboard.meta.description')} />
        <meta property='og:title' content={t('dashboard.meta.title')} />
        <meta
          property='og:description'
          content={t('dashboard.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Content />
      {mobileChatOpened && <ChatContainer />}
    </>
  );
};

(Dashboard as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <DashboardLayout withChat>{page}</DashboardLayout>
);

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Creator', 'page-Chat'],
    null,
    SUPPORTED_LANGUAGES
  );

  const { req } = context;

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
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
};
