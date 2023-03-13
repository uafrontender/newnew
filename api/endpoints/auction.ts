import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_AUCTION = `${BASE_URL}/auction`;

export const fetchLiveAuctions = (
  payload: newnewapi.PagedAuctionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedAuctionsRequest,
    newnewapi.PagedAuctionsResponse
  >(
    newnewapi.PagedAuctionsRequest,
    newnewapi.PagedAuctionsResponse,
    `${BASE_URL_AUCTION}/get_top_auctions`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const fetchCurrentBidsForPost = (
  payload: newnewapi.GetAcOptionsRequest,
  signal?: RequestInit['signal']
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
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const fetchBidsForOption = (
  payload: newnewapi.GetAcBidsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetAcBidsRequest, newnewapi.GetAcBidsResponse>(
    newnewapi.GetAcBidsRequest,
    newnewapi.GetAcBidsResponse,
    `${BASE_URL_AUCTION}/get_ac_bids`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const fetchAcOptionById = (
  payload: newnewapi.GetAcOptionRequest,
  signal?: RequestInit['signal']
) =>
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
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const placeBidOnAuction = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.PlaceBidResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.PlaceBidResponse,
    `${BASE_URL_AUCTION}/place_bid`,
    'post',
    payload,
    signal ?? undefined
  );

export const selectWinningOption = (
  payload: newnewapi.SelectWinningOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SelectWinningOptionRequest,
    newnewapi.Auction
  >(
    newnewapi.SelectWinningOptionRequest,
    newnewapi.Auction,
    `${BASE_URL_AUCTION}/select_winning_option`,
    'post',
    payload,
    signal ?? undefined
  );

export const deleteAcOption = (
  payload: newnewapi.DeleteAcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteAcOptionRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteAcOptionRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_AUCTION}/delete_ac_option`,
    'post',
    payload,
    signal ?? undefined
  );

export const checkCanDeleteAcOption = (
  payload: newnewapi.CanDeleteAcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.CanDeleteAcOptionRequest,
    newnewapi.CanDeleteAcOptionResponse
  >(
    newnewapi.CanDeleteAcOptionRequest,
    newnewapi.CanDeleteAcOptionResponse,
    `${BASE_URL_AUCTION}/can_delete_ac_option`,
    'post',
    payload,
    signal ?? undefined
  );
