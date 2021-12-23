import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
  TTokenCookie,
} from '../apiConfigs';

export const BASE_URL_USER = `${BASE_URL}/user`;

// Own data
export const validateUsernameTextField = (
  payload: newnewapi.ValidateUsernameRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.ValidateUsernameRequest, newnewapi.ValidateUsernameResponse>(
  newnewapi.ValidateUsernameRequest,
  newnewapi.ValidateUsernameResponse,
  `${BASE_URL_USER}/validate_username`,
  'post',
  payload,
);

export const updateMe = (
  payload: newnewapi.UpdateMeRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.UpdateMeRequest, newnewapi.UpdateMeResponse>(
  newnewapi.UpdateMeRequest,
  newnewapi.UpdateMeResponse,
  `${BASE_URL_USER}/update_me`,
  'post',
  payload,
);

export const logout = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.EmptyResponse>(
  newnewapi.EmptyRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_USER}/log_out`,
  'post',
  payload,
);

// Test
export const getMyPosts = (
  payload: newnewapi.GetMyPostsRequest,
  tokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void,
) => fetchProtobufProtectedIntercepted<
newnewapi.GetMyPostsRequest, newnewapi.PagedPostsResponse>(
  newnewapi.GetMyPostsRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL}/post/get_my_posts`,
  'post',
  payload,
  tokens,
  updateCookieServerSideCallback,
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
