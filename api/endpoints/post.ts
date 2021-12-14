import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (
  payload: newnewapi.CreatePostRequest,
  token: string,
) => fetchProtobuf<newnewapi.CreatePostRequest, newnewapi.Post>(
  newnewapi.CreatePostRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/create_post`,
  'post',
  payload,
  {
    'x-auth-token': token,
  },
);

export const fetchPostByUUID = (
  payload: newnewapi.GetPostRequest,
) => fetchProtobuf<newnewapi.GetPostRequest, newnewapi.Post>(
  newnewapi.GetPostRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/get_post`,
  'post',
  payload,
);

export const fetchUsersPosts = (
  payload: newnewapi.GetTheirPostsRequest,
) => fetchProtobuf<newnewapi.GetTheirPostsRequest, newnewapi.PagedPostsResponse>(
  newnewapi.GetTheirPostsRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL_POST}/get_their_posts`,
  'post',
  payload,
);

export const fetchLiveAuctions = (
  payload: newnewapi.PagedRequest,
) => fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>(
  newnewapi.PagedRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL}/auction/get_live_auctions`,
  'post',
  payload,
);
