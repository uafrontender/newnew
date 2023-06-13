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
import { getMyOnboardingState } from '../api/endpoints/user';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import { setCreatorData } from '../redux-store/slices/userStateSlice';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import canBecomeCreator from '../utils/canBecomeCreator';
import { useGetAppConstants } from '../contexts/appConstantsContext';

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
  availableCountriesRes: newnewapi.IGetSupportedCreatorCountriesResponse;
}

const CreatorOnboarding: NextPage<ICreatorOnboarding> = ({
  availableCountriesRes,
}) => {
  const { t } = useTranslation('page-CreatorOnboarding');
  const { appConstants } = useGetAppConstants();

  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useLeavePageConfirm(
    canBecomeCreator(
      user.userData?.dateOfBirth,
      appConstants.minCreatorAgeYears
    ),
    t('detailsSection.leaveMsg'),
    ['/creator/dashboard', '/verify-new-email']
  );

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();

  // Redirect if onboarded or underaged
  useEffect(() => {
    if (user.userData?.options?.isCreator) {
      router.replace('/creator/dashboard');
    }

    if (
      !canBecomeCreator(
        user.userData?.dateOfBirth,
        appConstants.minCreatorAgeYears
      )
    ) {
      router.replace('/');
    }
  }, [
    user.userData?.options?.isCreator,
    user.userData?.dateOfBirth,
    appConstants.minCreatorAgeYears,
    router,
  ]);

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

export const getServerSideProps: GetServerSideProps<
  ICreatorOnboarding
> = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=35'
  );

  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-CreatorOnboarding'],
    null,
    SUPPORTED_LANGUAGES
  );

  if (!context?.req?.cookies?.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/sign-up?to=create',
      },
    };
  }

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
