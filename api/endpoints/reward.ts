import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_REWARD = `${BASE_URL}/reward`;

export const getReceivedRewards = (signal?: RequestInit['signal']) => {
  const payload = new newnewapi.GetRewardsRequest({
    filter: newnewapi.GetRewardsRequest.Filter.RECEIVED,
    paging: null,
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse
  >(
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse,
    `${BASE_URL_REWARD}/get_rewards`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const getAvailableRewards = (signal?: RequestInit['signal']) => {
  const payload = new newnewapi.GetRewardsRequest({
    filter: newnewapi.GetRewardsRequest.Filter.AVAILABLE,
    paging: null,
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse
  >(
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse,
    `${BASE_URL_REWARD}/get_rewards`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const getGuestRewards = (signal?: RequestInit['signal']) => {
  const payload = new newnewapi.GetRewardsRequest({
    paging: null,
  });

  return fetchProtobuf<
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse
  >(
    newnewapi.GetRewardsRequest,
    newnewapi.GetRewardsResponse,
    `${BASE_URL_REWARD}/get_rewards`,
    'post',
    payload,
    signal ?? undefined
  );
};
