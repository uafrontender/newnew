/* eslint-disable no-lonely-if */
import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import General from '../../../components/templates/General';
import Content from '../../../components/organisms/creator/Subscriptions/Subscriptions';

import { NextPageWithLayout } from '../../_app';
import { useAppSelector } from '../../../redux-store/store';

export const Subscriptions = () => {
  const { t } = useTranslation('creator');
  const user = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user.creatorData?.isLoaded) {
      if (!user.creatorData?.options.isCreatorConnectedToStripe) {
        router.replace('/creator/get-paid');
      } else {
        if (!user.userData?.options?.isOfferingSubscription)
          router.replace('/creator/subscribers/edit-subscription-rate');
      }
    }
  }, [
    user.creatorData?.isLoaded,
    user.userData?.options?.isOfferingSubscription,
    router,
    user.creatorData?.options.isCreatorConnectedToStripe,
  ]);

  return (
    <>
      <Head>
        <title>{t('subscriptions.meta.title')}</title>
      </Head>
      {user.userData?.options?.isOfferingSubscription && <Content />}
    </>
  );
};

(Subscriptions as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral withChat>{page}</SGeneral>
);

export default Subscriptions;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'creator',
    'chat',
  ]);

  return {
    props: {
      ...translationContext,
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
