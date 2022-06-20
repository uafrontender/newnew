/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import loadingAnimation from '../../public/animations/logo-loading-blue.json';
import { getMyOnboardingState } from '../../api/endpoints/user';
import CreatorStripeLayout from '../../components/templates/CreatorStripeLayout';
import { NextPageWithLayout } from '../_app';
import Lottie from '../../components/atoms/Lottie';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCreatorData } from '../../redux-store/slices/userStateSlice';

const DashboardSectionStripe = dynamic(
  () => import('../../components/organisms/creator/DashboardSectionStripe')
);

const GetPaid = () => {
  const { t } = useTranslation('page-Creator');

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();
  const [isLoading, setIsLoading] = useState<null | boolean>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    async function fetchOnboardingState() {
      if (isLoading) return;
      try {
        setIsLoading(true);
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

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }
    fetchOnboardingState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t('getPaid.meta.title')}</title>
        <meta name='description' content={t('getPaid.meta.description')} />
        <meta property='og:title' content={t('getPaid.meta.title')} />
        <meta
          property='og:description'
          content={t('getPaid.meta.description')}
        />
      </Head>
      {isLoading === false ? (
        <DashboardSectionStripe
          isConnectedToStripe={
            onboardingState?.isCreatorConnectedToStripe ?? false
          }
          stripeConnectStatus={onboardingState?.stripeConnectStatus}
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

(GetPaid as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <CreatorStripeLayout hideProgressBar>{page}</CreatorStripeLayout>;
};

export default GetPaid;

export async function getStaticProps(context: {
  locale: string;
}): Promise<any> {
  const translationContext = await serverSideTranslations(context.locale, [
    'page-Creator',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
}
