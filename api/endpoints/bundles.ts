import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_BUNDLE = `${BASE_URL}/bundle`;

export const getMyBundles = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMyBundlesResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMyBundlesResponse,
    `${BASE_URL_BUNDLE}/get_my_bundles`,
    'post',
    payload,
    signal ?? undefined
  );

export const buyCreatorsBundle = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsBundleResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsBundleResponse,
    `${BASE_URL_BUNDLE}/buy_creators_bundle`,
    'post',
    payload,
    signal ?? undefined
  );

export const getBundleStatus = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetBundleStatusResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetBundleStatusResponse,
    `${BASE_URL_BUNDLE}/get_bundle_status`,
    'post',
    payload,
    signal ?? undefined
  );

export const setBundleStatus = (
  payload: newnewapi.SetBundleStatusRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetBundleStatusRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetBundleStatusRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_BUNDLE}/set_bundle_status`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyBundleEarnings = (
  payload: newnewapi.GetMyBundleEarningsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyBundleEarningsRequest,
    newnewapi.GetMyBundleEarningsResponse
  >(
    newnewapi.GetMyBundleEarningsRequest,
    newnewapi.GetMyBundleEarningsResponse,
    `${BASE_URL_BUNDLE}/get_my_bundle_earnings`,
    'post',
    payload,
    signal ?? undefined
  );
