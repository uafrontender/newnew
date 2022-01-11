import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_MULTICHOICE = `${BASE_URL}/multiple_choice`;

export const fetchTopMultipleChoices = (
  payload: newnewapi.PagedRequest,
) => fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedMultipleChoicesResponse>(
  newnewapi.PagedRequest,
  newnewapi.PagedMultipleChoicesResponse,
  `${BASE_URL_MULTICHOICE}/get_top_multiple_choices`,
  'post',
  payload,
);

export const fetchCurrentOptionsForMCPost = (
  payload: newnewapi.GetMcOptionsRequest,
) => fetchProtobuf<newnewapi.GetMcOptionsRequest, newnewapi.GetMcOptionsResponse>(
  newnewapi.GetMcOptionsRequest,
  newnewapi.GetMcOptionsResponse,
  `${BASE_URL_MULTICHOICE}/get_mc_options`,
  'post',
  payload,
  // Optional authentication to get indidualized list of options
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

export const voteOnPost = (
  payload: newnewapi.VoteOnPostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.VoteOnPostRequest, newnewapi.VoteOnPostResponse>(
  newnewapi.VoteOnPostRequest,
  newnewapi.VoteOnPostResponse,
  `${BASE_URL_MULTICHOICE}/vote_on_post`,
  'post',
  payload,
);
