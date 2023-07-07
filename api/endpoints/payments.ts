import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_PAYMENTS = `${BASE_URL}/payments`;

export const getSupportedCreatorCountries = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetSupportedCreatorCountriesResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetSupportedCreatorCountriesResponse,
    url: `${BASE_URL_PAYMENTS}/get_supported_creator_countries`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getStripeCustomer = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetStripeCustomerResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetStripeCustomerResponse,
    url: `${BASE_URL_PAYMENTS}/get_stripe_customer`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const createStripeSetupIntent = (
  payload: newnewapi.CreateStripeSetupIntentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CreateStripeSetupIntentRequest,
    newnewapi.CreateStripeSetupIntentResponse
  >({
    reqT: newnewapi.CreateStripeSetupIntentRequest,
    resT: newnewapi.CreateStripeSetupIntentResponse,
    url: `${BASE_URL_PAYMENTS}/create_stripe_setup_intent`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const updateStripeSetupIntent = (
  payload: newnewapi.UpdateStripeSetupIntentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UpdateStripeSetupIntentRequest,
    newnewapi.UpdateStripeSetupIntentResponse
  >({
    reqT: newnewapi.UpdateStripeSetupIntentRequest,
    resT: newnewapi.UpdateStripeSetupIntentResponse,
    url: `${BASE_URL_PAYMENTS}/update_stripe_setup_intent`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Set up Stripe creator account
export const fetchSetStripeLinkCreator = (
  payload: newnewapi.SetupStripeCreatorAccountRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SetupStripeCreatorAccountRequest,
    newnewapi.SetupStripeCreatorAccountResponse
  >({
    reqT: newnewapi.SetupStripeCreatorAccountRequest,
    resT: newnewapi.SetupStripeCreatorAccountResponse,
    url: `${BASE_URL_PAYMENTS}/setup_stripe_creator_account`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyEarnings = (
  payload: newnewapi.GetMyEarningsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMyEarningsRequest,
    newnewapi.GetMyEarningsResponse
  >({
    reqT: newnewapi.GetMyEarningsRequest,
    resT: newnewapi.GetMyEarningsResponse,
    url: `${BASE_URL_PAYMENTS}/get_my_earnings`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyTransactions = (
  payload: newnewapi.GetMyTransactionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMyTransactionsRequest,
    newnewapi.GetMyTransactionsResponse
  >({
    reqT: newnewapi.GetMyTransactionsRequest,
    resT: newnewapi.GetMyTransactionsResponse,
    url: `${BASE_URL_PAYMENTS}/get_my_transactions`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyEarningsByPosts = (
  payload: newnewapi.GetMyEarningsByPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMyEarningsByPostsRequest,
    newnewapi.GetMyEarningsByPostsResponse
  >({
    reqT: newnewapi.GetMyEarningsByPostsRequest,
    resT: newnewapi.GetMyEarningsByPostsResponse,
    url: `${BASE_URL_PAYMENTS}/get_my_earnings_by_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMySpending = (
  payload: newnewapi.GetMySpendingRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMySpendingRequest,
    newnewapi.GetMySpendingResponse
  >({
    reqT: newnewapi.GetMySpendingRequest,
    resT: newnewapi.GetMySpendingResponse,
    url: `${BASE_URL_PAYMENTS}/get_my_spending`,
    payload,
    ...(signal ? { signal } : {}),
  });
