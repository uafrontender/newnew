import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_BUNDLE = `${BASE_URL}/bundle`;

export const getMyBundles = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetMyBundlesResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetMyBundlesResponse,
    url: `${BASE_URL_BUNDLE}/get_my_bundles`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const buyCreatorsBundle = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsBundleResponse
  >({
    reqT: newnewapi.StripeContributionRequest,
    resT: newnewapi.BuyCreatorsBundleResponse,
    url: `${BASE_URL_BUNDLE}/buy_creators_bundle`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getBundleStatus = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetBundleStatusResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetBundleStatusResponse,
    url: `${BASE_URL_BUNDLE}/get_bundle_status`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setBundleStatus = (
  payload: newnewapi.SetBundleStatusRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetBundleStatusRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.SetBundleStatusRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_BUNDLE}/set_bundle_status`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyBundleEarnings = (
  payload: newnewapi.GetMyBundleEarningsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMyBundleEarningsRequest,
    newnewapi.GetMyBundleEarningsResponse
  >({
    reqT: newnewapi.GetMyBundleEarningsRequest,
    resT: newnewapi.GetMyBundleEarningsResponse,
    url: `${BASE_URL_BUNDLE}/get_my_bundle_earnings`,
    payload,
    ...(signal ? { signal } : {}),
  });
