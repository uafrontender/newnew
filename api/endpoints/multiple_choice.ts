import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_MULTICHOICE = `${BASE_URL}/multiple_choice`;

export const fetchTopMultipleChoices = (
  payload: newnewapi.PagedMultipleChoicesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedMultipleChoicesRequest,
    newnewapi.PagedMultipleChoicesResponse
  >(
    newnewapi.PagedMultipleChoicesRequest,
    newnewapi.PagedMultipleChoicesResponse,
    `${BASE_URL_MULTICHOICE}/get_top_multiple_choices`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const fetchCurrentOptionsForMCPost = (
  payload: newnewapi.GetMcOptionsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMcOptionsRequest, newnewapi.GetMcOptionsResponse>(
    newnewapi.GetMcOptionsRequest,
    newnewapi.GetMcOptionsResponse,
    `${BASE_URL_MULTICHOICE}/get_mc_options`,
    'post',
    payload,
    // Optional authentication to get individualized list of options
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const getMcOption = (
  payload: newnewapi.GetMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMcOptionRequest, newnewapi.GetMcOptionResponse>(
    newnewapi.GetMcOptionRequest,
    newnewapi.GetMcOptionResponse,
    `${BASE_URL_MULTICHOICE}/get_mc_option`,
    'post',
    payload,
    // Optional authentication to get individualized list of options
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const voteOnPost = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.VoteOnPostResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.VoteOnPostResponse,
    `${BASE_URL_MULTICHOICE}/vote_on_post`,
    'post',
    payload,
    signal ?? undefined
  );

export const createCustomOption = (
  payload: newnewapi.CreateCustomMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.CreateCustomMcOptionRequest,
    newnewapi.CreateCustomMcOptionResponse
  >(
    newnewapi.CreateCustomMcOptionRequest,
    newnewapi.CreateCustomMcOptionResponse,
    `${BASE_URL_MULTICHOICE}/create_custom_mc_option`,
    'post',
    payload,
    signal ?? undefined
  );

export const voteWithBundleVotes = (
  payload: newnewapi.VoteOnPostRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.VoteOnPostRequest,
    newnewapi.VoteOnPostResponse
  >(
    newnewapi.VoteOnPostRequest,
    newnewapi.VoteOnPostResponse,
    `${BASE_URL_MULTICHOICE}/use_bundle_votes_on_post`,
    'post',
    payload,
    signal ?? undefined
  );

export const deleteMcOption = (
  payload: newnewapi.DeleteMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteMcOptionRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteMcOptionRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_MULTICHOICE}/delete_mc_option`,
    'post',
    payload,
    signal ?? undefined
  );

export const checkCanDeleteMcOption = (
  payload: newnewapi.CanDeleteMcOptionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.CanDeleteMcOptionRequest,
    newnewapi.CanDeleteMcOptionResponse
  >(
    newnewapi.CanDeleteMcOptionRequest,
    newnewapi.CanDeleteMcOptionResponse,
    `${BASE_URL_MULTICHOICE}/can_delete_mc_option`,
    'post',
    payload,
    signal ?? undefined
  );
