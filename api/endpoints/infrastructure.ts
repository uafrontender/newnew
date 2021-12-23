import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_INFRASTRUCTURE = `${BASE_URL}/infrastructure`;

export const validateText = (
  payload: newnewapi.ValidateTextRequest,
) => fetchProtobuf<
newnewapi.ValidateTextRequest, newnewapi.ValidateTextResponse>(
  newnewapi.ValidateTextRequest,
  newnewapi.ValidateTextResponse,
  `${BASE_URL_INFRASTRUCTURE}/validate_text`,
  'post',
  payload,
);
