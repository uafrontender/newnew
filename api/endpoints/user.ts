import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_USER = `${BASE_URL}/user`;

export const validateEditProfileTextFields = (
  payload: newnewapi.ValidateTextRequest,
  token: string,
) => fetchProtobuf<newnewapi.ValidateTextRequest, newnewapi.ValidateTextResponse>(
  newnewapi.ValidateTextRequest,
  newnewapi.ValidateTextResponse,
  `${BASE_URL_USER}/validate_text`,
  'post',
  payload,
  {
    'x-auth-token': token,
  },
);

export const updateMe = (
  payload: newnewapi.UpdateMeRequest,
  token: string,
) => fetchProtobuf<newnewapi.UpdateMeRequest, newnewapi.UpdateMeResponse>(
  newnewapi.UpdateMeRequest,
  newnewapi.UpdateMeResponse,
  `${BASE_URL_USER}/update_me`,
  'post',
  payload,
  {
    'x-auth-token': token,
  },
);
