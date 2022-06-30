import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  cookiesInstance,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (payload: newnewapi.CreatePostRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.CreatePostRequest,
    newnewapi.Post
  >(
    newnewapi.CreatePostRequest,
    newnewapi.Post,
    `${BASE_URL_POST}/create_post`,
    'post',
    payload,
    signal ?? undefined,
  );

export const setPostThumbnail = (payload: newnewapi.SetPostThumbnailRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SetPostThumbnailRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.SetPostThumbnailRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_POST}/set_post_thumbnail`,
    'post',
    payload,
    signal ?? undefined,
  );

export const markPost = (payload: newnewapi.MarkPostRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkPostRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkPostRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_POST}/mark_post`,
    'post',
    payload,
    signal ?? undefined,
  );

export const deleteMyPost = (payload: newnewapi.DeleteMyPostRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteMyPostRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteMyPostRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_POST}/delete_my_post`,
    'post',
    payload,
    signal ?? undefined,
  );

export const uploadPostResponse = (
  payload: newnewapi.UploadPostResponseRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.UploadPostResponseRequest,
    newnewapi.Post
  >(
    newnewapi.UploadPostResponseRequest,
    newnewapi.Post,
    `${BASE_URL_POST}/upload_post_response`,
    'post',
    payload,
    signal ?? undefined,
  );

export const fetchPostByUUID = (payload: newnewapi.GetPostRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.GetPostRequest, newnewapi.Post>(
    newnewapi.GetPostRequest,
    newnewapi.Post,
    `${BASE_URL_POST}/get_post`,
    'post',
    payload,
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
      'cors',
      'same-origin',
      signal ?? undefined,
  );

export const fetchUsersPosts = (payload: newnewapi.GetUserPostsRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<
    newnewapi.GetUserPostsRequest,
    newnewapi.PagedCountedPostsResponse
  >(
    newnewapi.GetUserPostsRequest,
    newnewapi.PagedCountedPostsResponse,
    `${BASE_URL_POST}/get_user_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

// Fetch posts of different types (mainly, homepage)
export const fetchCuratedPosts = (payload: newnewapi.EmptyRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>(
    newnewapi.EmptyRequest,
    newnewapi.NonPagedPostsResponse,
    `${BASE_URL_POST}/get_curated_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const fetchFeaturedCreatorPosts = (payload: newnewapi.EmptyRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>(
    newnewapi.EmptyRequest,
    newnewapi.NonPagedPostsResponse,
    `${BASE_URL_POST}/get_featured_creators_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const fetchForYouPosts = (payload: newnewapi.PagedRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.PagedRequest,
    newnewapi.PagedPostsResponse
  >(
    newnewapi.PagedRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_POST}/get_for_you_posts`,
    'post',
    payload,
    signal ?? undefined,
  );

export const fetchBiggestPosts = (payload: newnewapi.PagedRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>(
    newnewapi.PagedRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_POST}/get_biggest_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const fetchMoreLikePosts = (payload: newnewapi.GetSimilarPostsRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.GetSimilarPostsRequest, newnewapi.PagedPostsResponse>(
    newnewapi.GetSimilarPostsRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_POST}/get_similar_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const getMyUrgentPosts = (payload: newnewapi.PagedRequest, signal?: RequestInit['signal']) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.PagedRequest,
    newnewapi.PagedPostsResponse
  >(
    newnewapi.PagedRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_POST}/get_my_urgent_posts`,
    'post',
    payload,
    signal ?? undefined,
  );
