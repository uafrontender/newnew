/* eslint-disable camelcase */
import React, {
  ReactElement,
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';
import { newnewapi } from 'newnew-api';

import { NextPageWithLayout } from '../../_app';
import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';
import isBrowser from '../../../utils/isBrowser';
import assets from '../../../constants/assets';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { setMyEmail } from '../../../api/endpoints/user';
import { setUserData } from '../../../redux-store/slices/userStateSlice';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';

const EditEmailLoadingModal = dynamic(
  () => import('../../../components/molecules/settings/EditEmailLoadingModal')
);

interface IUdpateEmail {
  email_address: string;
  token: string;
}

const UdpateEmail: NextPage<IUdpateEmail> = ({ email_address, token }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { t: tVerifyEmail } = useTranslation('page-VerifyEmail');
  const { t } = useTranslation('page-Profile');
  const { syncedHistoryReplaceState } = useSynchronizedHistory();
  const { loggedIn, _persist } = useAppSelector((state) => state.user);

  const [emailAddress] = useState(email_address);
  const [tokenValue] = useState(token);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitted = useRef(false);

  useUpdateEffect(() => {
    if (!loggedIn && _persist?.rehydrated) {
      router.push('/');
    }
  }, [loggedIn, _persist?.rehydrated, router]);

  useEffect(() => {
    if (email_address) {
      syncedHistoryReplaceState(
        {},
        `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/update-email`
      );
    }
  }, [router.locale, email_address, syncedHistoryReplaceState]);

  useEffect(() => {
    if (router.isReady && !router.query.token) {
      router.replace('/profile/settings');
    }
  }, [router]);

  useEffect(() => {
    router.prefetch('/profile/settings');
  }, [router]);

  const handleSetMyEmail = useCallback(async () => {
    try {
      setIsLoading(true);

      const setMyEmailPayload = new newnewapi.SetMyEmailRequest({
        emailAddress: emailAddress as string,
        token: tokenValue as string,
      });

      const { data, error } = await setMyEmail(setMyEmailPayload);

      if (
        data?.status === newnewapi.ConfirmMyEmailResponse.Status.AUTH_FAILURE
      ) {
        setErrorMessage(tVerifyEmail('error.invalidCode'));
        throw new Error('Invalid code');
      }

      if (
        data?.status !== newnewapi.SetMyEmailResponse.Status.SUCCESS ||
        error
      ) {
        setErrorMessage(error?.message ?? 'Request failed');

        throw new Error(error?.message ?? 'Request failed');
      }

      dispatch(
        setUserData({
          email: data?.me?.email,
        })
      );
      router.replace(
        '/profile/settings?editEmail=true&step=3',
        '/profile/settings/edit-email'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [emailAddress, dispatch, tokenValue, tVerifyEmail, router]);

  useEffect(() => {
    if (tokenValue && emailAddress && !isSubmitted.current && !isLoading) {
      handleSetMyEmail();
    }
  }, [tokenValue, emailAddress, handleSetMyEmail, isSubmitted, isLoading]);

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
      <EditEmailLoadingModal
        show
        onClose={() => {
          router.replace('/profile/settings');
        }}
        errorMessage={errorMessage}
        isLoading={isLoading}
        text={tVerifyEmail('verifying')}
      />
    </div>
  );
};

export default UdpateEmail;

(UdpateEmail as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <MyProfileSettingsLayout>{page}</MyProfileSettingsLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-VerifyEmail', 'page-Profile'],
    null,
    SUPPORTED_LANGUAGES
  );

  const { email_address, token } = context.query;

  if (
    !email_address ||
    !token ||
    Array.isArray(email_address) ||
    Array.isArray(token)
  ) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

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
      email_address,
      token,
    },
  };
};
