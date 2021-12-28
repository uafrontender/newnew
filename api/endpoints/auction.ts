import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_AUCTION = `${BASE_URL}/auction`;

export const fetchLiveAuctions = (
  payload: newnewapi.PagedRequest,
) => fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedAuctionsResponse>(
  newnewapi.PagedRequest,
  newnewapi.PagedAuctionsResponse,
  `${BASE_URL_AUCTION}/get_live_auctions`,
  'post',
  payload,
);

export const fetchCurrentBidsForPost = (
  payload: newnewapi.GetAcOptionsRequest,
) => fetchProtobuf<newnewapi.GetAcOptionsRequest, newnewapi.GetAcOptionsResponse>(
  newnewapi.GetAcOptionsRequest,
  newnewapi.GetAcOptionsResponse,
  `${BASE_URL_AUCTION}/get_ac_options`,
  'post',
  payload,
  // Optional authentication to get indidualized list of options
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

export const fetchBidsForOption = (
  payload: newnewapi.GetAcBidsRequest,
) => fetchProtobuf<newnewapi.GetAcBidsRequest, newnewapi.GetAcBidsResponse>(
  newnewapi.GetAcBidsRequest,
  newnewapi.GetAcBidsResponse,
  `${BASE_URL_AUCTION}/get_ac_bids`,
  'post',
  payload,
);

export const fetchAcOptionById = (
  payload: newnewapi.GetAcOptionRequest,
) => fetchProtobuf<newnewapi.GetAcOptionRequest, newnewapi.GetAcOptionResponse>(
  newnewapi.GetAcOptionRequest,
  newnewapi.GetAcOptionResponse,
  `${BASE_URL_AUCTION}/get_ac_option`,
  'post',
  payload,
  // Optional authentication to get indidualized list of options
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

export const placeBidOnAuction = (
  payload: newnewapi.PlaceBidRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.PlaceBidRequest, newnewapi.PlaceBidResponse>(
  newnewapi.PlaceBidRequest,
  newnewapi.PlaceBidResponse,
  `${BASE_URL_AUCTION}/place_bid`,
  'post',
  payload,
);
