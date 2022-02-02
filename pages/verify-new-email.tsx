/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import AuthLayout from '../components/templates/AuthLayout';
import CodeVerificationMenuNewEmail from '../components/organisms/CodeVerificationMenuNewEmail';
import { SocketContext } from '../contexts/socketContext';
import { setUserData } from '../redux-store/slices/userStateSlice';
import { becomeCreator } from '../api/endpoints/user';

interface IVerifyNewEmail {
}

const VerifyNewEmail: NextPage<IVerifyNewEmail> = () => {
  const { t } = useTranslation('verify-email');

  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { email, redirect } = router.query;

  // Socket
  const socketConnection = useContext(SocketContext);

  // Redirect if the user is not logged in
  useEffect(() => {
    if (!user.loggedIn) router.push('/');
  }, [
    user.loggedIn,
    router,
  ]);

  // Listen to Me update event
  useEffect(() => {
    const handlerSocketMeUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded) return;

      if (redirect === 'settings') {
        dispatch(setUserData({
          email: decoded.me?.email,
        }));
      }

      if (redirect === 'dashboard') {
        const becomeCreatorPayload = new newnewapi.EmptyRequest({});

        const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

        console.log(becomeCreatorRes);

        if (
          !becomeCreatorRes.data
          || becomeCreatorRes.error
        ) throw new Error('Become creator failed');

        dispatch(setUserData({
          email: decoded.me?.email,
          options: {
            isActivityPrivate: data.me?.options?.isActivityPrivate,
            isCreator: data.me?.options?.isCreator,
            isVerified: data.me?.options?.isVerified,
            creatorStatus: data.me?.options?.creatorStatus,
          },
        }));
      }

      if (redirect === 'settings') {
        router.push('/profile/settings');
      } else {
        router.push('/creator/dashboard');
      }
    };

    if (socketConnection) {
      socketConnection.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  if (!email || !redirect) {
    return (
      <>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <CodeVerificationMenuNewEmail
        newEmail={email as string}
        redirect={redirect as 'settings' | 'dashboard'}
        expirationTime={60}
      />
    </>
  );
};

(VerifyNewEmail as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout>
      { page }
    </AuthLayout>
  );
};

export default VerifyNewEmail;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['verify-email'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
