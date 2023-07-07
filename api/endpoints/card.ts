import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CARDS = `${BASE_URL}/card`;

export const getCards = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedCardsResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.NonPagedCardsResponse,
    url: `${BASE_URL_CARDS}/get_cards`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setPrimaryCard = (
  payload: newnewapi.SetPrimaryCardRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetPrimaryCardRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.SetPrimaryCardRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_CARDS}/set_primary_card`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteCard = (
  payload: newnewapi.DeleteCardRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteCardRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteCardRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_CARDS}/delete_card`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const checkCardStatus = (
  payload: newnewapi.CheckCardStatusRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CheckCardStatusRequest,
    newnewapi.CheckCardStatusResponse
  >({
    reqT: newnewapi.CheckCardStatusRequest,
    resT: newnewapi.CheckCardStatusResponse,
    url: `${BASE_URL_CARDS}/check_card_status`,
    payload,
    ...(signal ? { signal } : {}),
  });
