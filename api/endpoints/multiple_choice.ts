import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_MULTICHOICE = `${BASE_URL}/multiple_choice`;

export const fetchTopMultipleChoices = (
  payload: newnewapi.PagedMultipleChoicesRequest,
) => fetchProtobuf<newnewapi.PagedMultipleChoicesRequest, newnewapi.PagedMultipleChoicesResponse>(
  newnewapi.PagedMultipleChoicesRequest,
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
  // Optional authentication to get individualized list of options
  (cookiesInstance.get('accessToken') ? {
    'x-auth-token': cookiesInstance.get('accessToken'),
  } : {}),
);

export const voteOnPost = (
  payload: newnewapi.FulfillPaymentPurposeRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.FulfillPaymentPurposeRequest, newnewapi.VoteOnPostResponse>(
  newnewapi.FulfillPaymentPurposeRequest,
  newnewapi.VoteOnPostResponse,
  `${BASE_URL_MULTICHOICE}/vote_on_post`,
  'post',
  payload,
);

export const voteOnPostWithWallet = (
  payload: newnewapi.VoteOnPostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.VoteOnPostRequest, newnewapi.VoteOnPostResponse>(
  newnewapi.VoteOnPostRequest,
  newnewapi.VoteOnPostResponse,
  `${BASE_URL_MULTICHOICE}/vote_on_post_with_wallet`,
  'post',
  payload,
);
