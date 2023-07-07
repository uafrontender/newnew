import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_MULTICHOICE = `${BASE_URL}/multiple_choice`;

export const fetchTopMultipleChoices = (
  payload: newnewapi.PagedMultipleChoicesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedMultipleChoicesRequest,
    newnewapi.PagedMultipleChoicesResponse
  >({
    reqT: newnewapi.PagedMultipleChoicesRequest,
    resT: newnewapi.PagedMultipleChoicesResponse,
    url: `${BASE_URL_MULTICHOICE}/get_top_multiple_choices`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchCurrentOptionsForMCPost = (
  payload: newnewapi.GetMcOptionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMcOptionsRequest, newnewapi.GetMcOptionsResponse>({
    reqT: newnewapi.GetMcOptionsRequest,
    resT: newnewapi.GetMcOptionsResponse,
    url: `${BASE_URL_MULTICHOICE}/get_mc_options`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMcOption = (
  payload: newnewapi.GetMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMcOptionRequest, newnewapi.GetMcOptionResponse>({
    reqT: newnewapi.GetMcOptionRequest,
    resT: newnewapi.GetMcOptionResponse,
    url: `${BASE_URL_MULTICHOICE}/get_mc_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const voteOnPost = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StripeContributionRequest,
    newnewapi.VoteOnPostResponse
  >({
    reqT: newnewapi.StripeContributionRequest,
    resT: newnewapi.VoteOnPostResponse,
    url: `${BASE_URL_MULTICHOICE}/vote_on_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const createCustomOption = (
  payload: newnewapi.CreateCustomMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CreateCustomMcOptionRequest,
    newnewapi.CreateCustomMcOptionResponse
  >({
    reqT: newnewapi.CreateCustomMcOptionRequest,
    resT: newnewapi.CreateCustomMcOptionResponse,
    url: `${BASE_URL_MULTICHOICE}/create_custom_mc_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const canCreateCustomOption = (
  payload: newnewapi.CanCreateCustomMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CanCreateCustomMcOptionRequest,
    newnewapi.CanCreateCustomMcOptionResponse
  >({
    reqT: newnewapi.CanCreateCustomMcOptionRequest,
    resT: newnewapi.CanCreateCustomMcOptionResponse,
    url: `${BASE_URL_MULTICHOICE}/can_create_custom_mc_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const voteWithBundleVotes = (
  payload: newnewapi.VoteOnPostRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.VoteOnPostRequest, newnewapi.VoteOnPostResponse>({
    reqT: newnewapi.VoteOnPostRequest,
    resT: newnewapi.VoteOnPostResponse,
    url: `${BASE_URL_MULTICHOICE}/use_bundle_votes_on_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteMcOption = (
  payload: newnewapi.DeleteMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteMcOptionRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteMcOptionRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_MULTICHOICE}/delete_mc_option`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const checkCanDeleteMcOption = (
  payload: newnewapi.CanDeleteMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.CanDeleteMcOptionRequest,
    newnewapi.CanDeleteMcOptionResponse
  >({
    reqT: newnewapi.CanDeleteMcOptionRequest,
    resT: newnewapi.CanDeleteMcOptionResponse,
    url: `${BASE_URL_MULTICHOICE}/can_delete_mc_option`,
    payload,
    ...(signal ? { signal } : {}),
  });
