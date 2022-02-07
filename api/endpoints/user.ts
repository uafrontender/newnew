import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
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

// Same endpoint, but different method, for convenience
export const sendVerificationNewEmail = (
  payload: newnewapi.SendVerificationEmailRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.SendVerificationEmailRequest, newnewapi.SendVerificationEmailResponse>(
  newnewapi.SendVerificationEmailRequest,
  newnewapi.SendVerificationEmailResponse,
  `${BASE_URL}/auth/send_verification_email`,
  'post',
  payload,
);

// NB! Maybe the auth should be optional
export const setMyEmail = (
  payload: newnewapi.SetMyEmailRequest,
) => fetchProtobuf<newnewapi.SetMyEmailRequest, newnewapi.SetMyEmailResponse>(
  newnewapi.SetMyEmailRequest,
  newnewapi.SetMyEmailResponse,
  `${BASE_URL_USER}/set_my_email`,
  'post',
  payload,
  // Optional authentication
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
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

export const becomeCreator = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.EmptyRequest, newnewapi.BecomeCreatorResponse>(
  newnewapi.EmptyRequest,
  newnewapi.BecomeCreatorResponse,
  `${BASE_URL_USER}/become_creator`,
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

export const markUser = (
  payload: newnewapi.MarkUserRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.MarkUserRequest, newnewapi.EmptyResponse>(
  newnewapi.MarkUserRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_USER}/mark_user`,
  'post',
  payload,
);

export const getCreatorsIFollow = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.GetCreatorsIFollowResponse>(
  newnewapi.EmptyRequest,
  newnewapi.GetCreatorsIFollowResponse,
  `${BASE_URL_USER}/get_creators_i_follow`,
  'post',
  payload,
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
