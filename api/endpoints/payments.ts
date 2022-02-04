import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_PAYMENTS = `${BASE_URL}/payments`;

export const getSupportedCreatorCountries = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobuf<
newnewapi.EmptyRequest, newnewapi.GetSupportedCreatorCountriesResponse>(
  newnewapi.EmptyRequest,
  newnewapi.GetSupportedCreatorCountriesResponse,
  `${BASE_URL_PAYMENTS}/get_supported_creator_countries`,
  'post',
  payload,
);

// Subscriptions
export const subscribeToCreator = (
  payload: newnewapi.SubscribeToCreatorRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.SubscribeToCreatorRequest, newnewapi.SubscribeToCreatorResponse>(
  newnewapi.SubscribeToCreatorRequest,
  newnewapi.SubscribeToCreatorResponse,
  `${BASE_URL_PAYMENTS}/subscribe_to_creator`,
  'post',
  payload,
);

export const unsubscribeFromCreator = (
  payload: newnewapi.UnsubscribeFromCreatorRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.UnsubscribeFromCreatorRequest, newnewapi.UnsubscribeFromCreatorResponse>(
  newnewapi.UnsubscribeFromCreatorRequest,
  newnewapi.UnsubscribeFromCreatorResponse,
  `${BASE_URL_PAYMENTS}/unsubscribe_from_creator`,
  'post',
  payload,
);

export const getSubscriptionStatus = (
  payload: newnewapi.SubscriptionStatusRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.SubscriptionStatusRequest, newnewapi.SubscriptionStatusResponse>(
  newnewapi.SubscriptionStatusRequest,
  newnewapi.SubscriptionStatusResponse,
  `${BASE_URL_PAYMENTS}/get_subscription_status`,
  'post',
  payload,
);

// Payments
