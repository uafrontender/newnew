import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import General from '../components/templates/General';
import SearchResults from '../components/organisms/search/SearchResults';

import { NextPageWithLayout } from './_app';
import { SUPPORTED_LANGUAGES } from '../constants/general';

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
  // TODO: implement granular cache-control (likely in newer version of Next.js)
  // context.res.setHeader(
  //   'Cache-Control',
  //   'public, s-maxage=50, stale-while-revalidate=60'
  // );

  const translationContext = await serverSideTranslations(
    context.locale!!,
    [
      'common',
      'page-Search',
      'page-Profile',
      'component-PostCard',
      'page-SeeMore',
      'modal-PaymentModal',
      'page-Post',
      'modal-ResponseSuccessModal',
    ],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};

const SGeneral = styled(General)``;
