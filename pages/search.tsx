import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import General from '../components/templates/General';
import SearchResults from '../components/organisms/search/SearchResults';

import { NextPageWithLayout } from './_app';

export const Search = () => {
  const { t } = useTranslation('page-Search');

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <SearchResults />
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral>{page}</SGeneral>
);

export default Search;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Search',
    'component-PostCard',
    'page-SeeMore',
    'modal-PaymentModal',
    'modal-Post',
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
