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
import OnboardingSectionDetails from '../components/molecules/creator-onboarding/OnboardingSectionDetails';
import useLeavePageConfirm from '../utils/hooks/useLeavePageConfirm';
import { getSupportedCreatorCountries } from '../api/endpoints/payments';

const genericAvatarsMock = [
  'someurl',
  'anotherurl',
];

const countriesMock: Omit<newnewapi.Country, 'toJSON'>[] = [
  {
    code: 'US',
    name: 'United States',
  },
];

interface ICreatorOnboardingStage2 {
  genericAvatarsUrls: string[];
  availableCountriesRes: newnewapi.GetSupportedCreatorCountriesResponse;
}

const CreatorOnboardingStage2: NextPage<ICreatorOnboardingStage2> = ({
  genericAvatarsUrls,
  availableCountriesRes,
}) => {
  const { t } = useTranslation('creator-onboarding');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();

  useLeavePageConfirm(
    true,
    t('DetailsSection.leaveMsg'),
    [
      '/creator/dashboard',
      '/verify-new-email',
    ],
  );

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
        availableCountries={availableCountriesRes.countries as newnewapi.Country[]}
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

  try {
    const countriesPayload = new newnewapi.EmptyRequest({});

    const countriesRes = await getSupportedCreatorCountries(countriesPayload);

    if (!countriesRes.data) throw new Error('Countries API not working');

    return {
      props: {
        availableCountriesRes: countriesRes.data?.toJSON(),
        genericAvatarsUrls: genericAvatarsMock,
        ...translationContext,
      },
    };
  } catch (err) {
    console.error(err);

    const mockRes = new newnewapi.GetSupportedCreatorCountriesResponse({
      countries: countriesMock,
    });

    return {
      props: {
        availableCountriesRes: mockRes.toJSON(),
        genericAvatarsUrls: genericAvatarsMock,
        ...translationContext,
      },
    };
  }
};
