import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_USER = `${BASE_URL}/user`;

// Own data
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

// Other users
export const getUserByUsername = (
  payload: newnewapi.GetUserRequest,
) => fetchProtobuf<newnewapi.GetUserRequest, newnewapi.User>(
  newnewapi.GetUserRequest,
  newnewapi.User,
  `${BASE_URL_USER}/get_user`,
  'post',
  payload,
);
