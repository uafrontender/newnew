import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useAppSelector } from '../redux-store/store';
import General from '../components/templates/General';
import SearchResults from '../components/organisms/search/SearchResults';

import { NextPageWithLayout } from './_app';

export const Search = () => {
  const { t } = useTranslation('search');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  if (!user.loggedIn && !user.userData?.options?.isCreator) {
    router.push('/');
    return null;
  }
  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <SearchResults />
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: ReactElement) => <SGeneral>{page}</SGeneral>;

export default Search;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, ['common', 'search']);

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
