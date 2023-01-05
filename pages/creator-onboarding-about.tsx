/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import dynamic from 'next/dynamic';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';

const OnboardingSectionAbout = dynamic(
  () =>
    import('../components/molecules/creator-onboarding/OnboardingSectionAbout')
);

interface ICreatorOnboardingAbout {}

const CreatorOnboardingAbout: NextPage<ICreatorOnboardingAbout> = () => {
  const { t } = useTranslation('page-CreatorOnboarding');

  return (
    <>
      <Head>
        <title>{t('aboutSection.meta.title')}</title>
        <meta name='description' content={t('aboutSection.meta.description')} />
        <meta property='og:title' content={t('aboutSection.meta.title')} />
        <meta
          property='og:description'
          content={t('aboutSection.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <OnboardingSectionAbout />
    </>
  );
};

(CreatorOnboardingAbout as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <CreatorOnboardingLayout hideOnboardingHeader>
      {page}
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingAbout;

export const getServerSideProps: GetServerSideProps<
  ICreatorOnboardingAbout
> = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-CreatorOnboarding'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};
