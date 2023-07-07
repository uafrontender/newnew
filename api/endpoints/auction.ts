import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_AUCTION = `${BASE_URL}/auction`;

export const fetchLiveAuctions = (
  payload: newnewapi.PagedAuctionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedAuctionsRequest,
    newnewapi.PagedAuctionsResponse
  >({
    reqT: newnewapi.PagedAuctionsRequest,
    resT: newnewapi.PagedAuctionsResponse,
    url: `${BASE_URL_AUCTION}/get_top_auctions`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchCurrentBidsForPost = (
  payload: newnewapi.GetAcOptionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetAcOptionsRequest, newnewapi.GetAcOptionsResponse>({
    reqT: newnewapi.GetAcOptionsRequest,
    resT: newnewapi.GetAcOptionsResponse,
    url: `${BASE_URL_AUCTION}/get_ac_options`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchBidsForOption = (
  payload: newnewapi.GetAcBidsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetAcBidsRequest, newnewapi.GetAcBidsResponse>({
    reqT: newnewapi.GetAcBidsRequest,
    resT: newnewapi.GetAcBidsResponse,
    url: `${BASE_URL_AUCTION}/get_ac_bids`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchAcOptionById = (
  payload: newnewapi.GetAcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetAcOptionRequest, newnewapi.GetAcOptionResponse>({
    reqT: newnewapi.GetAcOptionRequest,
    resT: newnewapi.GetAcOptionResponse,
    url: `${BASE_URL_AUCTION}/get_ac_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const placeBidOnAuction = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StripeContributionRequest,
    newnewapi.PlaceBidResponse
  >({
    reqT: newnewapi.StripeContributionRequest,
    resT: newnewapi.PlaceBidResponse,
    url: `${BASE_URL_AUCTION}/place_bid`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const selectWinningOption = (
  payload: newnewapi.SelectWinningOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SelectWinningOptionRequest, newnewapi.Auction>({
    reqT: newnewapi.SelectWinningOptionRequest,
    resT: newnewapi.Auction,
    url: `${BASE_URL_AUCTION}/select_winning_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteAcOption = (
  payload: newnewapi.DeleteAcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteAcOptionRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteAcOptionRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_AUCTION}/delete_ac_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const checkCanDeleteAcOption = (
  payload: newnewapi.CanDeleteAcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CanDeleteAcOptionRequest,
    newnewapi.CanDeleteAcOptionResponse
  >({
    reqT: newnewapi.CanDeleteAcOptionRequest,
    resT: newnewapi.CanDeleteAcOptionResponse,
    url: `${BASE_URL_AUCTION}/can_delete_ac_option`,
    payload,
    ...(signal ? { signal } : {}),
  });
