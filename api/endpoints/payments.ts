import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_PAYMENTS = `${BASE_URL}/payments`;

export const getSupportedCreatorCountries = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetSupportedCreatorCountriesResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetSupportedCreatorCountriesResponse,
    `${BASE_URL_PAYMENTS}/get_supported_creator_countries`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getStripeCustomer = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetStripeCustomerResponse>(
    newnewapi.EmptyRequest,
    newnewapi.GetStripeCustomerResponse,
    `${BASE_URL_PAYMENTS}/get_stripe_customer`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const createStripeSetupIntent = (
  payload: newnewapi.CreateStripeSetupIntentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CreateStripeSetupIntentRequest,
    newnewapi.CreateStripeSetupIntentResponse
  >(
    newnewapi.CreateStripeSetupIntentRequest,
    newnewapi.CreateStripeSetupIntentResponse,
    `${BASE_URL_PAYMENTS}/create_stripe_setup_intent`,
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

export const updateStripeSetupIntent = (
  payload: newnewapi.UpdateStripeSetupIntentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UpdateStripeSetupIntentRequest,
    newnewapi.UpdateStripeSetupIntentResponse
  >(
    newnewapi.UpdateStripeSetupIntentRequest,
    newnewapi.UpdateStripeSetupIntentResponse,
    `${BASE_URL_PAYMENTS}/update_stripe_setup_intent`,
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

// Set up Stripe creator account
export const fetchSetStripeLinkCreator = (
  payload: newnewapi.SetupStripeCreatorAccountRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetupStripeCreatorAccountRequest,
    newnewapi.SetupStripeCreatorAccountResponse
  >(
    newnewapi.SetupStripeCreatorAccountRequest,
    newnewapi.SetupStripeCreatorAccountResponse,
    `${BASE_URL_PAYMENTS}/setup_stripe_creator_account`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyEarnings = (
  payload: newnewapi.GetMyEarningsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyEarningsRequest,
    newnewapi.GetMyEarningsResponse
  >(
    newnewapi.GetMyEarningsRequest,
    newnewapi.GetMyEarningsResponse,
    `${BASE_URL_PAYMENTS}/get_my_earnings`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyTransactions = (
  payload: newnewapi.GetMyTransactionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyTransactionsRequest,
    newnewapi.GetMyTransactionsResponse
  >(
    newnewapi.GetMyTransactionsRequest,
    newnewapi.GetMyTransactionsResponse,
    `${BASE_URL_PAYMENTS}/get_my_transactions`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyEarningsByPosts = (
  payload: newnewapi.GetMyEarningsByPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyEarningsByPostsRequest,
    newnewapi.GetMyEarningsByPostsResponse
  >(
    newnewapi.GetMyEarningsByPostsRequest,
    newnewapi.GetMyEarningsByPostsResponse,
    `${BASE_URL_PAYMENTS}/get_my_earnings_by_posts`,
    'post',
    payload,
    signal ?? undefined
  );
