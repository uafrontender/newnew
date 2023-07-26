import React, { ReactElement, useEffect, useState, useRef } from 'react';
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
import { useUserData } from '../../contexts/userDataContext';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import Loader from '../../components/atoms/Loader';
import { useAppState } from '../../contexts/appStateContext';

const DashboardSectionStripe = dynamic(
  () => import('../../components/organisms/creator/DashboardSectionStripe')
);

const GetPaid = () => {
  console.log('GETPAID');
  const router = useRouter();
  const { t } = useTranslation('page-Creator');
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoading = useRef(false);
  const { updateCreatorData } = useUserData();
  const { userIsCreator } = useAppState();

  useUpdateEffect(() => {
    if (!userIsCreator) {
      console.log('REDIRECT');
      router.replace('/');
    }
  }, [userIsCreator]);

  useEffect(() => {
    if (isLoaded || isLoading.current) {
      return;
    }

    async function fetchOnboardingState() {
      try {
        isLoading.current = true;
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);
        if (res.data) {
          updateCreatorData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        isLoading.current = false;
        setIsLoaded(true);
      }
    }

    fetchOnboardingState();
  }, [isLoaded, updateCreatorData]);

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
      {isLoaded ? <DashboardSectionStripe /> : <SLoader size='md' />}
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
