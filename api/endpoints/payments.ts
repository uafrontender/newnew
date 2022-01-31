import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_PAYMENTS = `${BASE_URL}/payments`;

export const getSupportedCreatorCountries = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobuf<
newnewapi.EmptyRequest, newnewapi.GetSupportedCreatorCountriesResponse>(
  newnewapi.EmptyRequest,
  newnewapi.GetSupportedCreatorCountriesResponse,
  `${BASE_URL_PAYMENTS}/get_supported_creator_countries`,
  'post',
  payload,
);
