/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import useLeavePageConfirm from '../utils/hooks/useLeavePageConfirm';
import { getSupportedCreatorCountries } from '../api/endpoints/payments';
import {
  acceptCreatorTerms,
  getMyOnboardingState,
} from '../api/endpoints/user';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import { setCreatorData } from '../redux-store/slices/userStateSlice';
import assets from '../constants/assets';

const OnboardingSectionDetails = dynamic(
  () =>
    import(
      '../components/molecules/creator-onboarding/OnboardingSectionDetails'
    )
);

const Lottie = dynamic(() => import('../components/atoms/Lottie'));

const countriesMock: Omit<newnewapi.Country, 'toJSON'>[] = [
  {
    code: 'US',
    name: 'United States',
  },
];

interface ICreatorOnboarding {
  availableCountriesRes: newnewapi.GetSupportedCreatorCountriesResponse;
}

const CreatorOnboarding: NextPage<ICreatorOnboarding> = ({
  availableCountriesRes,
}) => {
  const { t } = useTranslation('creator-onboarding');

  const { loggedIn } = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useLeavePageConfirm(true, t('DetailsSection.leaveMsg'), [
    '/creator/dashboard',
    '/verify-new-email',
  ]);

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();

  // Redirect if onboarded
  useEffect(() => {
    if (user.userData?.options?.isCreator) {
      router.push('/creator/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/creator/dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
          dispatch(
            setCreatorData({
              options: {
                ...user.creatorData?.options,
                ...res.data,
              },
            })
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchOnboardingState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {onboardingState ? (
        <OnboardingSectionDetails
          isAvatarCustom={onboardingState?.isCustomAvatar ?? false}
          availableCountries={
            availableCountriesRes.countries as newnewapi.Country[]
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

(CreatorOnboarding as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <CreatorOnboardingLayout>{page}</CreatorOnboardingLayout>;
};

export default CreatorOnboarding;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'creator-onboarding',
  ]);

  try {
    const countriesPayload = new newnewapi.EmptyRequest({});

    const countriesRes = await getSupportedCreatorCountries(countriesPayload);

    if (!countriesRes.data) throw new Error('Countries API not working');

    return {
      props: {
        availableCountriesRes: countriesRes.data?.toJSON(),
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
        ...translationContext,
      },
    };
  }
};
