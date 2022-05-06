/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { NextPage } from 'next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import { getMyOnboardingState } from '../api/endpoints/user';
import Lottie from '../components/atoms/Lottie';
import loadingAnimation from '../public/animations/logo-loading-blue.json';

const OnboardingSectionStripe = dynamic(
  () =>
    import('../components/molecules/creator-onboarding/OnboardingSectionStripe')
);

interface ICreatorOnboardingStripe {}

const CreatorOnboardingStripe: NextPage<ICreatorOnboardingStripe> = () => {
  const { t } = useTranslation('creator-onboarding');

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    }

    fetchOnboardingState();
  }, []);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
      </Head>
      {!isLoading ? (
        <OnboardingSectionStripe
          isConnectedToStripe={
            onboardingState?.isCreatorConnectedToStripe ?? false
          }
        />
      ) : (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      )}
    </>
  );
};

(CreatorOnboardingStripe as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <CreatorOnboardingLayout hideOnboardingHeader>
      {page}
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingStripe;

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
