/* eslint-disable no-nested-ternary */
import React, { ReactElement } from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';
import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import D404 from '../public/images/404/404-Dark-Desktop.webp';
import T404 from '../public/images/404/404-Dark-Tablet.webp';
import M404 from '../public/images/404/404-Dark-Mobile.webp';
import LD404 from '../public/images/404/404-Light-Desktop.webp';
import LT404 from '../public/images/404/404-Light-Tablet.webp';
import LM404 from '../public/images/404/404-Light-Mobile.webp';
import Button from '../components/atoms/Button';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { useAppState } from '../contexts/appStateContext';

// No sense to memorize
const Custom404 = () => {
  const { t } = useTranslation('page-404');
  const theme = useTheme();
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Container>
        {theme.name === 'light' ? (
          <img
            src={isMobile ? LM404.src : isTablet ? LT404.src : LD404.src}
            alt='No content yet'
          />
        ) : (
          <img
            src={isMobile ? M404.src : isTablet ? T404.src : D404.src}
            alt='No content yet'
          />
        )}
        <SText>{t('errorText')}</SText>
        <Link href='/'>
          <Button>{t('buttonText')}</Button>
        </Link>
      </Container>
    </>
  );
};

(Custom404 as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Custom404;

export const getStaticProps: GetStaticProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-404'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 15px;
`;

const SText = styled.p`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 18px;
  line-height: 28px;
  text-align: center;
  font-weight: bold;
  padding: 40px 0 16px;

  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
  }

  ${(props) => props.theme.media.desktop} {
    padding: 18px 0 16px;
  }
`;
