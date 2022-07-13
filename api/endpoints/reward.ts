import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

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
    `${BASE_URL}/rewards`,
    'post',
    payload,
    signal ?? undefined
  );
