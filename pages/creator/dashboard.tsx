import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import General from '../../components/templates/General';
import DashboardContent from '../../components/organisms/creator/Dashboard';

import { NextPageWithLayout } from '../_app';

export const Dashboard = () => {
  const { t } = useTranslation('creator');

  return (
    <>
      <Head>
        <title>
          {t('dashboard.meta.title')}
        </title>
      </Head>
      <DashboardContent />
    </>
  );
};

(Dashboard as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral withChat>
    {page}
  </SGeneral>
);

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'creator'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
};

const SGeneral = styled(General)`
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.secondary : props.theme.colorsThemed.background.primary)};
`;
