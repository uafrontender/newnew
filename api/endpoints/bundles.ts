import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_BUNDLE = `${BASE_URL}/pack`;

export const getOfferedBundles = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetOfferedPacksResponse>(
    newnewapi.EmptyRequest,
    newnewapi.GetOfferedPacksResponse,
    `${BASE_URL_BUNDLE}/get_offered_packs`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getMyBundles = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMyPacksResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMyPacksResponse,
    `${BASE_URL_BUNDLE}/get_my_packs`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyBundleForCreator = (
  payload: newnewapi.GetMyPackForCreatorRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyPackForCreatorRequest,
    newnewapi.GetMyPackForCreatorResponse
  >(
    newnewapi.GetMyPackForCreatorRequest,
    newnewapi.GetMyPackForCreatorResponse,
    `${BASE_URL_BUNDLE}/get_my_pack_for_creator`,
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
    newnewapi.BuyCreatorsPackResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.BuyCreatorsPackResponse,
    `${BASE_URL_BUNDLE}/buy_creators_pack`,
    'post',
    payload,
    signal ?? undefined
  );
