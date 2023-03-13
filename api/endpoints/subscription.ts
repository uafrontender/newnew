import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_SUBSCRIPTIONS = `${BASE_URL}/subscription`;

export const subscribeToCreator = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.SubscribeToCreatorResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.SubscribeToCreatorResponse,
    `${BASE_URL_SUBSCRIPTIONS}/subscribe_to_creator`,
    'post',
    payload,
    signal ?? undefined
  );

export const unsubscribeFromCreator = (
  payload: newnewapi.UnsubscribeFromCreatorRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.UnsubscribeFromCreatorRequest,
    newnewapi.UnsubscribeFromCreatorResponse
  >(
    newnewapi.UnsubscribeFromCreatorRequest,
    newnewapi.UnsubscribeFromCreatorResponse,
    `${BASE_URL_SUBSCRIPTIONS}/unsubscribe_from_creator`,
    'post',
    payload,
    signal ?? undefined
  );

// NB! Will be with optional authentication
export const getSubscriptionStatus = (
  payload: newnewapi.SubscriptionStatusRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SubscriptionStatusRequest,
    newnewapi.SubscriptionStatusResponse
  >(
    newnewapi.SubscriptionStatusRequest,
    newnewapi.SubscriptionStatusResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_subscription_status`,
    'post',
    payload,
    // Optional authentication
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getMySubscribers = (
  payload: newnewapi.GetMySubscribersRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMySubscribersRequest,
    newnewapi.GetMySubscribersResponse
  >(
    newnewapi.GetMySubscribersRequest,
    newnewapi.GetMySubscribersResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_my_subscribers`,
    'post',
    payload,
    signal ?? undefined
  );

export const getCreatorsImSubscribedTo = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsImSubscribedToResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsImSubscribedToResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_creators_im_subscribed_to`,
    'post',
    payload,
    signal ?? undefined
  );

// Setting subscription rates
export const getStandardSubscriptionProducts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.StandardSubscriptionProducts>(
    newnewapi.EmptyRequest,
    newnewapi.StandardSubscriptionProducts,
    `${BASE_URL_SUBSCRIPTIONS}/get_standard_subscription_products`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getMySubscriptionProduct = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMySubscriptionProductResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMySubscriptionProductResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_my_subscription_product`,
    'post',
    payload,
    signal ?? undefined
  );

export const setMySubscriptionProduct = (
  payload: newnewapi.SetMySubscriptionProductRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetMySubscriptionProductRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetMySubscriptionProductRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_SUBSCRIPTIONS}/set_my_subscription_product`,
    'post',
    payload,
    signal ?? undefined
  );
