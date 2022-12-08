/* eslint-disable camelcase */
import React, { ReactElement, useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';

import General from '../../../components/templates/General';
import Content from '../../../components/organisms/Chat';

import { NextPageWithLayout } from '../../_app';
import { useAppSelector } from '../../../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';

interface IChat {
  username: string;
  setup_intent_client_secret?: string;
  save_card?: boolean;
}

const Chat: NextPage<IChat> = ({
  username,
  setup_intent_client_secret,
  save_card,
}) => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [user.loggedIn, user._persist?.rehydrated, router]);

  const [
    setupIntentClientSecretFromRedirect,
    setSetupIntentClientSecretFromRedirect,
  ] = useState(setup_intent_client_secret);

  const [saveCardFromRedirect, setCardFromRedirect] = useState(save_card);

  const resetStripeSetupIntent = useCallback(() => {
    setSetupIntentClientSecretFromRedirect('');
    setCardFromRedirect(false);
  }, []);

  const { syncedHistoryReplaceState } = useSynchronizedHistory();

  useEffect(() => {
    if (setup_intent_client_secret || save_card) {
      syncedHistoryReplaceState(
        {},
        `${
          router.locale !== 'en-US' ? `/${router.locale}` : ''
        }/direct-messages/${username}`
      );
    }
  }, [
    router.locale,
    setup_intent_client_secret,
    save_card,
    syncedHistoryReplaceState,
    username,
  ]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <Content
        username={username}
        setupIntentClientSecretFromRedirect={
          setupIntentClientSecretFromRedirect
        }
        saveCardFromRedirect={saveCardFromRedirect}
        resetStripeSetupIntent={resetStripeSetupIntent}
      />
    </>
  );
};

export default Chat;

(Chat as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral>{page}</SGeneral>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username, setup_intent_client_secret, save_card } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Chat', 'modal-PaymentModal', 'page-SubscribeToUser'],
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
      username,
      ...translationContext,
      ...(setup_intent_client_secret
        ? {
            setup_intent_client_secret,
          }
        : {}),
      ...(save_card
        ? {
            save_card: save_card === 'true',
          }
        : {}),
    },
  };
};

const SGeneral = styled(General)`
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.secondary
      : props.theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.laptop} {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.primary};
  }
`;
