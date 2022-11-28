import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import General from '../../components/templates/General';
import Content from '../../components/organisms/creator/Bundles';

import { NextPageWithLayout } from '../_app';
import assets from '../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

export const Bundles = () => {
  const { t } = useTranslation('page-Creator');

  return (
    <>
      <Head>
        <title>{t('myBundles.meta.title')}</title>
        <meta name='description' content={t('myBundles.meta.description')} />
        <meta property='og:title' content={t('myBundles.meta.title')} />
        <meta
          property='og:description'
          content={t('myBundles.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Content />
    </>
  );
};

(Bundles as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral withChat>{page}</SGeneral>
);

export default Bundles;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Creator'],
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
