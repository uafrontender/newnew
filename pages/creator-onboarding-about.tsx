/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import { getSupportedCreatorCountries } from '../api/endpoints/payments';
import {
  getAvailableCreatorTags,
  getMyCreatorTags,
  getMyOnboardingState,
} from '../api/endpoints/user';
import Lottie from '../components/atoms/Lottie';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import OnboardingSectionAbout from '../components/molecules/creator-onboarding/OnboardingSectionAbout';

interface ICreatorOnboardingAbout {
  availableTags: newnewapi.CreatorTags;
}

const CreatorOnboardingAbout: NextPage<ICreatorOnboardingAbout> = ({
  availableTags,
}) => {
  const { t } = useTranslation('creator-onboarding');

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();
  const [currentTags, setCurrentTags] = useState<newnewapi.ICreatorTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
        }

        const myTagsPayload = new newnewapi.EmptyRequest({});
        const tagsRes = await getMyCreatorTags(myTagsPayload);

        if (tagsRes.data) {
          setCurrentTags(tagsRes.data.tags);
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
        <meta name="description" content={t('meta.description')} />
      </Head>
      {!isLoading ? (
        <OnboardingSectionAbout
          availableTags={availableTags.tags}
          currentTags={currentTags}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'creator-onboarding',
    'profile',
  ]);

  try {
    const tagsPayload = new newnewapi.EmptyRequest({});

    const tagsResponse = await getAvailableCreatorTags(tagsPayload);

    if (!tagsResponse.data) throw new Error('Countries API not working');

    return {
      props: {
        availableTags: tagsResponse.data.toJSON(),
        ...translationContext,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
