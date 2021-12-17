import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
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
