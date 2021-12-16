import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
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

export const markPost = (
  payload: newnewapi.MarkPostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.MarkPostRequest, newnewapi.EmptyResponse>(
  newnewapi.MarkPostRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_POST}/mark_post`,
  'post',
  payload,
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

// Fetch posts of different types (mainly, homepage)
export const fetchCuratedPosts = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>(
  newnewapi.EmptyRequest,
  newnewapi.NonPagedPostsResponse,
  `${BASE_URL_POST}/get_curated_posts`,
  'post',
  payload,
);

export const fetchFeaturedCreatorPosts = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>(
  newnewapi.EmptyRequest,
  newnewapi.NonPagedPostsResponse,
  `${BASE_URL_POST}/get_featured_creator_posts`,
  'post',
  payload,
);

export const fetchForYouPosts = (
  payload: newnewapi.EmptyRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.PagedPostsResponse>(
  newnewapi.EmptyRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL_POST}/get_for_you_posts`,
  'post',
  payload,
);

export const fetchBiggestPosts = (
  payload: newnewapi.PagedRequest,
) => fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>(
  newnewapi.PagedRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL_POST}/get_biggest_posts`,
  'post',
  payload,
);
