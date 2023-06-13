import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import { useUpdateEffect } from 'react-use';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getMyOnboardingState } from '../../api/endpoints/user';
import CreatorStripeLayout from '../../components/templates/CreatorStripeLayout';
import { NextPageWithLayout } from '../_app';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCreatorData } from '../../redux-store/slices/userStateSlice';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import Loader from '../../components/atoms/Loader';

const DashboardSectionStripe = dynamic(
  () => import('../../components/organisms/creator/DashboardSectionStripe')
);

const GetPaid = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Creator');
  const [isLoading, setIsLoading] = useState<null | boolean>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useUpdateEffect(() => {
    if (!user?.userData?.options?.isCreator) {
      router.replace('/');
    }
  }, [user?.userData?.options?.isCreator]);

  useEffect(() => {
    async function fetchOnboardingState() {
      if (isLoading) return;
      try {
        setIsLoading(true);
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);
        if (res.data) {
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
      {isLoading === false ? <DashboardSectionStripe /> : <SLoader size='md' />}
    </>
  );
};

(GetPaid as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <CreatorStripeLayout hideProgressBar>{page}</CreatorStripeLayout>;
};

export default GetPaid;

const SLoader = styled(Loader)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Creator', 'page-Chat'],
    null,
    SUPPORTED_LANGUAGES
  );

  const { req } = context;

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
};
