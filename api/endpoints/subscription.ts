import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_SUBSCRIPTIONS = `${BASE_URL}/subscription`;

export const subscribeToCreator = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StripeContributionRequest,
    newnewapi.SubscribeToCreatorResponse
  >({
    reqT: newnewapi.StripeContributionRequest,
    resT: newnewapi.SubscribeToCreatorResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/subscribe_to_creator`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const unsubscribeFromCreator = (
  payload: newnewapi.UnsubscribeFromCreatorRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UnsubscribeFromCreatorRequest,
    newnewapi.UnsubscribeFromCreatorResponse
  >({
    reqT: newnewapi.UnsubscribeFromCreatorRequest,
    resT: newnewapi.UnsubscribeFromCreatorResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/unsubscribe_from_creator`,
    payload,
    ...(signal ? { signal } : {}),
  });

// NB! Will be with optional authentication
export const getSubscriptionStatus = (
  payload: newnewapi.SubscriptionStatusRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SubscriptionStatusRequest,
    newnewapi.SubscriptionStatusResponse
  >({
    reqT: newnewapi.SubscriptionStatusRequest,
    resT: newnewapi.SubscriptionStatusResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/get_subscription_status`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMySubscribers = (
  payload: newnewapi.GetMySubscribersRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMySubscribersRequest,
    newnewapi.GetMySubscribersResponse
  >({
    reqT: newnewapi.GetMySubscribersRequest,
    resT: newnewapi.GetMySubscribersResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/get_my_subscribers`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getCreatorsImSubscribedTo = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsImSubscribedToResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetCreatorsImSubscribedToResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/get_creators_im_subscribed_to`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Setting subscription rates
export const getStandardSubscriptionProducts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.StandardSubscriptionProducts>(
    {
      reqT: newnewapi.EmptyRequest,
      resT: newnewapi.StandardSubscriptionProducts,
      url: `${BASE_URL_SUBSCRIPTIONS}/get_standard_subscription_products`,
      payload,
      ...(signal ? { signal } : {}),
    }
  );

export const getMySubscriptionProduct = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetMySubscriptionProductResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetMySubscriptionProductResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/get_my_subscription_product`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setMySubscriptionProduct = (
  payload: newnewapi.SetMySubscriptionProductRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SetMySubscriptionProductRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.SetMySubscriptionProductRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_SUBSCRIPTIONS}/set_my_subscription_product`,
    payload,
    ...(signal ? { signal } : {}),
  });
