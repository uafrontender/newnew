import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_CARDS = `${BASE_URL}/card`;

export const getCards = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.NonPagedCardsResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.NonPagedCardsResponse,
    `${BASE_URL_CARDS}/get_cards`,
    'post',
    payload,
    signal ?? undefined
  );

export const setPrimaryCard = (
  payload: newnewapi.SetPrimaryCardRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetPrimaryCardRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetPrimaryCardRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CARDS}/set_primary_card`,
    'post',
    payload,
    signal ?? undefined
  );
