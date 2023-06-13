import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { buyCreatorsBundle } from '../../api/endpoints/bundles';
import { Mixpanel } from '../mixpanel';
import useErrorToasts from './useErrorToasts';
import { useAppState } from '../../contexts/appStateContext';

function useBuyBundleAfterStripeRedirect(
  stripeSetupIntentClientSecretFromRedirect?: string,
  saveCardFromRedirect?: boolean,
  onSuccess?: () => void
) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { userLoggedIn } = useAppState();
  const { showErrorToastCustom } = useErrorToasts();

  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);
  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  const buyBundleAfterStripeRedirect = useCallback(async () => {
    if (!stripeSetupIntentClientSecret) {
      return;
    }

    if (!userLoggedIn) {
      router.push(
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
      );
      return;
    }

    // TODO: Questionable event, probably unnecessary as it is a business data
    Mixpanel.track('Buy Bundle After Stripe Redirect');

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
        !res?.data ||
        res.error ||
        res.data.status !== newnewapi.BuyCreatorsBundleResponse.Status.SUCCESS
      ) {
        throw new Error(
          res?.error?.message ?? t('modal.buyBundle.error.requestFailed')
        );
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    } finally {
      // Clear stripeSecret from query to avoid same request on page reload
      // Removes all query parameters. Change in case you need any
      const path = router.asPath.split('?')[0];
      router.replace(path);
    }
  }, [
    stripeSetupIntentClientSecret,
    userLoggedIn,
    router,
    saveCard,
    t,
    onSuccess,
    showErrorToastCustom,
  ]);

  // A Delay allows to cancel first request when the second full re-render happens
  // TODO: use abortController instead?
  // Can be abandoned after we get rid of Redux which causes double rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      buyBundleAfterStripeRedirect();
    }, 100);
    return () => clearTimeout(timer);
  }, [buyBundleAfterStripeRedirect]);
}

export default useBuyBundleAfterStripeRedirect;
