import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_INFRASTRUCTURE = `${BASE_URL}/infrastructure`;

export const validateText = (
  payload: newnewapi.ValidateTextRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.ValidateTextRequest, newnewapi.ValidateTextResponse>({
    reqT: newnewapi.ValidateTextRequest,
    resT: newnewapi.ValidateTextResponse,
    url: `${BASE_URL_INFRASTRUCTURE}/validate_text`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getAppConstants = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetAppConstantsResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetAppConstantsResponse,
    url: `${BASE_URL_INFRASTRUCTURE}/get_app_constants`,
    payload,
    ...(signal ? { signal } : {}),
  });
