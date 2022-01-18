/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';

interface ICreatorOnboardingStage1 {

}

const CreatorOnboardingStage1: NextPage<ICreatorOnboardingStage1> = () => {
  const { t } = useTranslation('creator-onboarding');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <div>
        hey
      </div>
    </>
  );
};

(CreatorOnboardingStage1 as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <CreatorOnboardingLayout>
      { page }
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingStage1;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['creator-onboarding'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
