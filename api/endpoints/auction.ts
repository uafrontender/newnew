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
  payload: newnewapi.GetCurrentBidsRequest,
) => fetchProtobuf<newnewapi.GetCurrentBidsRequest, newnewapi.GetCurrentBidsResponse>(
  newnewapi.GetCurrentBidsRequest,
  newnewapi.GetCurrentBidsResponse,
  `${BASE_URL_AUCTION}/get_current_bids`,
  'post',
  payload,
  // Optional authentication to get indidualized list of options
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

export const fetchBidsForOption = (
  payload: newnewapi.GetPostAcBidsRequest,
) => fetchProtobuf<newnewapi.GetPostAcBidsRequest, newnewapi.GetPostAcBidsResponse>(
  newnewapi.GetPostAcBidsRequest,
  newnewapi.GetPostAcBidsResponse,
  // Temp name and url
  `${BASE_URL_AUCTION}/get_bids_for_option`,
  'post',
  payload,
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
