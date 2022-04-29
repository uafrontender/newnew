import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_PAYMENTS = `${BASE_URL}/payments`;

export const getSupportedCreatorCountries = (payload: newnewapi.EmptyRequest) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetSupportedCreatorCountriesResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetSupportedCreatorCountriesResponse,
    `${BASE_URL_PAYMENTS}/get_supported_creator_countries`,
    'post',
    payload
  );

// Payments for bids/pledges/votes via Stripe redirect
export const createPaymentSession = (
  payload: newnewapi.CreatePaymentSessionRequest
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
      : {}
  );

// Set up Stripe creator account
export const fetchSetStripeLinkCreator = (
  payload: newnewapi.SetupStripeCreatorAccountRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetupStripeCreatorAccountRequest,
    newnewapi.SetupStripeCreatorAccountResponse
  >(
    newnewapi.SetupStripeCreatorAccountRequest,
    newnewapi.SetupStripeCreatorAccountResponse,
    `${BASE_URL_PAYMENTS}/setup_stripe_creator_account`,
    'post',
    payload
  );

// Wallet
export const getWalletBalance = (payload: newnewapi.EmptyRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetWalletBalanceResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetWalletBalanceResponse,
    `${BASE_URL_PAYMENTS}/get_wallet_balance`,
    'post',
    payload
  );

export const getTopUpWalletSessionUrl = (
  payload: newnewapi.TopUpWalletRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.TopUpWalletRequest,
    newnewapi.TopUpWalletResponse
  >(
    newnewapi.TopUpWalletRequest,
    newnewapi.TopUpWalletResponse,
    `${BASE_URL_PAYMENTS}/top_up_wallet`,
    'post',
    payload
  );

export const getTopUpWalletWithPaymentPurposeUrl = (
  payload: newnewapi.TopUpWalletWithPurposeRequest
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
      : {}
  );

export const getMyEarnings = (payload: newnewapi.GetMyEarningsRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyEarningsRequest,
    newnewapi.GetMyEarningsResponse
  >(
    newnewapi.GetMyEarningsRequest,
    newnewapi.GetMyEarningsResponse,
    `${BASE_URL_PAYMENTS}/get_my_earnings`,
    'post',
    payload
  );
