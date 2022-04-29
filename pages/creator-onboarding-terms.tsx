/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import { newnewapi } from 'newnew-api';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import OnboardingSectionTos from '../components/molecules/creator-onboarding/OnboardingSectionTos';
import { acceptCreatorTerms } from '../api/endpoints/user';

interface ICreatorOnboardingTerms {}

const CreatorOnboardingTerms: NextPage<ICreatorOnboardingTerms> = () => {
  const { t } = useTranslation('creator-onboarding');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  // TODO: a call to the API to mark user as agreed to ToS with corresponding timestamp
  // TODO: go back.
  const goToNext = async () => {
    try {
      const acceptTermsPayload = new newnewapi.EmptyRequest({});

      const res = await acceptCreatorTerms(acceptTermsPayload);

      if (res.error) throw new Error('Request failed');

      router.push('/creator-onboarding');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
      </Head>
      <OnboardingSectionTos handleGoToNext={goToNext} />
    </>
  );
};

(CreatorOnboardingTerms as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <CreatorOnboardingLayout>{page}</CreatorOnboardingLayout>;
};

export default CreatorOnboardingTerms;

export async function getStaticProps(context: {
  locale: string;
}): Promise<any> {
  const translationContext = await serverSideTranslations(context.locale, [
    'creator-onboarding',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
}
