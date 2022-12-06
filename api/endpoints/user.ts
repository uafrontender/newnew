import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
  TTokenCookie,
} from '../apiConfigs';

const BASE_URL_USER = `${BASE_URL}/user`;

// Own data
export const validateUsernameTextField = (
  payload: newnewapi.ValidateUsernameRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.ValidateUsernameRequest,
    newnewapi.ValidateUsernameResponse
  >(
    newnewapi.ValidateUsernameRequest,
    newnewapi.ValidateUsernameResponse,
    `${BASE_URL_USER}/validate_username`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMe = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMeResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMeResponse,
    `${BASE_URL_USER}/get_me`,
    'post',
    payload,
    signal ?? undefined
  );

export const updateMe = (
  payload: newnewapi.UpdateMeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.UpdateMeRequest,
    newnewapi.UpdateMeResponse
  >(
    newnewapi.UpdateMeRequest,
    newnewapi.UpdateMeResponse,
    `${BASE_URL_USER}/update_me`,
    'post',
    payload,
    signal ?? undefined
  );

// Same endpoint, but different method, for convenience
export const sendVerificationNewEmail = (
  payload: newnewapi.SendVerificationEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SendVerificationEmailRequest,
    newnewapi.SendVerificationEmailResponse
  >(
    newnewapi.SendVerificationEmailRequest,
    newnewapi.SendVerificationEmailResponse,
    `${BASE_URL}/auth/send_verification_email`,
    'post',
    payload,
    signal ?? undefined
  );

export const confirmMyEmail = (
  payload: newnewapi.ConfirmMyEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.ConfirmMyEmailRequest,
    newnewapi.ConfirmMyEmailResponse
  >(
    newnewapi.ConfirmMyEmailRequest,
    newnewapi.ConfirmMyEmailResponse,
    `${BASE_URL_USER}/confirm_my_email`,
    'post',
    payload,
    signal ?? undefined
  );

// NB! Maybe the auth should be optional
export const setMyEmail = (
  payload: newnewapi.SetMyEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetMyEmailRequest, newnewapi.SetMyEmailResponse>(
    newnewapi.SetMyEmailRequest,
    newnewapi.SetMyEmailResponse,
    `${BASE_URL_USER}/set_my_email`,
    'post',
    payload,
    // Optional authentication
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const acceptCreatorTerms = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/accept_creator_terms`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyOnboardingState = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMyOnboardingStateResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMyOnboardingStateResponse,
    `${BASE_URL_USER}/get_my_onboarding_state`,
    'post',
    payload,
    signal ?? undefined
  );

export const becomeCreator = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.BecomeCreatorResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.BecomeCreatorResponse,
    `${BASE_URL_USER}/become_creator`,
    'post',
    payload,
    signal ?? undefined
  );

export const logout = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/log_out`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyPosts = (
  payload: newnewapi.GetRelatedToMePostsRequest,
  signal?: RequestInit['signal'],
  tokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetRelatedToMePostsRequest,
    newnewapi.PagedCountedPostsResponse
  >(
    newnewapi.GetRelatedToMePostsRequest,
    newnewapi.PagedCountedPostsResponse,
    `${BASE_URL}/post/get_related_to_me_posts`,
    'post',
    payload,
    signal ?? undefined,
    tokens,
    updateCookieServerSideCallback
  );

export const markUser = (
  payload: newnewapi.MarkUserRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkUserRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkUserRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/mark_user`,
    'post',
    payload,
    signal ?? undefined
  );

export const getCreatorsIFollow = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsIFollowResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsIFollowResponse,
    `${BASE_URL_USER}/get_creators_i_follow`,
    'post',
    payload,
    signal ?? undefined
  );

// Other users
export const getUserByUsername = (
  payload: newnewapi.GetUserRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetUserRequest, newnewapi.User>(
    newnewapi.GetUserRequest,
    newnewapi.User,
    `${BASE_URL_USER}/get_user`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

// Creator tags
export const getAvailableCreatorTags = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.CreatorTags>(
    newnewapi.EmptyRequest,
    newnewapi.CreatorTags,
    `${BASE_URL_USER}/get_available_creator_tags`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const setMyCreatorTags = (
  payload: newnewapi.SetMyCreatorTagsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetMyCreatorTagsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetMyCreatorTagsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/set_my_creator_tags`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyCreatorTags = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.CreatorTags
  >(
    newnewapi.EmptyRequest,
    newnewapi.CreatorTags,
    `${BASE_URL_USER}/get_my_creator_tags`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyBlockedUsers = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMyBlockedUsersResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMyBlockedUsersResponse,
    `${BASE_URL_USER}/get_my_blocked_users`,
    'post',
    payload,
    signal ?? undefined
  );

export const getTutorialsStatus = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetTutorialsStatusResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetTutorialsStatusResponse,
    `${BASE_URL_USER}/get_tutorials_status`,
    'post',
    payload,
    signal ?? undefined
  );

export const markTutorialStepAsCompleted = (
  payload: newnewapi.MarkTutorialStepAsCompletedRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkTutorialStepAsCompletedRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkTutorialStepAsCompletedRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/mark_tutorial_step_as_completed`,
    'post',
    payload,
    signal ?? undefined
  );

export const deleteMyAccount = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/delete_my_account`,
    'post',
    payload,
    signal ?? undefined
  );

export const setMyTimezone = (
  payload: newnewapi.SetMyTimeZoneRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetMyTimeZoneRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetMyTimeZoneRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_USER}/set_my_timezone`,
    'post',
    payload,
    signal ?? undefined
  );
