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
import OnboardingSectionDetails from '../components/molecules/creator-onboarding/OnboardingSectionDetails';

export type CountryOption = {
  value: string;
  en: string;
}

const countriesMock: CountryOption[] = [
  {
    value: 'US',
    en: 'United States',
  },
  {
    value: 'Canada',
    en: 'Canada',
  },
];

const genericAvatarsMock = [
  'someurl',
  'anotherurl',
];

interface ICreatorOnboardingStage2 {
  genericAvatarsUrls: string[];
  availableCountries: any[];
}

const CreatorOnboardingStage2: NextPage<ICreatorOnboardingStage2> = ({
  genericAvatarsUrls,
  availableCountries,
}) => {
  const { t } = useTranslation('creator-onboarding');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  // TODO: a call to the API to mark user as agreed to ToS with corresponding timestamp
  const goToNext = () => {
    router.push('/creator/dashboard');
  };

  return (
    <>
      <Head>
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <OnboardingSectionDetails
        genericAvatarsUrls={genericAvatarsUrls}
        availableCountries={availableCountries}
        goToDashboard={goToNext}
      />
    </>
  );
};

(CreatorOnboardingStage2 as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <CreatorOnboardingLayout>
      { page }
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingStage2;

export const getServerSideProps:GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['creator-onboarding', 'profile'],
  );

  return {
    props: {
      availableCountries: countriesMock,
      genericAvatarsUrls: genericAvatarsMock,
      ...translationContext,
    },
  };
};
