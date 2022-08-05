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
  payload: newnewapi.CompleteDoPledgeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.CompleteDoPledgeRequest,
    newnewapi.DoPledgeResponse
  >(
    newnewapi.CompleteDoPledgeRequest,
    newnewapi.DoPledgeResponse,
    `${BASE_URL_CROWDFUNDING}/do_pledge`,
    'post',
    payload,
    signal ?? undefined
  );

export const doPledgeWithWallet = (
  payload: newnewapi.DoPledgeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DoPledgeRequest,
    newnewapi.DoPledgeResponse
  >(
    newnewapi.DoPledgeRequest,
    newnewapi.DoPledgeResponse,
    `${BASE_URL_CROWDFUNDING}/do_pledge_with_wallet`,
    'post',
    payload,
    signal ?? undefined
  );
