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

// Payments for bids/pledges/votes via Stripe redirect
export const createPaymentSession = (
  payload: newnewapi.CreatePaymentSessionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CreatePaymentSessionRequest,
    newnewapi.CreatePaymentSessionResponse
  >(
    newnewapi.CreatePaymentSessionRequest,
    newnewapi.CreatePaymentSessionResponse,
    `${BASE_URL_PAYMENTS}/create_payment_session`,
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

// Rewards
export const getRewardBalance = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetRewardBalanceResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetRewardBalanceResponse,
    `${BASE_URL_PAYMENTS}/get_reward_balance`,
    'post',
    payload,
    signal ?? undefined
  );

// Wallet
export const getWalletBalance = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetWalletBalanceResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetWalletBalanceResponse,
    `${BASE_URL_PAYMENTS}/get_wallet_balance`,
    'post',
    payload,
    signal ?? undefined
  );

export const getTopUpWalletSessionUrl = (
  payload: newnewapi.TopUpWalletRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.TopUpWalletRequest,
    newnewapi.TopUpWalletResponse
  >(
    newnewapi.TopUpWalletRequest,
    newnewapi.TopUpWalletResponse,
    `${BASE_URL_PAYMENTS}/top_up_wallet`,
    'post',
    payload,
    signal ?? undefined
  );

export const getTopUpWalletWithPaymentPurposeUrl = (
  payload: newnewapi.TopUpWalletWithPurposeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.TopUpWalletWithPurposeRequest,
    newnewapi.TopUpWalletWithPurposeResponse
  >(
    newnewapi.TopUpWalletWithPurposeRequest,
    newnewapi.TopUpWalletWithPurposeResponse,
    `${BASE_URL_PAYMENTS}/top_up_wallet_with_purpose`,
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
