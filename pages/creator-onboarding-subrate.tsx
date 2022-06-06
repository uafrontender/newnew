/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import { getMyOnboardingState } from '../api/endpoints/user';
import Lottie from '../components/atoms/Lottie';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import {
  getMySubscriptionProduct,
  getStandardSubscriptionProducts,
} from '../api/endpoints/subscription';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { setCreatorData } from '../redux-store/slices/userStateSlice';

const OnboardingSectionSubrate = dynamic(
  () =>
    import(
      '../components/molecules/creator-onboarding/OnboardingSectionSubrate'
    )
);

const CreatorOnboardingSubrate = () => {
  const { t } = useTranslation('creator-onboarding');

  const [standardProducts, setStandardProducts] = useState<
    newnewapi.ISubscriptionProduct[]
  >([]);
  const [featuredProductsIds, setFeaturedProductsIds] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] =
    useState<newnewapi.ISubscriptionProduct | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const getOnboardingStatePayload = new newnewapi.EmptyRequest({});
        const onboardingStateRes = await getMyOnboardingState(
          getOnboardingStatePayload
        );

        if (onboardingStateRes.data) {
          dispatch(
            setCreatorData({
              ...user.creatorData,
              ...onboardingStateRes.data,
            })
          );
        }

        const getStandardProductsPayload = new newnewapi.EmptyRequest({});
        const getStandardProductsRes = await getStandardSubscriptionProducts(
          getStandardProductsPayload
        );
        if (getStandardProductsRes.data) {
          setStandardProducts(getStandardProductsRes.data.products);
          setFeaturedProductsIds(
            getStandardProductsRes.data.featuredProductIds
          );
        }

        const getCurrentProductPayload = new newnewapi.EmptyRequest({});
        const getCurrentProductRes = await getMySubscriptionProduct(
          getCurrentProductPayload
        );
        if (getCurrentProductRes.data) {
          setCurrentProduct(getCurrentProductRes?.data?.myProduct ?? undefined);
        }

        setIsLoading(false);
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
      </Head>
      {!isLoading ? (
        <OnboardingSectionSubrate
          standardProducts={standardProducts}
          featuredProductsIds={featuredProductsIds}
          currentProduct={currentProduct}
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

(CreatorOnboardingSubrate as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <CreatorOnboardingLayout hideOnboardingHeader>
      {page}
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingSubrate;

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
