import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CROWDFUNDING = `${BASE_URL}/crowdfunding`;

export const fetchTopCrowdfundings = (
  payload: newnewapi.PagedCrowdfundingsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.PagedCrowdfundingsRequest,
    newnewapi.PagedCrowdfundingsResponse
  >({
    reqT: newnewapi.PagedCrowdfundingsRequest,
    resT: newnewapi.PagedCrowdfundingsResponse,
    url: `${BASE_URL_CROWDFUNDING}/get_top_crowdfundings`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchPledges = (
  payload: newnewapi.GetPledgesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetPledgesRequest, newnewapi.GetPledgesResponse>({
    reqT: newnewapi.GetPledgesRequest,
    resT: newnewapi.GetPledgesResponse,
    url: `${BASE_URL_CROWDFUNDING}/get_pledges`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const doPledgeCrowdfunding = (
  payload: newnewapi.StripeContributionRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StripeContributionRequest,
    newnewapi.DoPledgeResponse
  >({
    reqT: newnewapi.StripeContributionRequest,
    resT: newnewapi.DoPledgeResponse,
    url: `${BASE_URL_CROWDFUNDING}/do_pledge`,
    payload,
    ...(signal ? { signal } : {}),
  });
