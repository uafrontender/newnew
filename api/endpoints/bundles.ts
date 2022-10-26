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
    `${BASE_URL_BUNDLE}/get_my_packs`,
    'post',
    payload,
    signal ?? undefined
  );

export const buyCreatorsBundles = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsBundleResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsBundleResponse,
    `${BASE_URL_BUNDLE}/buy_creators_pack`,
    'post',
    payload,
    signal ?? undefined
  );
