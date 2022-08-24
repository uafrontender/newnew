import { newnewapi } from 'newnew-api';
import { voteOnPost } from '../api/endpoints/multiple_choice';
import {
  createStripeSetupIntent,
  updateStripeSetupIntent,
} from '../api/endpoints/payments';

interface StripePaymentUpdateOptions {
  guestEmail?: string;
  saveCard?: boolean;
  rewardAmount?: number;
}

export type StripePaymentFinalizeOptions =
  | {
      cardUuid: string;
    }
  | {
      saveCard?: boolean;
      email?: string;
    };

export interface StripePayment {
  initialize: () => Promise<{ status: number; token: string | undefined }>;
  update: (
    options: StripePaymentUpdateOptions
  ) => Promise<newnewapi.UpdateStripeSetupIntentResponse.Status>;
  finalize: (options: StripePaymentFinalizeOptions) => Promise<number>;
  getStripeToken: () => string | undefined;
}

export function createStripePaymentMC(
  createStripeRequest: () => newnewapi.CreateStripeSetupIntentRequest
): StripePayment {
  let stripeToken: string | undefined = undefined;
  let finished: boolean = false;

  async function initialize() {
    if (stripeToken) {
      throw new Error("Can't initialize already initialized payment");
    }

    const payload = createStripeRequest();
    const initResponse = await createStripeSetupIntent(payload);

    if (initResponse.data?.stripeSetupIntentClientSecret) {
      stripeToken = initResponse.data?.stripeSetupIntentClientSecret;
    }

    if (!initResponse.data?.status) {
      throw new Error(initResponse.error?.message || 'Some error occurred');
    }

    return {
      status: initResponse.data.status,
      token: stripeToken,
    };
  }

  async function update(options: {
    guestEmail?: string;
    saveCard?: boolean;
  }): Promise<newnewapi.UpdateStripeSetupIntentResponse.Status> {
    if (!stripeToken) {
      throw Error("Can't update non initialized payment");
    }

    if (finished) {
      throw Error("Can't update already finished payment");
    }

    const updateStripeSetupIntentRequest =
      new newnewapi.UpdateStripeSetupIntentRequest({
        stripeSetupIntentClientSecret: stripeToken,
        ...options,
      });

    const res = await updateStripeSetupIntent(updateStripeSetupIntentRequest);

    if (!res.data?.status) {
      throw new Error('API returned no status');
    }

    return res.data.status;
  }

  async function finalize(options: StripePaymentFinalizeOptions) {
    const stripeContributionRequest = new newnewapi.StripeContributionRequest({
      stripeSetupIntentClientSecret: stripeToken,
      ...options,
    });

    const res = await voteOnPost(stripeContributionRequest);

    if (!res.data?.status) {
      throw new Error(res.error?.message || 'Request filed');
    }

    return res.data.status;
  }

  function getStripeToken() {
    return stripeToken;
  }

  return {
    initialize,
    update,
    finalize,
    getStripeToken,
  };
}

/*
const payload = new newnewapi.CreateStripeSetupIntentRequest({
          subscribeToCreatorUuid: user.uuid,
        });
        // INIT
        const response = await createStripeSetupIntent(payload); 

const placeBidRequest = new newnewapi.PlaceBidRequest({
        postUuid: postId,
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(supportBidAmount) * 100,
        }),
        optionId: option.id,
      });

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        acBidRequest: placeBidRequest,
        ...(!user.loggedIn ? { guestEmail: '' } : {}),
        ...(!user.loggedIn
          ? { successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}` }
          : {}),
      });
      // INIT
      const response = await createStripeSetupIntent(payload);
      
const doPledgeRequest = new newnewapi.DoPledgeRequest({
        postUuid: post.postUuid,
        amount: new newnewapi.MoneyAmount({
          usdCents: parseInt(pledgeAmount ? pledgeAmount?.toString() : '0'),
        }),
      });

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        ...(!user.loggedIn ? { guestEmail: '' } : {}),
        ...(!user.loggedIn
          ? {
              successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${post.postUuid}`,
            }
          : {}),
        cfPledgeRequest: doPledgeRequest,
      });
      // INIT
      const response = await createStripeSetupIntent(payload);


const voteOnPostRequest = new newnewapi.VoteOnPostRequest({
        postUuid: postId,
        votesCount: parseInt(supportBidAmount),
        optionId: option.id,
      });

      const payload = new newnewapi.CreateStripeSetupIntentRequest({
        ...(!user.loggedIn ? { guestEmail: '' } : {}),
        ...(!user.loggedIn
          ? { successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}` }
          : {}),
        mcVoteRequest: voteOnPostRequest,
      });
      // INIT
      const response = await createStripeSetupIntent(payload);

      */

/*export async function createSubscriptionStripePayment(
  userId: string
): Promise<StripePayment<newnewapi.SubscribeToCreatorResponse.Status>> {
  let stripeToken: string | undefined = undefined;
  let finished: boolean = false;

  async function initialize() {
    const payload = new newnewapi.CreateStripeSetupIntentRequest({
      subscribeToCreatorUuid: userId,
    });

    const initResponse = await createStripeSetupIntent(payload);

    if (
      initResponse.error ||
      !initResponse.data?.stripeSetupIntentClientSecret
    ) {
      throw new Error(initResponse.error?.message || 'Some error occurred');
    }

    stripeToken = initResponse.data.stripeSetupIntentClientSecret;
  }

  async function update(options: {
    guestEmail?: string;
    saveCard?: boolean;
  }): Promise<newnewapi.UpdateStripeSetupIntentResponse.Status> {
          if (!stripeToken) {
        throw Error("Can't update non initialized payment");
      }

    if (finished) {


      throw Error("Can't update already finished payment");
    }

    const updateStripeSetupIntentRequest =
      new newnewapi.UpdateStripeSetupIntentRequest({
        stripeSetupIntentClientSecret: stripeToken,
        ...options,
      });

    const res = await updateStripeSetupIntent(updateStripeSetupIntentRequest);

    if (!res.data?.status) {
      throw new Error('API returned no status');
    }

    return res.data.status;
  }

  async function finalize(
    cardUuid: string,
    saveCard?: boolean
  ): Promise<newnewapi.SubscribeToCreatorResponse.Status> {
    if (!stripeToken) {
      throw Error("Can't finalize non initialized payment");
    }
    finished = true;
    const stripeContributionRequest = new newnewapi.StripeContributionRequest({
      stripeSetupIntentClientSecret: stripeToken,
      cardUuid,
      ...(saveCard !== undefined
        ? {
            saveCard,
          }
        : {}),
    });

    const res = await subscribeToCreator(stripeContributionRequest);

    if (!res.data?.status) {
      throw new Error(res.error?.message);
    }

    return res.data.status;
  }

  return {
    initialize,
    update,
    finalize,
  };
}*/
