import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (
  payload: newnewapi.CreatePostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.CreatePostRequest, newnewapi.Post>(
  newnewapi.CreatePostRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/create_post`,
  'post',
  payload,
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

export const deleteMyPost = (
  payload: newnewapi.DeleteMyPostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.DeleteMyPostRequest, newnewapi.EmptyResponse>(
  newnewapi.DeleteMyPostRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_POST}/cancel_my_post`,
  'post',
  payload,
);

export const uploadPostResponse = (
  payload: newnewapi.UploadPostResponseRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.UploadPostResponseRequest, newnewapi.Post>(
  newnewapi.UploadPostResponseRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/upload_post_response`,
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
  payload: newnewapi.GetUserPostsRequest,
) => fetchProtobuf<newnewapi.GetUserPostsRequest, newnewapi.PagedCountedPostsResponse>(
  newnewapi.GetUserPostsRequest,
  newnewapi.PagedCountedPostsResponse,
  `${BASE_URL_POST}/get_user_posts`,
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
  `${BASE_URL_POST}/get_featured_creators_posts`,
  'post',
  payload,
);

export const fetchForYouPosts = (
  payload: newnewapi.PagedRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>(
  newnewapi.PagedRequest,
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

export const fetchMoreLikePosts = (
  payload: newnewapi.GetSimilarPostsRequest,
) => fetchProtobuf<newnewapi.GetSimilarPostsRequest, newnewapi.PagedPostsResponse>(
  newnewapi.GetSimilarPostsRequest,
  newnewapi.PagedPostsResponse,
  `${BASE_URL_POST}/get_similar_posts`,
  'post',
  payload,
);
