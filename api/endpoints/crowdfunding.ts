import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_CROWDFUNDING = `${BASE_URL}/crowdfunding`;

export const fetchTopCrowdfundings = (
  payload: newnewapi.PagedCrowdfundingsRequest
) =>
  fetchProtobuf<
    newnewapi.PagedCrowdfundingsRequest,
    newnewapi.PagedCrowdfundingsResponse
  >(
    newnewapi.PagedCrowdfundingsRequest,
    newnewapi.PagedCrowdfundingsResponse,
    `${BASE_URL_CROWDFUNDING}/get_top_crowdfundings`,
    'post',
    payload
  );

export const fetchPledges = (payload: newnewapi.GetPledgesRequest) =>
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
      : {}
  );

export const fetchPledgeLevels = (payload: newnewapi.EmptyRequest) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.StandardPledgeAmounts>(
    newnewapi.EmptyRequest,
    newnewapi.StandardPledgeAmounts,
    `${BASE_URL_CROWDFUNDING}/get_pledge_levels`,
    'post',
    payload
  );

export const doPledgeCrowdfunding = (
  payload: newnewapi.FulfillPaymentPurposeRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.FulfillPaymentPurposeRequest,
    newnewapi.DoPledgeResponse
  >(
    newnewapi.FulfillPaymentPurposeRequest,
    newnewapi.DoPledgeResponse,
    `${BASE_URL_CROWDFUNDING}/do_pledge`,
    'post',
    payload
  );

export const doPledgeWithWallet = (payload: newnewapi.DoPledgeRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DoPledgeRequest,
    newnewapi.DoPledgeResponse
  >(
    newnewapi.DoPledgeRequest,
    newnewapi.DoPledgeResponse,
    `${BASE_URL_CROWDFUNDING}/do_pledge_with_wallet`,
    'post',
    payload
  );
