import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useEffectOnce } from 'react-use';
import dynamic from 'next/dynamic';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import { useAppSelector } from '../redux-store/store';
import { useBundles } from '../contexts/bundlesContext';
import { Mixpanel } from '../utils/mixpanel';
import { buyCreatorsBundle } from '../api/endpoints/bundles';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import { SUPPORTED_LANGUAGES } from '../constants/general';

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
  const { t } = useTranslation('page-Bundles');
  const { user } = useAppSelector((state) => state);
  const { showErrorToastCustom } = useErrorToasts();
  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);
  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  const { bundles } = useBundles();

  const buyBundleAfterStripeRedirect = useCallback(async () => {
    if (!stripeSetupIntentClientSecret) {
      return;
    }

    if (!user._persist?.rehydrated) {
      return;
    }

    if (!user.loggedIn) {
      router.push(
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
      );
      return;
    }

    Mixpanel.track('BuyBundleAfterStripeRedirect');

    try {
      const stripeContributionRequest = new newnewapi.StripeContributionRequest(
        {
          stripeSetupIntentClientSecret,
          saveCard,
        }
      );

      // Reset
      setStripeSetupIntentClientSecret(undefined);
      setSaveCard(undefined);

      const res = await buyCreatorsBundle(stripeContributionRequest);

      if (
        !res.data ||
        res.error ||
        res.data.status !== newnewapi.BuyCreatorsBundleResponse.Status.SUCCESS
      ) {
        throw new Error(res.error?.message ?? t('error.requestFailed'));
      }
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    } finally {
      router.replace('/bundles');
    }
  }, [
    stripeSetupIntentClientSecret,
    user._persist?.rehydrated,
    user.loggedIn,
    router,
    saveCard,
    t,
    showErrorToastCustom,
  ]);

  useEffectOnce(() => {
    if (stripeSetupIntentClientSecret) {
      buyBundleAfterStripeRedirect();
    }
  });

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
    buyBundleAfterStripeRedirect,
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
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Bundles', 'modal-PaymentModal'],
    null,
    SUPPORTED_LANGUAGES
  );

  // eslint-disable-next-line camelcase
  const { setup_intent_client_secret, save_card } = context.query;

  return {
    props: {
      ...translationContext,
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
