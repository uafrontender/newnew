import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  cookiesInstance,
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

// Payments
export const createPaymentSession = (
  payload: newnewapi.CreatePaymentSessionRequest,
) => fetchProtobuf<newnewapi.CreatePaymentSessionRequest, newnewapi.CreatePaymentSessionResponse>(
  newnewapi.CreatePaymentSessionRequest,
  newnewapi.CreatePaymentSessionResponse,
  `${BASE_URL_PAYMENTS}/get_payment_session`,
  'post',
  payload,
  // Optional authentication
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);
