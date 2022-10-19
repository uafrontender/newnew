import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_CROWDFUNDING = `${BASE_URL}/crowdfunding`;

export const fetchTopCrowdfundings = (
  payload: newnewapi.PagedCrowdfundingsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedCrowdfundingsRequest,
    newnewapi.PagedCrowdfundingsResponse
  >(
    newnewapi.PagedCrowdfundingsRequest,
    newnewapi.PagedCrowdfundingsResponse,
    `${BASE_URL_CROWDFUNDING}/get_top_crowdfundings`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const fetchPledges = (
  payload: newnewapi.GetPledgesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetPledgesRequest, newnewapi.GetPledgesResponse>(
    newnewapi.GetPledgesRequest,
    newnewapi.GetPledgesResponse,
    `${BASE_URL_CROWDFUNDING}/get_pledges`,
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

export const doPledgeCrowdfunding = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StripeContributionRequest,
    newnewapi.DoPledgeResponse
  >(
    newnewapi.StripeContributionRequest,
    newnewapi.DoPledgeResponse,
    `${BASE_URL_CROWDFUNDING}/do_pledge`,
    'post',
    payload,
    signal ?? undefined
  );
