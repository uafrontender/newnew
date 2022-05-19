import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_AUCTION = `${BASE_URL}/auction`;

export const fetchLiveAuctions = (payload: newnewapi.PagedAuctionsRequest) =>
  fetchProtobuf<
    newnewapi.PagedAuctionsRequest,
    newnewapi.PagedAuctionsResponse
  >(
    newnewapi.PagedAuctionsRequest,
    newnewapi.PagedAuctionsResponse,
    `${BASE_URL_AUCTION}/get_top_auctions`,
    'post',
    payload
  );

export const fetchCurrentBidsForPost = (
  payload: newnewapi.GetAcOptionsRequest
) =>
  fetchProtobuf<newnewapi.GetAcOptionsRequest, newnewapi.GetAcOptionsResponse>(
    newnewapi.GetAcOptionsRequest,
    newnewapi.GetAcOptionsResponse,
    `${BASE_URL_AUCTION}/get_ac_options`,
    'post',
    payload,
    // Optional authentication to get individualized list of options
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {}
  );

export const fetchBidsForOption = (payload: newnewapi.GetAcBidsRequest) =>
  fetchProtobuf<newnewapi.GetAcBidsRequest, newnewapi.GetAcBidsResponse>(
    newnewapi.GetAcBidsRequest,
    newnewapi.GetAcBidsResponse,
    `${BASE_URL_AUCTION}/get_ac_bids`,
    'post',
    payload
  );

export const fetchAcOptionById = (payload: newnewapi.GetAcOptionRequest) =>
  fetchProtobuf<newnewapi.GetAcOptionRequest, newnewapi.GetAcOptionResponse>(
    newnewapi.GetAcOptionRequest,
    newnewapi.GetAcOptionResponse,
    `${BASE_URL_AUCTION}/get_ac_option`,
    'post',
    payload,
    // Optional authentication to get individualized list of options
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {}
  );

export const placeBidOnAuction = (
  payload: newnewapi.FulfillPaymentPurposeRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.FulfillPaymentPurposeRequest,
    newnewapi.PlaceBidResponse
  >(
    newnewapi.FulfillPaymentPurposeRequest,
    newnewapi.PlaceBidResponse,
    `${BASE_URL_AUCTION}/place_bid`,
    'post',
    payload
  );

export const placeBidWithWallet = (payload: newnewapi.PlaceBidRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.PlaceBidRequest,
    newnewapi.PlaceBidResponse
  >(
    newnewapi.PlaceBidRequest,
    newnewapi.PlaceBidResponse,
    `${BASE_URL_AUCTION}/place_bid_with_wallet`,
    'post',
    payload
  );

export const selectWinningOption = (
  payload: newnewapi.SelectWinningOptionRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SelectWinningOptionRequest,
    newnewapi.Auction
  >(
    newnewapi.SelectWinningOptionRequest,
    newnewapi.Auction,
    `${BASE_URL_AUCTION}/select_winning_option`,
    'post',
    payload
  );

export const deleteAcOption = (payload: newnewapi.DeleteAcOptionRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteAcOptionRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteAcOptionRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_AUCTION}/delete_ac_option`,
    'post',
    payload
  );
