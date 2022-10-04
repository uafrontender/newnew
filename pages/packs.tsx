/* eslint-disable no-nested-ternary */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { NextPageWithLayout } from './_app';

import HomeLayout from '../components/templates/HomeLayout';
import assets from '../constants/assets';
import GoBackButton from '../components/molecules/GoBackButton';

export const Packs = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Packs');

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
        <SubNavigation>
          <GoBackButton longArrow onClick={() => router.back()}>
            {t('button.back')}
          </GoBackButton>
        </SubNavigation>
        <Header>
          <STitle>{t('header.title')}</STitle>
          <SDescription>{t('header.description')}</SDescription>
        </Header>
        <SectionTitle>{t('packs.title')}</SectionTitle>
        <SectionTitle>{t('search.title')}</SectionTitle>
      </Container>
    </>
  );
};

(Packs as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Packs;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Packs',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 4px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 4px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 12px;
  }
`;

const SubNavigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 96px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 84px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 60%;
  }
`;

const STitle = styled.h1`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 72px;
  line-height: 86px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 56px;
    line-height: 64px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 72px;
    line-height: 86px;
  }
`;

const SDescription = styled.h2`
  font-weight: 500;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  font-size: 24px;
  line-height: 32px;
`;

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
  text-align: 'start';
  margin-bottom: 32px;
`;
