import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
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

// Payments for bids/pledges/votes via Stripe redirect
export const createPaymentSession = (
  payload: newnewapi.CreatePaymentSessionRequest,
) => fetchProtobuf<newnewapi.CreatePaymentSessionRequest, newnewapi.CreatePaymentSessionResponse>(
  newnewapi.CreatePaymentSessionRequest,
  newnewapi.CreatePaymentSessionResponse,
  `${BASE_URL_PAYMENTS}/get_payment_session`,
  'post',
  payload,
  // Optional authentication
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

// Set up Stripe creator account
export const fetchSetStripeLinkCreator = (
  payload: newnewapi.SetupStripeCreatorAccountRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.SetupStripeCreatorAccountRequest, newnewapi.SetupStripeCreatorAccountResponse>(
  newnewapi.SetupStripeCreatorAccountRequest,
  newnewapi.SetupStripeCreatorAccountResponse,
  `${BASE_URL_PAYMENTS}/setup_stripe_creator_account`,
  'post',
  payload,
);

// Wallet
export const getWalletBalance = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.EmptyRequest, newnewapi.GetWalletBalanceResponse>(
  newnewapi.EmptyRequest,
  newnewapi.GetWalletBalanceResponse,
  `${BASE_URL_PAYMENTS}/get_wallet_balance`,
  'post',
  payload,
);

export const getTopUpWalletSessionUrl = (
  payload: newnewapi.GetTopUpWalletSessionUrlRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.GetTopUpWalletSessionUrlRequest, newnewapi.GetTopUpWalletSessionUrlResponse>(
  newnewapi.GetTopUpWalletSessionUrlRequest,
  newnewapi.GetTopUpWalletSessionUrlResponse,
  `${BASE_URL_PAYMENTS}/get_top_up_wallet_session_url`,
  'post',
  payload,
);

export const getTopUpWalletWithPaymentPurposeUrl = (
  payload: newnewapi.GetTopUpWalletWithPaymentPurposeUrlRequest,
) => fetchProtobuf<
newnewapi.GetTopUpWalletWithPaymentPurposeUrlRequest, newnewapi.GetTopUpWalletWithPaymentPurposeUrlResponse>(
  newnewapi.GetTopUpWalletWithPaymentPurposeUrlRequest,
  newnewapi.GetTopUpWalletWithPaymentPurposeUrlResponse,
  `${BASE_URL_PAYMENTS}/get_top_up_wallet_with_payment_purpose_url`,
  'post',
  payload,
  // Optional authentication
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);
