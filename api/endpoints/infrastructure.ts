import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_INFRASTRUCTURE = `${BASE_URL}/infrastructure`;

export const validateText = (
  payload: newnewapi.ValidateTextRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.ValidateTextRequest, newnewapi.ValidateTextResponse>(
    newnewapi.ValidateTextRequest,
    newnewapi.ValidateTextResponse,
    `${BASE_URL_INFRASTRUCTURE}/validate_text`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getAppConstants = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetAppConstantsResponse>(
    newnewapi.EmptyRequest,
    newnewapi.GetAppConstantsResponse,
    `${BASE_URL_INFRASTRUCTURE}/get_app_constants`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );
