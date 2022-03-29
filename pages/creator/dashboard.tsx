import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import General from '../../components/templates/General';
import Content from '../../components/organisms/creator/Dashboard';

import { NextPageWithLayout } from '../_app';
import { useAppSelector } from '../../redux-store/store';

export const Dashboard = () => {
  const { t } = useTranslation('creator');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  if (!user.loggedIn) {
    router.push('/sign-up');
    return null;
  }
  return (
    <>
      <Head>
        <title>{t('dashboard.meta.title')}</title>
      </Head>
      <Content />
    </>
  );
};

(Dashboard as NextPageWithLayout).getLayout = (page: ReactElement) => <SGeneral withChat>{page}</SGeneral>;

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, ['common', 'creator', 'chat']);

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
      props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.primary};
  }
`;
