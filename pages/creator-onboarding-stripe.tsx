import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { GetServerSidePropsContext } from 'next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import { getMyOnboardingState } from '../api/endpoints/user';
import Lottie from '../components/atoms/Lottie';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import { useUserData } from '../contexts/userDataContext';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';

const OnboardingSectionStripe = dynamic(
  () =>
    import('../components/molecules/creator-onboarding/OnboardingSectionStripe')
);

const CreatorOnboardingStripe = () => {
  const { t } = useTranslation('page-CreatorOnboarding');

  const loading = useRef(false);
  const [isLoading, setIsLoading] = useState<null | boolean>(null);
  const { updateCreatorData } = useUserData();

  useEffect(
    () => {
      async function fetchOnboardingState() {
        if (loading.current) {
          return;
        }

        loading.current = true;

        try {
          const payload = new newnewapi.EmptyRequest({});
          const res = await getMyOnboardingState(payload);
          if (res.data) {
            updateCreatorData(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
          loading.current = false;
        }
      }
      fetchOnboardingState();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // updateCreatorData, - reason unknown
    ]
  );

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {!isLoading ? (
        <OnboardingSectionStripe />
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

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
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
}
