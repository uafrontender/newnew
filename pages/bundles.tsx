import React, { useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import { useAppSelector } from '../redux-store/store';
import { useBundles } from '../contexts/bundlesContext';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import useBuyBundleAfterStripeRedirect from '../utils/hooks/useBuyBundleAfterStripeRedirect';

const Bundles = dynamic(
  () => import('../components/organisms/bundles/Bundles')
);

interface IBundlesPage {
  stripeSetupIntentClientSecretFromRedirect?: string;
  saveCardFromRedirect?: boolean;
}

export const BundlesPage: NextPage<IBundlesPage> = ({
  stripeSetupIntentClientSecretFromRedirect,
  saveCardFromRedirect,
}) => {
  const router = useRouter();
  const { bundles } = useBundles();
  const { user } = useAppSelector((state) => state);
  useBuyBundleAfterStripeRedirect(
    stripeSetupIntentClientSecretFromRedirect,
    saveCardFromRedirect
  );

  useEffect(() => {
    if (
      (!user.loggedIn && user._persist?.rehydrated) ||
      (bundles?.length === 0 && !stripeSetupIntentClientSecretFromRedirect)
    ) {
      router.replace('/');
    }
  }, [
    stripeSetupIntentClientSecretFromRedirect,
    user.loggedIn,
    user._persist?.rehydrated,
    bundles,
    router,
  ]);

  return <Bundles />;
};

(BundlesPage as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default BundlesPage;

export const getServerSideProps: GetServerSideProps<IBundlesPage> = async (
  context
) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=35'
  );
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Bundles', 'modal-PaymentModal', 'page-Post'],
    null,
    SUPPORTED_LANGUAGES
  );

  // eslint-disable-next-line camelcase
  const { setup_intent_client_secret, save_card } = context.query;

  return {
    props: {
      ...translationContext,
      // setup intent on this page is always for bundles
      // eslint-disable-next-line camelcase, object-shorthand
      ...(setup_intent_client_secret &&
      !Array.isArray(setup_intent_client_secret)
        ? {
            stripeSetupIntentClientSecretFromRedirect:
              // eslint-disable-next-line camelcase
              setup_intent_client_secret,
          }
        : {}),
      // eslint-disable-next-line camelcase, object-shorthand
      ...(save_card && !Array.isArray(save_card)
        ? {
            // eslint-disable-next-line camelcase
            saveCardFromRedirect: save_card === 'true',
          }
        : {}),
    },
  };
};
