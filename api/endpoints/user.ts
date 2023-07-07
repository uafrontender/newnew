import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf, TTokenCookie } from '../apiConfigs';

const BASE_URL_USER = `${BASE_URL}/user`;

// Own data
export const validateUsernameTextField = (
  payload: newnewapi.ValidateUsernameRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.ValidateUsernameRequest,
    newnewapi.ValidateUsernameResponse
  >({
    reqT: newnewapi.ValidateUsernameRequest,
    resT: newnewapi.ValidateUsernameResponse,
    url: `${BASE_URL_USER}/validate_username`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMe = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetMeResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetMeResponse,
    url: `${BASE_URL_USER}/get_me`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const updateMe = (
  payload: newnewapi.UpdateMeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.UpdateMeRequest, newnewapi.UpdateMeResponse>({
    reqT: newnewapi.UpdateMeRequest,
    resT: newnewapi.UpdateMeResponse,
    url: `${BASE_URL_USER}/update_me`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Same endpoint, but different method, for convenience
export const sendVerificationNewEmail = (
  payload: newnewapi.SendVerificationEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SendVerificationEmailRequest,
    newnewapi.SendVerificationEmailResponse
  >({
    reqT: newnewapi.SendVerificationEmailRequest,
    resT: newnewapi.SendVerificationEmailResponse,
    url: `${BASE_URL}/auth/send_verification_email`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const confirmMyEmail = (
  payload: newnewapi.ConfirmMyEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.ConfirmMyEmailRequest,
    newnewapi.ConfirmMyEmailResponse
  >({
    reqT: newnewapi.ConfirmMyEmailRequest,
    resT: newnewapi.ConfirmMyEmailResponse,
    url: `${BASE_URL_USER}/confirm_my_email`,
    payload,
    ...(signal ? { signal } : {}),
  });

// NB! Maybe the auth should be optional
export const setMyEmail = (
  payload: newnewapi.SetMyEmailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetMyEmailRequest, newnewapi.SetMyEmailResponse>({
    reqT: newnewapi.SetMyEmailRequest,
    resT: newnewapi.SetMyEmailResponse,
    url: `${BASE_URL_USER}/set_my_email`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const acceptCreatorTerms = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/accept_creator_terms`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyOnboardingState = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetMyOnboardingStateResponse>(
    {
      reqT: newnewapi.EmptyRequest,
      resT: newnewapi.GetMyOnboardingStateResponse,
      url: `${BASE_URL_USER}/get_my_onboarding_state`,
      payload,
      ...(signal ? { signal } : {}),
    }
  );

export const becomeCreator = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.BecomeCreatorResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.BecomeCreatorResponse,
    url: `${BASE_URL_USER}/become_creator`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const logout = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/log_out`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyPosts = (
  payload: newnewapi.GetRelatedToMePostsRequest,
  signal?: RequestInit['signal'],
  tokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void
) =>
  fetchProtobuf<
    newnewapi.GetRelatedToMePostsRequest,
    newnewapi.PagedCountedPostsResponse
  >({
    reqT: newnewapi.GetRelatedToMePostsRequest,
    resT: newnewapi.PagedCountedPostsResponse,
    url: `${BASE_URL}/post/get_related_to_me_posts`,
    payload,
    ...(signal ? { signal } : {}),
    serverSideTokens: tokens,
    updateCookieServerSideCallback,
  });

export const markUser = (
  payload: newnewapi.MarkUserRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.MarkUserRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.MarkUserRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/mark_user`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getCreatorsIFollow = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetCreatorsIFollowResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetCreatorsIFollowResponse,
    url: `${BASE_URL_USER}/get_creators_i_follow`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Other users
export const getUserByUsername = (
  payload: newnewapi.GetUserRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetUserRequest, newnewapi.User>({
    reqT: newnewapi.GetUserRequest,
    resT: newnewapi.User,
    url: `${BASE_URL_USER}/get_user`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Creator tags
export const getAvailableCreatorTags = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.CreatorTags>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.CreatorTags,
    url: `${BASE_URL_USER}/get_available_creator_tags`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setMyCreatorTags = (
  payload: newnewapi.SetMyCreatorTagsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetMyCreatorTagsRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.SetMyCreatorTagsRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/set_my_creator_tags`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyCreatorTags = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.CreatorTags>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.CreatorTags,
    url: `${BASE_URL_USER}/get_my_creator_tags`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyBlockedUsers = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetMyBlockedUsersResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetMyBlockedUsersResponse,
    url: `${BASE_URL_USER}/get_my_blocked_users`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getTutorialsStatus = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.GetTutorialsStatusResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetTutorialsStatusResponse,
    url: `${BASE_URL_USER}/get_tutorials_status`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const markTutorialStepAsCompleted = (
  payload: newnewapi.MarkTutorialStepAsCompletedRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.MarkTutorialStepAsCompletedRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.MarkTutorialStepAsCompletedRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/mark_tutorial_step_as_completed`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteMyAccount = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/delete_my_account`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setMyTimeZone = (
  payload: newnewapi.SetMyTimeZoneRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetMyTimeZoneRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.SetMyTimeZoneRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_USER}/set_my_timezone`,
    payload,
    ...(signal ? { signal } : {}),
  });
