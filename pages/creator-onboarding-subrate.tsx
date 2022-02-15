/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAppSelector } from '../redux-store/store';

import { NextPageWithLayout } from './_app';
import CreatorOnboardingLayout from '../components/templates/CreatorOnboardingLayout';
import { getMyOnboardingState } from '../api/endpoints/user';
import Lottie from '../components/atoms/Lottie';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import OnboardingSectionSubrate from '../components/molecules/creator-onboarding/OnboardingSectionSubrate';


// Testing!
export type TSubProduct = {
  id: string;
  monthlyRate: newnewapi.IMoneyAmount;
}

const mockProducts: TSubProduct[] = [
  {
    id: '1',
    monthlyRate: {
      usdCents: 200,
    }
  },
  {
    id: '2',
    monthlyRate: {
      usdCents: 500,
    }
  },
  {
    id: '3',
    monthlyRate: {
      usdCents: 1000,
    }
  },
  {
    id: '4',
    monthlyRate: {
      usdCents: 2000,
    }
  },
  {
    id: '5',
    monthlyRate: {
      usdCents: 3000,
    }
  },
  {
    id: '6',
    monthlyRate: {
      usdCents: 4000,
    }
  },
  {
    id: '7',
    monthlyRate: {
      usdCents: 5000,
    }
  },
  {
    id: '8',
    monthlyRate: {
      usdCents: 12000,
    }
  },
];

interface ICreatorOnboardingSubrate {}

const CreatorOnboardingSubrate: NextPage<ICreatorOnboardingSubrate> = () => {
  const { t } = useTranslation('creator-onboarding');

  const [onboardingState, setOnboardingState] = useState<newnewapi.GetMyOnboardingStateResponse>();
  const [standardProducts, setStandardProducts] = useState<TSubProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<TSubProduct | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const getOnboardingStatePayload = new newnewapi.EmptyRequest({});
        const onboardingStateRes = await getMyOnboardingState(getOnboardingStatePayload);

        if (onboardingStateRes.data) {
          setOnboardingState(onboardingStateRes.data);
        }

        const getStandardProductsPayload = new newnewapi.EmptyRequest({});
        // const getStandardProductsRes = await getStandardSubscriptionProducts(getStandardProductsPayload);
        // if (getStandardProductsRes.data) {
        //   setStandardProducts(getStandardProductsRes.data);
        // }
        setStandardProducts(mockProducts);

        const getCurrentProductPayload = new newnewapi.EmptyRequest({});
        // const getCurrentProductRes = await getMySubscriptionProduct(getCurrentProductPayload);
        // if (getCurrentProductRes.data) {
          // setCurrentProduct(getCurrentProductRes.data);
        // }

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
        <title>{ t('meta.title') }</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      {!isLoading ? (
        <OnboardingSectionSubrate
          onboardingState={onboardingState!!}
          standardProducts={standardProducts}
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

(CreatorOnboardingSubrate as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <CreatorOnboardingLayout
      hideProgressBar
    >
      { page }
    </CreatorOnboardingLayout>
  );
};

export default CreatorOnboardingSubrate;

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
