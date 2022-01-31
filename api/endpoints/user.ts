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

// NB! Maybe the auth should be optional
export const setMyEmail = (
  payload: newnewapi.SetMyEmailRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.SetMyEmailRequest, newnewapi.SetMyEmailResponse>(
  newnewapi.SetMyEmailRequest,
  newnewapi.SetMyEmailResponse,
  `${BASE_URL_USER}/set_my_email`,
  'post',
  payload,
);

export const acceptCreatorTerms = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.EmptyResponse>(
  newnewapi.EmptyRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_USER}/accept_creator_terms`,
  'post',
  payload,
);

export const getMyOnboardingState = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.EmptyRequest, newnewapi.GetMyOnboardingStateResponse>(
  newnewapi.EmptyRequest,
  newnewapi.GetMyOnboardingStateResponse,
  `${BASE_URL_USER}/get_my_onboarding_state`,
  'post',
  payload,
);

export const fetchSetStripeLinkCreator = (
  payload: newnewapi.SetupStripeCreatorAccountRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.SetupStripeCreatorAccountRequest, newnewapi.SetupStripeCreatorAccountResponse>(
  newnewapi.SetupStripeCreatorAccountRequest,
  newnewapi.SetupStripeCreatorAccountResponse,
  `${BASE_URL_USER}/stripe_connect_setup`,
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
  payload: newnewapi.GetRelatedToMePostsRequest,
  tokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void,
) => fetchProtobufProtectedIntercepted<
newnewapi.GetRelatedToMePostsRequest, newnewapi.PagedCountedPostsResponse>(
  newnewapi.GetRelatedToMePostsRequest,
  newnewapi.PagedCountedPostsResponse,
  `${BASE_URL}/post/get_related_to_me_posts`,
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
