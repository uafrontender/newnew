import React, { ReactElement, useContext, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSidePropsContext, NextPage } from 'next';
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
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { useAppState } from '../contexts/appStateContext';

interface IVerifyNewEmail {}

const VerifyNewEmail: NextPage<IVerifyNewEmail> = () => {
  const { t } = useTranslation('page-VerifyEmail');

  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { userLoggedIn, setUserLoggedIn, setUserIsCreator } = useAppState();

  const router = useRouter();
  const { email, retryAfter, redirect } = router.query;

  // Socket
  const { socketConnection } = useContext(SocketContext);

  // Redirect if the user is not logged in
  useEffect(() => {
    if (!userLoggedIn) {
      router.replace('/');
    }
  }, [userLoggedIn, router]);

  // Listen to Me update event
  useEffect(() => {
    const handlerSocketMeUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded) {
        return;
      }

      if (redirect === 'dashboard') {
        const becomeCreatorPayload = new newnewapi.EmptyRequest({});

        const becomeCreatorRes = await becomeCreator(becomeCreatorPayload);

        if (!becomeCreatorRes?.data || becomeCreatorRes.error) {
          throw new Error('Become creator failed');
        }

        // TODO: ideally we want it happen in syncUserWrapper as well
        dispatch(
          setUserData({
            options: {
              ...user.userData?.options,
              isActivityPrivate:
                becomeCreatorRes.data.me?.options?.isActivityPrivate,
              isCreator: becomeCreatorRes.data.me?.options?.isCreator,
              isVerified: becomeCreatorRes.data.me?.options?.isVerified,
              creatorStatus: becomeCreatorRes.data.me?.options?.creatorStatus,
            },
          })
        );

        setUserLoggedIn(true);
        setUserIsCreator(!!becomeCreatorRes.data.me?.options?.isCreator);
      }

      if (redirect === 'settings') {
        router.push('/profile/settings');
      } else {
        router.push('/creator/dashboard?askPushNotificationPermission=true');
      }
    };

    if (socketConnection) {
      socketConnection?.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  if (!email || !redirect) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <CodeVerificationMenuNewEmail
        newEmail={email as string}
        redirect={redirect as 'settings' | 'dashboard'}
        canResendIn={parseInt(retryAfter as string)}
        allowLeave={!userLoggedIn}
      />
    </>
  );
};

(VerifyNewEmail as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default VerifyNewEmail;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-VerifyEmail'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
