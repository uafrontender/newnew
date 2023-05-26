import { useState, useEffect, useCallback, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import {
  createStripeSetupIntent,
  updateStripeSetupIntent,
} from '../../api/endpoints/payments';
import {
  getUpdateStripeSetupIntentErrorStatusTextKey,
  getCreateStripeSetupIntentErrorStatusTextKey,
} from '../getStripeSetupIntentErrorStatusTextKey';

// eslint-disable-next-line no-shadow
export enum StripeSetupIntentPurposeTypes {
  saveCard = 'saveCardRequest',
  placeBid = 'acBidRequest',
  voteOnPost = 'mcVoteRequest',
  doPledge = 'cfPledgeRequest',
  buyBundle = 'buyCreatorsBundle',
  subscribe = 'subscribeToCreatorUuid',
}

// IDEA: can use stricter types (union type from a set of types)
interface ISetupIntentData {
  setupIntentClientSecret?: string | null;
  purposeType?: StripeSetupIntentPurposeTypes;
  purpose?:
    | newnewapi.SaveCardRequest
    | newnewapi.PlaceBidRequest
    | newnewapi.VoteOnPostRequest
    | newnewapi.DoPledgeRequest
    | string;

  isGuest?: boolean;
  successUrl?: string;
}

interface ISetupIntentProps {
  email?: string;
  saveCard?: boolean;
}

export interface ISetupIntent extends ISetupIntentData {
  update: (props: ISetupIntentProps) => Promise<{ errorKey?: string }>;
  init: () => Promise<{ errorKey?: string }>;
  destroy: () => void;
}

function getStripeSetupIntentPurposeType(
  purpose:
    | newnewapi.SaveCardRequest
    | newnewapi.PlaceBidRequest
    | newnewapi.VoteOnPostRequest
    | newnewapi.DoPledgeRequest
    | newnewapi.BuyCreatorsBundle
    | string
): StripeSetupIntentPurposeTypes {
  let purposeType;

  if (purpose instanceof newnewapi.SaveCardRequest) {
    purposeType = StripeSetupIntentPurposeTypes.saveCard;
  } else if (purpose instanceof newnewapi.PlaceBidRequest) {
    purposeType = StripeSetupIntentPurposeTypes.placeBid;
  } else if (purpose instanceof newnewapi.VoteOnPostRequest) {
    purposeType = StripeSetupIntentPurposeTypes.voteOnPost;
  } else if (purpose instanceof newnewapi.DoPledgeRequest) {
    purposeType = StripeSetupIntentPurposeTypes.doPledge;
  } else if (purpose instanceof newnewapi.BuyCreatorsBundle) {
    purposeType = StripeSetupIntentPurposeTypes.buyBundle;
  } else if (typeof purpose === 'string') {
    purposeType = StripeSetupIntentPurposeTypes.subscribe;
  } else {
    throw new Error('Unknown stripe setup intent purpose type');
  }

  return purposeType;
}

const useStripeSetupIntent = ({
  purpose,
  isGuest,
  successUrl,
}: {
  purpose:
    | newnewapi.SaveCardRequest
    | newnewapi.PlaceBidRequest
    | newnewapi.VoteOnPostRequest
    | newnewapi.DoPledgeRequest
    | newnewapi.BuyCreatorsBundle
    | string
    | null;
  isGuest?: boolean;
  successUrl?: string;
}) => {
  const [setupIntent, setSetupIntent] = useState<ISetupIntentData | null>(
    () => {
      if (!purpose) {
        return null;
      }

      const purposeType = getStripeSetupIntentPurposeType(purpose);

      return {
        purpose,
        isGuest,
        successUrl,
        purposeType,
        setupIntentClientSecret: null,
      };
    }
  );
  const [isSetupIntentInitializing, setSetupIntentInitializing] =
    useState(false);

  useEffect(() => {
    if (purpose) {
      const purposeType = getStripeSetupIntentPurposeType(purpose);

      setSetupIntent({
        purpose,
        isGuest,
        successUrl,
        purposeType,
        setupIntentClientSecret: null,
      });
    }
  }, [purpose, isGuest, successUrl]);

  const init = useCallback(async () => {
    try {
      if (!setupIntent || isSetupIntentInitializing) {
        return {};
      }

      setSetupIntentInitializing(true);

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        [setupIntent.purposeType!]: setupIntent.purpose,
        ...(setupIntent.isGuest
          ? { guestEmail: '', successUrl: setupIntent.successUrl }
          : {}),
      });

      const response = await createStripeSetupIntent(payload);

      if (!response?.data || response.error) {
        throw new Error(response?.error?.message ?? 'Request failed');
      }

      if (!response.data.stripeSetupIntentClientSecret) {
        return {
          errorKey: getCreateStripeSetupIntentErrorStatusTextKey(
            response.data.status
          ),
        };
      }

      setSetupIntent((prevState) => ({
        ...(prevState || {}),
        setupIntentClientSecret: response?.data?.stripeSetupIntentClientSecret!,
      }));

      setSetupIntentInitializing(false);

      return {};
    } catch (err: any) {
      console.error(err);
      setSetupIntentInitializing(false);
      return { errorKey: 'errors.requestFailed' };
    }
  }, [setupIntent, isSetupIntentInitializing]);

  const update = useCallback(
    async ({
      email,
      saveCard,
    }: ISetupIntentProps): Promise<{ errorKey?: string }> => {
      try {
        if (!setupIntent?.setupIntentClientSecret) {
          throw new Error('Missing setup intent client secret');
        }

        const updateStripeSetupIntentRequest =
          new newnewapi.UpdateStripeSetupIntentRequest({
            stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
            ...(email ? { guestEmail: email } : {}),
            ...(saveCard ? { saveCard: saveCard || false } : {}),
          });

        const response = await updateStripeSetupIntent(
          updateStripeSetupIntentRequest
        );

        if (!response?.data || response.error) {
          throw new Error(response?.error?.message ?? 'Request failed');
        }

        if (
          response.data.status !==
          newnewapi.UpdateStripeSetupIntentResponse.Status.SUCCESS
        ) {
          return {
            errorKey: getUpdateStripeSetupIntentErrorStatusTextKey(
              response.data.status
            ),
          };
        }

        return {};
      } catch (err) {
        console.error(err);
        return { errorKey: 'errors.requestFailed' };
      }
    },
    [setupIntent]
  );

  const destroy = useCallback(() => {
    setSetupIntent((prevState) => ({
      ...prevState,
      setupIntentClientSecret: null,
    }));
  }, []);

  const setupIntentData: ISetupIntent = useMemo(
    () => ({
      ...setupIntent,
      init,
      update,
      destroy,
    }),
    [setupIntent, init, update, destroy]
  );

  return setupIntentData;
};

export default useStripeSetupIntent;
