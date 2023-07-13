import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useErrorToasts from './useErrorToasts';
import { useAppState } from '../../contexts/appStateContext';
import { placeBidOnAuction } from '../../api/endpoints/auction';
import { voteOnPost } from '../../api/endpoints/multiple_choice';

const getPayWithCardErrorMessage = (
  status?:
    | newnewapi.PlaceBidResponse.Status
    | newnewapi.VoteOnPostResponse.Status
) => {
  switch (status) {
    case newnewapi.PlaceBidResponse.Status.NOT_ENOUGH_MONEY:
    case newnewapi.VoteOnPostResponse.Status.NOT_ENOUGH_FUNDS:
      return 'errors.notEnoughMoney';
    case newnewapi.PlaceBidResponse.Status.CARD_NOT_FOUND:
    case newnewapi.VoteOnPostResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.PlaceBidResponse.Status.CARD_CANNOT_BE_USED:
    case newnewapi.VoteOnPostResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.PlaceBidResponse.Status.BIDDING_NOT_STARTED:
      return 'errors.biddingNotStarted';
    case newnewapi.VoteOnPostResponse.Status.MC_CANCELLED:
      return 'errors.mcCancelled';
    case newnewapi.PlaceBidResponse.Status.BIDDING_ENDED:
      return 'errors.biddingIsEnded';
    case newnewapi.VoteOnPostResponse.Status.MC_FINISHED:
      return 'errors.mcFinished';
    case newnewapi.PlaceBidResponse.Status.OPTION_NOT_UNIQUE:
      return 'errors.optionNotUnique';
    case newnewapi.VoteOnPostResponse.Status.ALREADY_VOTED:
      return 'errors.alreadyVoted';
    case newnewapi.VoteOnPostResponse.Status.MC_VOTE_COUNT_TOO_SMALL:
      return 'errors.mcVoteCountTooSmall';
    case newnewapi.VoteOnPostResponse.Status.NOT_ALLOWED_TO_CREATE_NEW_OPTION:
      return 'errors.notAllowedToCreateNewOption';
    default:
      return 'errors.requestFailed';
  }
};

function getContributionRequest(type: 'bid' | 'vote') {
  if (type === 'bid') {
    return placeBidOnAuction;
  }

  if (type === 'vote') {
    return voteOnPost;
  }

  throw new Error(`unknown type ${type} at getContributionRequest`);
}

function useMakeContributionAfterStripeRedirect(
  type: 'bid' | 'vote',
  stripeSetupIntentClientSecretFromRedirect?: string,
  saveCardFromRedirect?: boolean,
  onSuccess?:
    | ((option: newnewapi.Auction.IOption) => void)
    | ((option: newnewapi.MultipleChoice.IOption) => void),
  onLoadingChanged?: (loading: boolean) => void
) {
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const { userLoggedIn } = useAppState();
  const { showErrorToastCustom } = useErrorToasts();

  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);
  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  const makeBidAfterStripeRedirect = useCallback(
    async (setupIntentClientSecret: string) => {
      if (!setupIntentClientSecret) {
        return;
      }

      if (!userLoggedIn) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${setupIntentClientSecret}`
        );
        return;
      }

      try {
        onLoadingChanged?.(true);

        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            stripeSetupIntentClientSecret: setupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        // Reset
        setStripeSetupIntentClientSecret(undefined);
        setSaveCard(undefined);

        const contributionRequest = getContributionRequest(type);
        const res = await contributionRequest(stripeContributionRequest);

        if (
          !res?.data ||
          res.error ||
          (res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS &&
            res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS) ||
          !res.data.option
        ) {
          throw new Error(
            res?.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        onSuccess?.(res.data.option);
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);
      } finally {
        onLoadingChanged?.(false);
        // Clear stripeSecret from query to avoid same request on page reload
        // Removes all query parameters. Change in case you need any
        const path = router.asPath.split('?')[0];
        router.replace(path, undefined, { shallow: true });
      }
    },
    [
      type,
      userLoggedIn,
      router,
      saveCard,
      onLoadingChanged,
      onSuccess,
      showErrorToastCustom,
      t,
    ]
  );

  useEffect(() => {
    if (!stripeSetupIntentClientSecret) {
      return;
    }

    makeBidAfterStripeRedirect(stripeSetupIntentClientSecret);
  }, [stripeSetupIntentClientSecret, makeBidAfterStripeRedirect]);
}

export default useMakeContributionAfterStripeRedirect;
