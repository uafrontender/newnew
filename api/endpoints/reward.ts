import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_REWARD = `${BASE_URL}/reward`;

export const getRewards = (
  payload: newnewapi.GetRewardsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
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
