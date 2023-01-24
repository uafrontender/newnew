import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';
import { NextPageWithLayout } from '../_app';
import { useAppSelector } from '../../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import ChatLayout from '../../components/templates/ChatLayout';
import ChatContainer from '../../components/organisms/direct-messages/ChatContainer';

export const Chat = () => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer />
    </>
  );
};

(Chat as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <ChatLayout>{page}</ChatLayout>
);

export default Chat;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Chat', 'modal-PaymentModal'],
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
